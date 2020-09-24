import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { GlitzStatic } from '@glitz/core';
import { isStaticElement, isStaticComponent } from './shared';
import {
  evaluate,
  isRequiresRuntimeResult,
  RequiresRuntimeResult,
  requiresRuntimeResult,
  evaluationCache,
  FunctionWithTsNode,
  staticModuleOverloads,
} from './evaluator';
import { getStaticExports } from './static-module-overloads';

export const glitzModuleName = '@glitz/react';
export const styledName = 'styled';
export const useStyleName = 'useStyle';
const staticThemesName = 'staticThemes';
const themeIdentifierName = '__glitzTheme';
const useGlitzThemeName = 'useGlitzTheme';
const useThemeName = 'useTheme';
const themeIdPropertyName = 'id';

staticModuleOverloads[glitzModuleName] = () => {
  const files: { [moduleName: string]: string } = {};
  files[glitzModuleName + '.ts'] = fs.readFileSync(path.join(__dirname, 'static-glitz.ts')).toString();
  files['shared.ts'] = fs.readFileSync(path.join(__dirname, 'shared.ts')).toString();
  return getStaticExports(glitzModuleName, files);
};

type StaticStyledComponent = {
  componentName: string;
  elementName: string | undefined;
  styles: EvaluatedStyle[];
  parent?: StaticStyledComponent;
};

type EvaluatedStyle = {
  [key: string]: string | number | undefined | (string | number | undefined)[] | EvaluatedStyle;
};

type Severity = 'error' | 'warning' | 'info';

export type Diagnostic = {
  message: string;
  severity: Severity;
  file: string;
  line: number;
  source: string;
  innerDiagnostic?: Diagnostic;
};
type DiagnosticsReporter = (diagnostic: Diagnostic) => unknown;

type StaticStyledComponents = {
  // This contains a mapping of a symbol to a component. The key is a TS symbol instead
  // of the variable name because multiple components with the same name can exist in different
  // scopes in the same file.
  symbolToComponent: Map<ts.Symbol, StaticStyledComponent>;
  // If a component has usage outside of JSX it will exist in this map. Usage outside
  // of JSX is things like `TheComponent.displayName = 'Xyz';` or `doSomething(TheComponent);`
  symbolsWithReferencesOutsideJsx: Map<
    ts.Symbol,
    { component: StaticStyledComponent; references: ts.Node[]; hasBeenReported: boolean }
  >;
  // This is a list of symbols pointing to all components that has been composed
  // using const OtherComp = styled(ThisComponentWillBeInComposedComponentSymbols, {});
  composedComponentSymbols: ts.Symbol[];
};

export type TransformerOptions = {
  mode?: 'development' | 'production';
  staticThemesFile?: string;
  allStylesShouldBeStatic?: boolean;
  diagnosticsReporter?: DiagnosticsReporter;
};

export type StaticTheme = {
  id: string;
} & { [key: string]: any };

type StaticThemes = { [id: string]: StaticTheme } | undefined;

type TransformerContext = {
  program: ts.Program;
  glitz: GlitzStatic;
  staticThemes: StaticThemes;
  passNumber: number;
  currentFile: ts.SourceFile;
  currentNode: ts.Node;
  currentFileShouldBeStatic: boolean;
  staticStyledComponents: StaticStyledComponents;
  staticThemesFile?: string;
  diagnosticsReporter?: DiagnosticsReporter;
  mode?: 'development' | 'production';
  allStylesShouldBeStatic?: boolean;
  tsContext: ts.TransformationContext;
  currentFileUsesGlitzThemes: boolean;
  currentFileHasImportedUseTheme: boolean;
  /**
   * Instead of directly returning a different node in the visitor function we keep
   * a map of nodes that should be transformed. This allows any function that has
   * access to the transformer context to create transformations at any level
   * instead of being limited to only transforming the current node.
   *
   * Note that we don't return transformations in this map on the first pass of the file.
   * This to make it possible to remove nodes from the map if we later determine that
   * a transformation is not safe to do.
   *
   * Since a node is used as key, it's really important to use `ts.getOriginalNode(node)`
   * instead of just `node` since it's not certain that the node passed in is the same object.
   */
  transformations: Map<ts.Node, ts.Node>;
  /**
   * This can be used as a way of setting flags to make sure that we don't run the same
   * transformations multiple times.
   */
  nodeFlags: Map<ts.Node, string[]>;
};

export function transformer(
  program: ts.Program,
  glitz: GlitzStatic,
  options: TransformerOptions = {},
): ts.TransformerFactory<ts.SourceFile> {
  let staticThemes: StaticThemes;
  if (options.staticThemesFile) {
    staticThemes = getStaticThemes(options.staticThemesFile, program);
  }

  return (context: ts.TransformationContext) => (file: ts.SourceFile) => {
    if (file.fileName === options.staticThemesFile) {
      staticThemes = getStaticThemes(options.staticThemesFile, program);
    }
    if (file.fileName.endsWith('.tsx')) {
      if (file.fileName in evaluationCache) {
        delete evaluationCache[file.fileName];
      }
      if (file.statements.find(s => hasJSDocTag(s, 'glitz-all-dynamic'))) {
        return file;
      }

      const staticStyledComponents: StaticStyledComponents = {
        symbolToComponent: new Map<ts.Symbol, StaticStyledComponent>(),
        symbolsWithReferencesOutsideJsx: new Map<
          ts.Symbol,
          { component: StaticStyledComponent; references: ts.Node[]; hasBeenReported: false }
        >(),
        composedComponentSymbols: [],
      };

      const transformerContext: TransformerContext = Object.assign(
        {
          program,
          glitz,
          staticThemes,
          passNumber: 1,
          staticStyledComponents,
          currentFile: file,
          currentNode: file,
          currentFileShouldBeStatic: !!file.statements.find(s => hasJSDocTag(s, 'glitz-all-static')),
          tsContext: context,
          currentFileUsesGlitzThemes: false,
          currentFileHasImportedUseTheme: false,
          transformations: new Map<ts.Node, ts.Node>(),
          nodeFlags: new Map<ts.Node, string[]>(),
        },
        options,
      );

      const { diagnosticsReporter } = transformerContext;
      transformerContext.diagnosticsReporter = diagnostic => {
        glitz.diagnostics.push(diagnostic);

        if (diagnosticsReporter) {
          diagnosticsReporter(diagnostic);
        }
      };

      // We first make a first pass to gather information about the file and populate `staticStyledComponents`.
      // The reason why we can't do this in a single pass is because we visit the file from top to bottom, and there
      // might be declarations at the bottom of the file that affects the top of the file.
      // The biggest issue here is that styled components are typically declared at the bottom of the file
      // and used in the top of the file, and we need to find the declarations before we can run transformation.
      const firstPassTransformedFile = visitNodeAndChildren(file, context, transformerContext);
      transformerContext.passNumber++;

      let transformedNode = visitNodeAndChildren(firstPassTransformedFile, context, transformerContext);
      transformerContext.passNumber++;

      // We make a third pass if we find components with uses outside of JSX, because we might have
      // made a transformation that we can't really do. Such as this:
      //
      // function MyComponent() {
      //   const x = <Styled />;
      //   window.Styled = Styled;
      //   return x;
      // }
      // const Styled = styled.div({});
      //
      // In our first pass we collect the component declarations, and then in our second
      // pass we replace JSX with static classNames. But since `const x = <Styled />;` comes
      // before `window.Styled = Styled;` we will incorrectly inline it in the second pass
      // and later realize our mistake. This third pass fixes that by bailing on components
      // that are used outside of JSX.
      if (staticStyledComponents.symbolsWithReferencesOutsideJsx.size !== 0) {
        transformedNode = visitNodeAndChildren(firstPassTransformedFile, context, transformerContext);
      }

      return transformedNode;
    } else {
      return file;
    }
  };
}

function visitNodeAndChildren(
  node: ts.SourceFile,
  context: ts.TransformationContext,
  transformerContext: TransformerContext,
): ts.SourceFile;
function visitNodeAndChildren(
  node: ts.Node,
  context: ts.TransformationContext,
  transformerContext: TransformerContext,
): ts.Node | ts.Node[];
function visitNodeAndChildren(
  node: ts.Node,
  context: ts.TransformationContext,
  transformerContext: TransformerContext,
): ts.Node | ts.Node[] {
  transformerContext.currentNode = node;
  const visitedNode = visitNode(node, transformerContext);
  if (visitedNode) {
    if (Array.isArray(visitedNode)) {
      return visitedNode.map(n => {
        return ts.visitEachChild(n, childNode => visitNodeAndChildren(childNode, context, transformerContext), context);
      });
    } else {
      return ts.visitEachChild(
        visitedNode,
        childNode => visitNodeAndChildren(childNode, context, transformerContext),
        context,
      );
    }
  } else {
    return [];
  }
}

function visitNode(node: ts.Node, transformerContext: TransformerContext): ts.Node | ts.Node[] | undefined {
  let result: ts.Node | ts.Node[] | undefined = node;
  const typeChecker = transformerContext.program.getTypeChecker();
  const factory = transformerContext.tsContext.factory;
  const staticStyledComponents = transformerContext.staticStyledComponents;
  const isFirstPass = transformerContext.passNumber === 1;
  const isSecondPass = transformerContext.passNumber === 2;
  const canEvalStyle = (s: EvaluatedStyle) => isEvaluableStyle(s, !!transformerContext.staticThemes);
  const originalNode = ts.getOriginalNode(node);

  if (hasJSDocTag(node, 'glitz-dynamic')) {
    return node;
  }

  // This detects any non JSX usage of a variable pointing to a styled component
  if (ts.isIdentifier(node) && !isStaticComponentVariableUse(node)) {
    const symbol = typeChecker.getSymbolAtLocation(node);
    if (symbol && staticStyledComponents.symbolToComponent.has(symbol)) {
      const component = staticStyledComponents.symbolToComponent.get(symbol)!;
      if (!staticStyledComponents.symbolsWithReferencesOutsideJsx.has(symbol)) {
        staticStyledComponents.symbolsWithReferencesOutsideJsx.set(symbol, {
          component,
          references: [],
          hasBeenReported: false,
        });
      }
      staticStyledComponents.symbolsWithReferencesOutsideJsx.get(symbol)?.references.push(node.parent);
    }
  }

  if (
    isSecondPass &&
    transformerContext.currentFileUsesGlitzThemes &&
    !transformerContext.currentFileHasImportedUseTheme &&
    !!transformerContext.staticThemes &&
    ts.isImportDeclaration(node)
  ) {
    const importClause = factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(
          factory.createIdentifier(useThemeName),
          factory.createIdentifier(useGlitzThemeName),
        ),
      ]),
    );
    const importDecl = factory.createImportDeclaration(
      undefined,
      undefined,
      importClause,
      factory.createStringLiteral(glitzModuleName),
    );
    transformerContext.currentFileHasImportedUseTheme = true;
    result = [node, importDecl];
    if (transformerContext.mode === 'development') {
      const dirname = path.dirname(transformerContext.currentFile.fileName);
      let importPath = path.relative(dirname, transformerContext.staticThemesFile!).replace(/\\/g, '/');
      if (!importPath.startsWith('.')) {
        importPath = './' + importPath;
      }
      const parts = importPath.split('.');
      parts.splice(parts.length - 1, 1);
      importPath = parts.join('.');
      const asyncThemeImport = factory.createExpressionStatement(
        factory.createCallExpression(factory.createIdentifier('import'), undefined, [
          factory.createStringLiteral(importPath),
        ]),
      );
      result.push(asyncThemeImport);
    }
  }

  // This evaluates imported styled components
  if (ts.isImportSpecifier(node) && isFirstPass) {
    if (isComponentName(node.name.text)) {
      const symbol = typeChecker.getSymbolAtLocation(node.name);
      if (symbol) {
        const potentialStyledComponent = evaluate(node.propertyName ?? node.name, transformerContext.program);
        if (isStaticComponent(potentialStyledComponent)) {
          if (potentialStyledComponent.styles.every(canEvalStyle)) {
            const component: StaticStyledComponent = {
              componentName: node.name.text,
              elementName: potentialStyledComponent.elementName,
              styles: potentialStyledComponent.styles,
            };
            staticStyledComponents.symbolToComponent.set(symbol, component);
          } else {
            reportRequiresRuntimeResult(
              'Styled component could not be statically evaluated',
              potentialStyledComponent.styles.filter(isRequiresRuntimeResultOrStyleWithFunction),
              node,
              transformerContext,
            );
          }
        }
        result = node;
      }
    }
  }

  // This collects all compositions of components, that is, calls like this:
  // const Derived = styled(TheComponentToCollect, {color: 'red'});
  //
  // We need to collect that information because we have to bail in some situations
  // if a component has been composed.
  if (
    isFirstPass &&
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.escapedText === styledName &&
    node.arguments.length > 0
  ) {
    const parentComponent = node.arguments[0];
    if (ts.isIdentifier(parentComponent)) {
      const symbol = typeChecker.getSymbolAtLocation(parentComponent);
      if (symbol) {
        staticStyledComponents.composedComponentSymbols.push(symbol);
      }
    }
  }

  if (isFirstPass && ts.isCallExpression(node) && (isStyledCall(node) || isUseStyle(node))) {
    ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, '#__PURE__', false);
  }

  // This is where we either collect or replace/transform a styled component declaration
  // like this:
  // const Styled = styled.div({color: 'red'});
  // or:
  // const Styled = styled(TheParent, {color: 'red'});
  if (ts.isVariableStatement(node)) {
    if (node.declarationList.declarations.length === 1) {
      const declaration = node.declarationList.declarations[0];
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        const componentSymbol = typeChecker.getSymbolAtLocation(declaration.name);
        if (componentSymbol) {
          const componentName = declaration.name.getText();

          if (!isFirstPass) {
            reportUsageOutsideOfJsxIfNeeded(componentSymbol, componentName, transformerContext);
          } else {
            if (ts.isCallExpression(declaration.initializer) && ts.isIdentifier(declaration.name)) {
              // Since some declarations of styled components are complex and look like:
              // const Styled = createComponent();
              // we look at the variable name to see if it's a variable with Pascal case
              // and in that case try to evaluate it to a styled component.
              if (isComponentName(componentName)) {
                const object = evaluate(declaration.initializer, transformerContext.program);
                if (isStaticElement(object) || isStaticComponent(object)) {
                  const type = typeChecker.getTypeAtLocation(declaration.initializer.expression);
                  // We can't know which variables are decorators like we can with calls to the styled
                  // function, so we need to determine that by the type name. Note that the type name
                  // in the tests is called StaticDecorator but in the "real" world it's StyledDecorator.
                  if (
                    type.aliasSymbol &&
                    (type.aliasSymbol.escapedName === 'StaticDecorator' ||
                      type.aliasSymbol.escapedName === 'StyledDecorator')
                  ) {
                    ts.addSyntheticLeadingComment(
                      declaration.initializer,
                      ts.SyntaxKind.MultiLineCommentTrivia,
                      '#__PURE__',
                      false,
                    );
                  }

                  if (object.styles.every(canEvalStyle)) {
                    const component = {
                      componentName,
                      elementName: object.elementName,
                      styles: object.styles,
                    };
                    for (const style of object.styles.map(stripUnevaluableProperties)) {
                      transformerContext.glitz.injectStyle(style);
                    }

                    staticStyledComponents.symbolToComponent.set(componentSymbol, component);
                  } else {
                    for (const style of object.styles.map(stripUnevaluableProperties)) {
                      transformerContext.glitz.injectStyle(style);
                    }

                    reportRequiresRuntimeResult(
                      'Styled component could not be statically evaluated',
                      object.styles.filter(isRequiresRuntimeResultOrStyleWithFunction),
                      node,
                      transformerContext,
                    );
                  }
                } else if (requiresRuntimeResult(object) && isStyledCall(declaration.initializer)) {
                  reportRequiresRuntimeResult(
                    'Styled component could not be statically evaluated',
                    object,
                    node,
                    transformerContext,
                  );
                }
              } else if (isUseStyle(declaration.initializer)) {
                const styles = evaluate(declaration.initializer, transformerContext.program);
                if (Array.isArray(styles)) {
                  if (styles.every(canEvalStyle)) {
                    let classNameExpr = getClassNameExpression(styles, transformerContext);
                    if (isRequiresRuntimeResult(classNameExpr)) {
                      reportRequiresRuntimeResult(
                        'Evaluation of theme function requires runtime',
                        classNameExpr,
                        node,
                        transformerContext,
                      );
                    } else {
                      if (ts.isJsxExpression(classNameExpr)) {
                        const innerExpr = classNameExpr.expression;
                        classNameExpr = innerExpr as ts.StringLiteral;
                      }
                      result = factory.createVariableStatement(
                        node.modifiers,
                        factory.createVariableDeclarationList(
                          [
                            factory.createVariableDeclaration(
                              declaration.name,
                              declaration.exclamationToken,
                              declaration.type,
                              classNameExpr,
                            ),
                          ],
                          node.declarationList.flags,
                        ),
                      );
                    }
                  } else {
                    for (const style of styles.map(stripUnevaluableProperties)) {
                      transformerContext.glitz.injectStyle(style);
                    }

                    reportRequiresRuntimeResult(
                      'useStyle() call could not be statically evaluated',
                      styles.filter(isRequiresRuntimeResultOrStyleWithFunction),
                      node,
                      transformerContext,
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  if (
    ts.isJsxSelfClosingElement(node) &&
    ts.isPropertyAccessExpression(node.tagName) &&
    ts.isIdentifier(node.tagName.expression) &&
    node.tagName.expression.escapedText.toString() === styledName &&
    !hasSpreadWithoutCssPropOrAfterCssProp(node.attributes.properties)
  ) {
    // We now know that: node == `<styled.[element name] />`
    const elementName = node.tagName.name.escapedText.toString().toLowerCase();
    const cssData = getCssDataFromCssProp(node, transformerContext);
    if (cssData) {
      if (!isTopLevelJsxInComposedComponent(node, typeChecker, staticStyledComponents)) {
        // Everything is static, replace `<styled.[element name] />` with `<[element name] className="[classes]" />`
        const classNameExpr = getClassNameExpression(cssData, transformerContext);
        if (isRequiresRuntimeResult(classNameExpr)) {
          reportRequiresRuntimeResult(
            'Evaluation of theme function requires runtime',
            classNameExpr,
            node,
            transformerContext,
          );
        } else {
          const jsxElement = factory.createJsxSelfClosingElement(
            factory.createIdentifier(elementName),
            undefined,
            factory.createJsxAttributes([
              ...passThroughProps(node.attributes.properties),
              factory.createJsxAttribute(factory.createIdentifier('className'), classNameExpr),
              ...(transformerContext.mode === 'development'
                ? [
                    factory.createJsxAttribute(
                      factory.createIdentifier('data-glitzname'),
                      factory.createStringLiteral('styled.' + node.tagName.name.escapedText),
                    ),
                  ]
                : []),
            ]),
          );
          ts.setOriginalNode(jsxElement, node);
          transformerContext.transformations.set(originalNode, jsxElement);
          result = node;
        }
      } else {
        if (transformerContext.transformations.has(originalNode)) {
          transformerContext.transformations.delete(originalNode);
        }
        reportTopLevelJsxInComposedComponent(node, transformerContext);
      }
    }
  }

  if (ts.isJsxElement(node)) {
    const openingElement = node.openingElement;
    if (
      ts.isPropertyAccessExpression(openingElement.tagName) &&
      ts.isIdentifier(openingElement.tagName.expression) &&
      openingElement.tagName.expression.escapedText.toString() === styledName &&
      !hasSpreadWithoutCssPropOrAfterCssProp(openingElement.attributes.properties)
    ) {
      // We now know that: node == `<styled.[element name]>[zero or more children]</styled.[element name]>`
      if (!isTopLevelJsxInComposedComponent(node, typeChecker, staticStyledComponents)) {
        const elementName = openingElement.tagName.name.escapedText.toString().toLowerCase();
        const cssData = getCssDataFromCssProp(openingElement, transformerContext);
        if (cssData) {
          const classNameExpr = getClassNameExpression(cssData, transformerContext);
          if (isRequiresRuntimeResult(classNameExpr)) {
            reportRequiresRuntimeResult(
              'Evaluation of theme function requires runtime',
              classNameExpr,
              node,
              transformerContext,
            );
          } else {
            // Everything is static, replace `<[element name] className="[classes]">[zero or more children]</[element name]>`
            const jsxOpeningElement = factory.createJsxOpeningElement(
              factory.createIdentifier(elementName),
              undefined,
              factory.createJsxAttributes([
                ...passThroughProps(node.openingElement.attributes.properties),
                factory.createJsxAttribute(factory.createIdentifier('className'), classNameExpr),
                ...(transformerContext.mode === 'development'
                  ? [
                      factory.createJsxAttribute(
                        factory.createIdentifier('data-glitzname'),
                        factory.createStringLiteral(styledName + '.' + openingElement.tagName.name.escapedText),
                      ),
                    ]
                  : []),
              ]),
            );
            ts.setOriginalNode(jsxOpeningElement, node.openingElement);

            const jsxClosingElement = factory.createJsxClosingElement(factory.createIdentifier(elementName));
            ts.setOriginalNode(jsxClosingElement, node.closingElement);

            const jsxElement = factory.createJsxElement(jsxOpeningElement, node.children, jsxClosingElement);
            ts.setOriginalNode(jsxElement, node);
            transformerContext.transformations.set(originalNode, jsxElement);
          }
        }
      } else {
        if (transformerContext.transformations.has(originalNode)) {
          transformerContext.transformations.delete(originalNode);
        }
        reportTopLevelJsxInComposedComponent(node, transformerContext);
      }
    }

    if (ts.isIdentifier(openingElement.tagName) && ts.isIdentifier(openingElement.tagName)) {
      const jsxTagSymbol = typeChecker.getSymbolAtLocation(openingElement.tagName);
      if (
        jsxTagSymbol &&
        staticStyledComponents.symbolToComponent.has(jsxTagSymbol) &&
        !staticStyledComponents.symbolsWithReferencesOutsideJsx.has(jsxTagSymbol) &&
        !hasSpreadWithoutCssPropOrAfterCssProp(node.openingElement.attributes.properties)
      ) {
        // We now know that: node == `<[styled component name] [zero or more props]>[zero or more children]</[styled component name]>`
        // and we also know that the JSX points to a component that is 100% static
        // and is not referenced outside of JSX.
        if (!isTopLevelJsxInComposedComponent(node, typeChecker, staticStyledComponents)) {
          const cssPropData = getCssDataFromCssProp(openingElement, transformerContext);
          const styledComponent = staticStyledComponents.symbolToComponent.get(jsxTagSymbol)!;
          if (styledComponent.elementName) {
            let styles = styledComponent.styles.filter(style => !!style);
            if (cssPropData) {
              styles = styles.slice();
              styles.push(cssPropData);
            }

            const classNameExpr = getClassNameExpression(styles, transformerContext);
            if (isRequiresRuntimeResult(classNameExpr)) {
              reportRequiresRuntimeResult(
                'Evaluation of theme function requires runtime',
                classNameExpr,
                node,
                transformerContext,
              );
            } else {
              // Everything is static, replace with `<[element name] className="[classes]" [zero or more props]>[zero or more children]</[element name]>`
              const jsxOpeningElement = factory.createJsxOpeningElement(
                factory.createIdentifier(styledComponent.elementName),
                undefined,
                factory.createJsxAttributes([
                  ...passThroughProps(node.openingElement.attributes.properties),
                  factory.createJsxAttribute(factory.createIdentifier('className'), classNameExpr),
                  ...(transformerContext.mode === 'development' && styledComponent.componentName
                    ? [
                        factory.createJsxAttribute(
                          factory.createIdentifier('data-glitzname'),
                          factory.createStringLiteral(styledComponent.componentName),
                        ),
                      ]
                    : []),
                ]),
              );
              ts.setOriginalNode(jsxOpeningElement, node.openingElement);

              const jsxClosingElement = factory.createJsxClosingElement(
                factory.createIdentifier(styledComponent.elementName),
              );
              ts.setOriginalNode(jsxClosingElement, node.closingElement);

              const jsxElement = factory.createJsxElement(jsxOpeningElement, node.children, jsxClosingElement);
              ts.setOriginalNode(jsxElement, node);
              transformerContext.transformations.set(originalNode, jsxElement);
            }
          }
        } else {
          if (transformerContext.transformations.has(originalNode)) {
            transformerContext.transformations.delete(originalNode);
          }
          reportTopLevelJsxInComposedComponent(node, transformerContext);
        }
      }
    }
  }

  if (ts.isJsxSelfClosingElement(node) && ts.isIdentifier(node.tagName)) {
    const jsxTagSymbol = typeChecker.getSymbolAtLocation(node.tagName);
    if (
      jsxTagSymbol &&
      staticStyledComponents.symbolToComponent.has(jsxTagSymbol) &&
      !staticStyledComponents.symbolsWithReferencesOutsideJsx.has(jsxTagSymbol) &&
      !hasSpreadWithoutCssPropOrAfterCssProp(node.attributes.properties)
    ) {
      // We now know that: node == `<[styled component name] [zero or more props] />`
      // and we also know that the JSX points to a component that is 100% static
      // and is not referenced outside of JSX.
      if (!isTopLevelJsxInComposedComponent(node, typeChecker, staticStyledComponents)) {
        const cssPropData = getCssDataFromCssProp(node, transformerContext);
        const styledComponent = staticStyledComponents.symbolToComponent.get(jsxTagSymbol)!;
        if (styledComponent.elementName) {
          let styles = styledComponent.styles.filter(style => !!style);
          if (cssPropData) {
            styles = styles.slice();
            styles.push(cssPropData);
          }

          const classNameExpr = getClassNameExpression(styles, transformerContext);
          if (isRequiresRuntimeResult(classNameExpr)) {
            reportRequiresRuntimeResult(
              'Evaluation of theme function requires runtime',
              classNameExpr,
              node,
              transformerContext,
            );
          } else {
            // Everything is static, replace with `<[element name] className="[classes]" [zero or more props] />`
            const jsxElement = factory.createJsxSelfClosingElement(
              factory.createIdentifier(styledComponent.elementName),
              undefined,
              factory.createJsxAttributes([
                ...passThroughProps(node.attributes.properties),
                factory.createJsxAttribute(factory.createIdentifier('className'), classNameExpr),
                ...(transformerContext.mode === 'development' && styledComponent.componentName
                  ? [
                      factory.createJsxAttribute(
                        factory.createIdentifier('data-glitzname'),
                        factory.createStringLiteral(styledComponent.componentName),
                      ),
                    ]
                  : []),
              ]),
            );
            ts.setOriginalNode(jsxElement, node);
            transformerContext.transformations.set(originalNode, jsxElement);
          }
        }
      } else {
        if (transformerContext.transformations.has(originalNode)) {
          transformerContext.transformations.delete(originalNode);
        }
        reportTopLevelJsxInComposedComponent(node, transformerContext);
      }
    }
  }

  if (!isFirstPass && transformerContext.transformations.has(originalNode)) {
    const previouslyTransformed = transformerContext.transformations.get(originalNode);
    transformerContext.transformations.delete(originalNode);
    return previouslyTransformed;
  }

  return result;
}

// For any node inside a component, traverse up until we find a component declaration
// and return the symbol for it. Used to detect if JSX is inside a component that has been
// composed.
function getComponentSymbol(node: ts.Node, typeChecker: ts.TypeChecker): ts.Symbol | undefined {
  if (!node || ts.isSourceFile(node)) {
    return undefined;
  }
  if (ts.isFunctionDeclaration(node) && node.name) {
    return typeChecker.getSymbolAtLocation(node.name);
  }
  if ((ts.isFunctionExpression(node) || ts.isArrowFunction(node)) && ts.isVariableDeclaration(node.parent)) {
    return typeChecker.getSymbolAtLocation(node.parent.name);
  }
  return getComponentSymbol(node.parent, typeChecker);
}

// For any node inside a component, traverse up until we find a component declaration
// and return the symbol for it. Used to detect if JSX is inside a component that has been
// composed.
function getComponentNode(
  node: ts.Node,
): ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction | undefined {
  if (!node || ts.isSourceFile(node)) {
    return undefined;
  }
  if (ts.isFunctionDeclaration(node)) {
    return node;
  }
  if ((ts.isFunctionExpression(node) || ts.isArrowFunction(node)) && ts.isVariableDeclaration(node.parent)) {
    return node;
  }
  return getComponentNode(node.parent);
}

// Detects if the node is inside a component that is declared inline inside a call to styled, such as:
// const Styled = styled((props) => <styled.Div css={{ color: 'red' }}, { color: 'blue' })
// Used to bail on top level static css inside such components.
function isInsideInlineStyledComponent(node: ts.Node) {
  let func: ts.ArrowFunction | ts.FunctionExpression | undefined;
  while (true) {
    if (ts.isArrowFunction(node)) {
      func = node;
    }
    if (ts.isFunctionExpression(node)) {
      func = node;
    }
    node = node.parent;
    if (!node || ts.isSourceFile(node)) {
      break;
    }
  }
  if (!func) {
    return false;
  }
  if (
    ts.isCallExpression(func.parent) &&
    ts.isIdentifier(func.parent.expression) &&
    func.parent.expression.text === styledName
  ) {
    return true;
  }
  return false;
}

function reportUsageOutsideOfJsxIfNeeded(
  componentSymbol: ts.Symbol,
  componentName: string,
  transformerContext: TransformerContext,
) {
  if (
    transformerContext.diagnosticsReporter &&
    transformerContext.staticStyledComponents.symbolsWithReferencesOutsideJsx.has(componentSymbol)
  ) {
    const outsideJsxUsage = transformerContext.staticStyledComponents.symbolsWithReferencesOutsideJsx.get(
      componentSymbol,
    )!;
    if (!outsideJsxUsage.hasBeenReported) {
      const references = outsideJsxUsage.references;

      for (const reference of references) {
        const sourceFile = reference.getSourceFile();
        const stmt = getStatement(reference);

        transformerContext.diagnosticsReporter({
          file: sourceFile.fileName,
          message: `Component '${componentName}' cannot be statically extracted since it's used outside of JSX`,
          source: stmt.getText(),
          severity: getSeverity(componentSymbol.valueDeclaration, transformerContext),
          line: sourceFile.getLineAndCharacterOfPosition(reference.pos).line,
        });
      }
      outsideJsxUsage.hasBeenReported = true;
    }
  }
}

// If a top level JSX element (that is, the top element returned) in a component
// has been composed we need to bail because Glitz needs the runtime component
// in order to do composition safely. Note that top level is both:
// return <styled.Div ... />;
// as well as:
// return <div><div><styled.Div ... /></div></div>;
// because Glitz will compose with the first styled component it finds.
function isTopLevelJsxInComposedComponent(
  node: ts.Node,
  typeChecker: ts.TypeChecker,
  staticStyledComponents: StaticStyledComponents,
) {
  let parent: ts.Node | undefined = node.parent;
  while (parent) {
    if (ts.isParenthesizedExpression(parent)) {
      parent = parent.parent;
    } else if (
      // Detects if the parent is a simple <div></div> or any other element
      ts.isJsxElement(parent) &&
      ts.isIdentifier(parent.openingElement.tagName) &&
      parent.openingElement.tagName.text === parent.openingElement.tagName.text.toLowerCase()
    ) {
      parent = parent.parent;
    } else {
      break;
    }
  }
  // If we don't have a parent something has removed the node.parent
  // and we bail because we can't be sure
  if (!parent) {
    return true;
  }
  const containingComponentSymbol = getComponentSymbol(node, typeChecker);

  if (!ts.isReturnStatement(parent) && !ts.isArrowFunction(parent)) {
    return false;
  }

  if (
    (containingComponentSymbol &&
      staticStyledComponents.composedComponentSymbols.indexOf(containingComponentSymbol) !== -1) ||
    isInsideInlineStyledComponent(node)
  ) {
    return true;
  }
  return false;
}

function reportTopLevelJsxInComposedComponent(node: ts.Node, transformerContext: TransformerContext) {
  const sourceFile = node.getSourceFile();
  if (transformerContext.diagnosticsReporter) {
    transformerContext.diagnosticsReporter({
      message:
        'Top level styled.[Element] cannot be statically extracted inside components that are decorated by other components',
      file: sourceFile.fileName,
      line: sourceFile.getLineAndCharacterOfPosition(node.pos).line,
      severity: 'info',
      source: node.getText(),
    });
  }
}

// A statement is basically a node that is on its own line, and we sometimes want to traverse up and find the
// node for the whole line because it makes more sense in an error/info message to see a full line than just
// an expression that's part of a line.
function getStatement(node: ts.Node): ts.Node {
  if (!node.parent) {
    return node;
  }
  if (ts.isSourceFile(node.parent)) {
    return node;
  }
  if (ts.isBlock(node.parent)) {
    return node;
  }
  return getStatement(node.parent);
}

// Used to detect if the use of an identifier to a styled component is "safe" from
// a static perspective, or if the use should trigger bailing on extraction.
function isStaticComponentVariableUse(node: ts.Node) {
  const parent = node.parent;
  if (parent) {
    if (ts.isVariableDeclaration(parent)) {
      return true;
    }
    if (ts.isJsxSelfClosingElement(parent)) {
      return true;
    }
    if (ts.isJsxOpeningElement(parent)) {
      return true;
    }
    if (ts.isImportSpecifier(parent)) {
      return true;
    }
    if (ts.isJsxClosingElement(parent)) {
      return true;
    }
    if (ts.isCallExpression(parent)) {
      if (parent.expression.getText() === styledName) {
        return true;
      }
    }
  }
  return false;
}

function reportRequiresRuntimeResult(
  message: string,
  requiresRuntimeResults: RequiresRuntimeResult | RequiresRuntimeResult[] | EvaluatedStyle[],
  node: ts.Node,
  transformerContext: TransformerContext,
) {
  if (!transformerContext.diagnosticsReporter) {
    return;
  }

  for (const result of Array.isArray(requiresRuntimeResults) ? requiresRuntimeResults : [requiresRuntimeResults]) {
    const innerDiagnostics: Diagnostic[] = [];
    let requiresRuntime: RequiresRuntimeResult | undefined;
    const allRequiresRuntime = getAllRequiresRuntimeResult(result);
    if (!allRequiresRuntime.length) {
      const propFunc = anyValuesAreFunctions(result as EvaluatedStyle);
      if (propFunc) {
        if (propFunc) {
          requiresRuntime = requiresRuntimeResult(
            'Functions in style objects requires runtime or statically declared themes',
            (propFunc as FunctionWithTsNode).tsNode ?? node,
          );
        }
      }
    } else {
      requiresRuntime = allRequiresRuntime[0];
    }
    if (requiresRuntime) {
      const requireRuntimeDiagnostics = requiresRuntime.getDiagnostics();
      if (requireRuntimeDiagnostics) {
        innerDiagnostics.push({
          file: requireRuntimeDiagnostics.file,
          line: requireRuntimeDiagnostics.line,
          message: requireRuntimeDiagnostics.message,
          source: requireRuntimeDiagnostics.source,
          severity: getSeverity(requiresRuntime.node ?? node, transformerContext),
        });
      }
    }
    const file = node.getSourceFile();
    for (const innerDiagnostic of innerDiagnostics) {
      transformerContext.diagnosticsReporter({
        message,
        file: file.fileName,
        line: file.getLineAndCharacterOfPosition(node.pos).line,
        source: node.getText(),
        severity: getSeverity(node, transformerContext),
        innerDiagnostic,
      });
    }
  }
}

function hasJSDocTag(node: ts.Node, jsDocTag: string) {
  const jsDoc = (node as any).jsDoc;
  if (jsDoc && Array.isArray(jsDoc)) {
    for (const comment of jsDoc) {
      if (
        comment &&
        comment.tags &&
        Array.isArray(comment.tags) &&
        comment.tags.find((t: ts.JSDocTag) => t.tagName.text === jsDocTag)
      ) {
        return true;
      }
    }
  }
  return false;
}

function getCssData(
  tsStyle: ts.Expression,
  node: ts.Node,
  transformerContext: TransformerContext,
  parentComponent: StaticStyledComponent,
): (EvaluatedStyle | RequiresRuntimeResult)[];
function getCssData(
  tsStyle: ts.Expression,
  node: ts.Node,
  transformerContext: TransformerContext,
): EvaluatedStyle | RequiresRuntimeResult;
function getCssData(
  tsStyle: ts.Expression,
  node: ts.Node,
  transformerContext: TransformerContext,
  parentComponent?: StaticStyledComponent,
): (EvaluatedStyle | RequiresRuntimeResult)[] | EvaluatedStyle | RequiresRuntimeResult {
  const style = evaluate(tsStyle, transformerContext.program) as EvaluatedStyle | RequiresRuntimeResult;
  if (!transformerContext.staticThemes) {
    transformerContext.glitz.injectStyle(stripUnevaluableProperties(style));
  }
  const requiresRuntime = getAllRequiresRuntimeResult(style);
  if (requiresRuntime.length) {
    return requiresRuntime;
  }
  if (!transformerContext.staticThemes) {
    const propFunc = anyValuesAreFunctions(style as EvaluatedStyle);
    if (propFunc) {
      transformerContext.currentFileUsesGlitzThemes = true;
      return requiresRuntimeResult(
        'Functions in style objects requires runtime or statically declared themes',
        (propFunc as FunctionWithTsNode).tsNode ?? node,
      );
    }
  }

  if (parentComponent) {
    return [...parentComponent.styles, style];
  }

  return style;
}

function anyValuesAreFunctions(style: EvaluatedStyle | EvaluatedStyle[]): boolean | FunctionWithTsNode {
  if (style && typeof style === 'object') {
    if (Array.isArray(style)) {
      for (const elem of style) {
        const func = anyValuesAreFunctions(elem);
        if (func) {
          return func;
        }
      }
    } else {
      for (const key in style) {
        if (typeof style[key] === 'function') {
          return (style[key] as unknown) as FunctionWithTsNode;
        } else if (
          style[key] &&
          !isRequiresRuntimeResult(style[key]) &&
          typeof style[key] === 'object' &&
          !Array.isArray(style[key])
        ) {
          const func = anyValuesAreFunctions(style[key] as EvaluatedStyle);
          if (func !== false) {
            return func;
          }
        }
      }
    }
  }
  return false;
}

function getCssDataFromCssProp(
  node: ts.JsxSelfClosingElement | ts.JsxOpeningElement,
  transformerContext: TransformerContext,
) {
  const cssJsxAttr = node.attributes.properties.find(
    p => p.name && ts.isIdentifier(p.name) && p.name.escapedText.toString() === 'css',
  );
  if (
    cssJsxAttr &&
    ts.isJsxAttribute(cssJsxAttr) &&
    cssJsxAttr.initializer &&
    ts.isJsxExpression(cssJsxAttr.initializer) &&
    cssJsxAttr.initializer.expression
  ) {
    const cssData = getCssData(cssJsxAttr.initializer.expression, node, transformerContext);
    if (isEvaluableStyle(cssData, !!transformerContext.staticThemes)) {
      return cssData;
    } else {
      reportRequiresRuntimeResult('css prop could not be statically evaluated', cssData, node, transformerContext);
    }
  }
  return undefined;
}

// This takes the file that contains static themes and trys to evaluate
// an exported array of themes.
// It's very important for the static themes to contain all variations
// so if a theme contains for example a boolean that is determined at runtime
// the static themes must be faked to contain both the false variant and the true
// variant. For example:
// const themes = [{id: 'red', color: 'red'}, {id: 'blue', color: 'blue'}];
// export const staticThemes = themes.reduce((acc, theme) => [
//   ...acc,
//   Object.assign({}, theme, {isCompact: false, id: theme.id + 'desktop'}),
//   Object.assign({}, theme, {isCompact: true, id: theme.id + 'mobile'}),
// ], []);
function getStaticThemes(staticThemesFile: string, program: ts.Program) {
  const tsStaticThemesFile = program.getSourceFile(staticThemesFile);
  if (tsStaticThemesFile) {
    const typeChecker = program.getTypeChecker();
    const moduleSymbol = typeChecker.getSymbolAtLocation(tsStaticThemesFile);
    if (moduleSymbol) {
      const exports = typeChecker.getExportsOfModule(moduleSymbol);
      const themesSymbol = exports.find(e => e.escapedName === staticThemesName);
      if (themesSymbol) {
        const declarationNode = themesSymbol.valueDeclaration;
        if (ts.isVariableDeclaration(declarationNode) && declarationNode.initializer) {
          const staticThemes = evaluate(declarationNode.initializer, program);
          const requiresRuntimeResults = getAllRequiresRuntimeResult(staticThemes);
          if (requiresRuntimeResults.length) {
            let message = requiresRuntimeResults[0].message;
            const diagnostics = requiresRuntimeResults[0].getDiagnostics();
            if (diagnostics) {
              message += ` in ${diagnostics.file}:${diagnostics.line}`;
            }
            throw new Error(`Could not evaluate static themes in the file '${staticThemesFile}': ${message}`);
          }

          if (!Array.isArray(staticThemes)) {
            throw new Error(
              `The exported variable '${staticThemesName}' in the file '${staticThemesFile}' must be an array of theme objects`,
            );
          }

          const staticThemesMap: StaticThemes = {};
          for (const theme of staticThemes) {
            if (!theme || !theme.id || theme.id in staticThemesMap) {
              throw new Error(
                `The exported variable '${staticThemesName}' in the file '${staticThemesFile}' must be an array of theme objects, and the theme objects must have a property called 'id' which must have a unique value`,
              );
            }
            staticThemesMap[theme.id] = theme;
          }
          return staticThemesMap;
        } else {
          throw new Error(
            `The exported variable '${staticThemesName}' in the file '${staticThemesFile}' must be a variable declaration like 'export const ${staticThemesName} = [...];'`,
          );
        }
      } else {
        throw new Error(
          `Could not find an exported variable called '${staticThemesName}' in the file '${staticThemesFile}'`,
        );
      }
    } else {
      throw new Error('Could not find a TS symbol for the compile time/static themes file');
    }
  } else {
    throw new Error(`Could not locate the file for compile time/static themes, looked for: '${staticThemesFile}'`);
  }
}

// This function is used to generate the ts.Node that will be placed in the className JSX attribute.
// It can either be a string literal if we know that it's a static class name, or an expression
// for when themes are used and we must generate a conditional such as:
// className={__glitzTheme.isCompact ? 'a' : 'b'}
function getClassNameExpression(style: EvaluatedStyle | EvaluatedStyle[], transformerContext: TransformerContext) {
  const factory = transformerContext.tsContext.factory;
  const propFunc = anyValuesAreFunctions(style);
  if (propFunc) {
    transformerContext.currentFileUsesGlitzThemes = true;
  }

  if (!transformerContext.staticThemes) {
    if (propFunc) {
      return requiresRuntimeResult(
        'Functions in style objects requires runtime or statically declared themes',
        (propFunc as FunctionWithTsNode).tsNode,
      );
    } else {
      const classNames = transformerContext.glitz.injectStyle(style);
      return ts.createStringLiteral(classNames);
    }
  } else {
    if (!propFunc) {
      // No functions found, just evaluate to a static class
      const classNames = transformerContext.glitz.injectStyle(style);
      return factory.createStringLiteral(classNames);
    } else {
      // Theme functions found, we must now evaluate the functions for all static
      // themes and generate the smallest possible conditional/ternary to match
      // a theme with a class name.
      const classNamesByThemeId: { [themeId: string]: string[] } = {};
      const classUses: { [className: string]: number } = {};
      const themeCount = Object.keys(transformerContext.staticThemes).length;
      const classesUsedInAllThemes: string[] = [];

      // We first need to evaluate the style object against all static themes
      // and save the class names that each theme generates. Note that we
      // don't care at all about the complexity of the expression inside the
      // theme functions, we instead generate conditions later on independently
      // of how the theme function looks.
      for (const themeId in transformerContext.staticThemes) {
        try {
          const className = transformerContext.glitz.injectStyle(style, transformerContext.staticThemes[themeId]);
          const classNames = className.split(' ');
          classNames.sort();
          for (const c of classNames) {
            if (!(c in classUses)) {
              classUses[c] = 0;
            }
            classUses[c]++;
          }
          classNamesByThemeId[themeId] = classNames;
        } catch (e) {
          if (isRequiresRuntimeResult(e)) {
            return e;
          } else {
            throw e;
          }
        }
      }

      // We count the number of uses each class has to know which classes
      // are common and used in all themes. By extracting classes used
      // in all themes we can even end up in a situation where a theme function
      // returns the same value for all themes, in which case we can safely generate
      // a static class.
      for (const c in classUses) {
        if (classUses[c] === themeCount) {
          classesUsedInAllThemes.push(c);
          for (const themeId in classNamesByThemeId) {
            classNamesByThemeId[themeId].splice(classNamesByThemeId[themeId].indexOf(c), 1);
            if (!classNamesByThemeId[themeId].length) {
              delete classNamesByThemeId[themeId];
            }
          }
        }
      }

      const themeIdsByClassNames: { [classNames: string]: string[] } = {};
      for (const themeId in classNamesByThemeId) {
        const classNames = classNamesByThemeId[themeId].join(' ');
        if (!themeIdsByClassNames[classNames]) {
          themeIdsByClassNames[classNames] = [];
        }
        themeIdsByClassNames[classNames].push(themeId);
      }

      // We convert { [classNames: string]: themeIds[] } to:
      // Array<{ className: string; themeIds: string[] }> here
      // because we want to sort this structure based on theme number
      // of themes with the same classes.
      // The reason for this is that the class name with most themes
      // will probably have the longest/most complex expression
      // and we'll only actually include that in development mode.
      // So if we have:
      // className={t.id === 'theme1' ? 'a' : t.id === 'theme2' || t.id === 'theme3' || t.id === 'theme4' ? 'b' : throw new Error('Unknown theme')}
      // this will in production instead be:
      // className={t.id === 'theme1' ? 'a' : 'b'}
      type ThemeIdAndClassNamesTuple = { className: string; themeIds: string[] };
      const themeIdsAndClassNames = Object.keys(themeIdsByClassNames).reduce(
        (acc, className) => [...acc, { className, themeIds: themeIdsByClassNames[className] }],
        [] as ThemeIdAndClassNamesTuple[],
      );
      themeIdsAndClassNames.sort((a, b) => b.themeIds.length - a.themeIds.length);

      const componentNode = injectUseGlitzThemeVariable(transformerContext, factory);
      if (componentNode) {
        let ternaryExrp: ts.Expression | undefined;

        const allThemeIds = Object.keys(classNamesByThemeId);
        const allThemes = Object.values(transformerContext.staticThemes);
        for (const theme of themeIdsAndClassNames) {
          const themeIds = theme.themeIds;
          const otherThemeIds = allThemeIds.filter(t => themeIds.indexOf(t) === -1);
          const classNames = theme.className;

          const condition = createThemeConditionFor(
            allThemes.filter(t => themeIds.indexOf(t.id) !== -1),
            allThemes.filter(t => otherThemeIds.indexOf(t.id) !== -1),
            factory,
          );

          if (ternaryExrp === undefined) {
            if (transformerContext.mode === 'development') {
              const errorMsg = 'Unexpected theme, this theme did not exist during compile time: ';
              const throwExpr = transformerContext.tsContext.factory.createCallExpression(
                factory.createArrowFunction(
                  undefined,
                  undefined,
                  [],
                  undefined,
                  undefined,
                  factory.createBlock(
                    [
                      factory.createThrowStatement(
                        factory.createNewExpression(factory.createIdentifier('Error'), undefined, [
                          factory.createBinaryExpression(
                            factory.createStringLiteral(errorMsg),
                            ts.SyntaxKind.PlusToken,
                            factory.createIdentifier(themeIdentifierName),
                          ),
                        ]),
                      ),
                    ],
                    undefined,
                  ),
                ),
                undefined,
                [],
              );
              ternaryExrp = factory.createConditionalExpression(
                condition!,
                undefined,
                factory.createStringLiteral(classNames),
                undefined,
                throwExpr,
              );
            } else {
              ternaryExrp = factory.createStringLiteral(classNames);
            }
          } else {
            ternaryExrp = factory.createConditionalExpression(
              condition!,
              undefined,
              factory.createStringLiteral(classNames),
              undefined,
              ternaryExrp,
            );
          }
        }

        if (!ternaryExrp) {
          return factory.createStringLiteral(classesUsedInAllThemes.join(' '));
        }
        if (classesUsedInAllThemes.length) {
          return factory.createJsxExpression(
            undefined,
            factory.createBinaryExpression(
              factory.createStringLiteral(classesUsedInAllThemes.join(' ') + ' '),
              ts.SyntaxKind.PlusToken,
              ternaryExrp!,
            ),
          );
        }
        return factory.createJsxExpression(undefined, ternaryExrp);
      } else {
        return requiresRuntimeResult(
          'JSX expression outside of a component declaration cannot be statically evaluated',
          transformerContext.currentNode,
        );
      }
    }
  }
}

// This is used to create a condition to be used in a ternary to render
// different class names based on values on the runtime theme.
// wantedThemes are the themes that the condition should match, and
// otherThemes are the themes that the condition must not match.
// We want to generate as terse/small condition as possible, since
// this condition might be printed multiple times for a common styled
// component, which is why we try to look for a property that has the
// same value in all wanted themes, and a different value in all other themese.
function createThemeConditionFor(wantedThemes: StaticTheme[], otherThemes: StaticTheme[], factory: ts.NodeFactory) {
  if (wantedThemes.length > 0 && otherThemes.length > 0) {
    let commonPropertyName: string | undefined;
    for (const property in wantedThemes[0]) {
      if (property === themeIdPropertyName) {
        continue;
      }

      commonPropertyName = property;
      const value = wantedThemes[0][property];
      for (const theme of wantedThemes) {
        if (theme[property] !== value) {
          commonPropertyName = undefined;
        }
      }

      if (commonPropertyName) {
        for (const otherTheme of otherThemes) {
          if (otherTheme[commonPropertyName] === wantedThemes[0][commonPropertyName]) {
            commonPropertyName = undefined;
            break;
          }
        }
      }

      if (commonPropertyName) {
        break;
      }
    }

    // We've found a property that has the same value in all wanted themes,
    // and a different value in the other themes.
    if (commonPropertyName) {
      const commonValue = wantedThemes[0][commonPropertyName];
      const literal = createLiteral(commonValue, factory);
      if (literal) {
        const themeCondition = factory.createBinaryExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier(themeIdentifierName),
            factory.createIdentifier(commonPropertyName),
          ),
          ts.SyntaxKind.EqualsEqualsEqualsToken,
          literal,
        );
        return themeCondition;
      }
    }
  }

  // No property found that can fulfill our condition so we fall back to creating a bigger
  // expression based on the theme ids of the wanted themes.
  let condition: ts.BinaryExpression | undefined;
  for (const theme of wantedThemes) {
    const themeId = theme.id;
    const themeCondition = factory.createBinaryExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier(themeIdentifierName),
        factory.createIdentifier(themeIdPropertyName),
      ),
      ts.SyntaxKind.EqualsEqualsEqualsToken,
      factory.createStringLiteral(themeId),
    );
    if (condition === undefined) {
      condition = themeCondition;
    } else {
      condition = factory.createBinaryExpression(themeCondition, ts.SyntaxKind.BarBarToken, condition);
    }
  }
  return condition;
}

const useGlitzIsInjectedFlag = 'useGlitzIsInjected';

// This takes the current transformation node (most likely a JSX expression) and finds the function
// it's placed in. It then injects `const __glitzTheme = useGlitzTheme();` as the first statement.
// If the current transformation node is not placed inside a function (ie it's a top level JSX expression)
// we return undefined to signal that we can't reliably transform it.
function injectUseGlitzThemeVariable(transformerContext: TransformerContext, factory: ts.NodeFactory) {
  const componentNode = getComponentNode(transformerContext.currentNode);
  if (componentNode) {
    const originalComponentNode = ts.getOriginalNode(componentNode);
    if (!transformerContext.nodeFlags.has(originalComponentNode)) {
      transformerContext.nodeFlags.set(originalComponentNode, []);
    }
    const flags = transformerContext.nodeFlags.get(originalComponentNode)!;
    if (flags.indexOf(useGlitzIsInjectedFlag) !== -1) {
      // This prevents us from making the same transformation multiple times
      // if a component contains multiple uses of theme functions
      return componentNode;
    } else {
      flags.push(useGlitzIsInjectedFlag);
    }

    const useGlitzCall = factory.createCallExpression(
      factory.createIdentifier(useGlitzThemeName),
      undefined,
      undefined,
    );
    // At this point we're not quite sure if the theme will be used or if all theme functions can be determined
    // to return the same class, or if any functions will require runtime so we inject /* #__PURE__ */ to tell
    // the minifier that it's safe to remove this call if the theme is unused.
    ts.addSyntheticLeadingComment(useGlitzCall, ts.SyntaxKind.MultiLineCommentTrivia, '#__PURE__', false);
    const useGlitzStmt = factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier(themeIdentifierName),
            undefined,
            undefined,
            useGlitzCall,
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );
    let transformedComponentNode = componentNode;
    if (ts.isArrowFunction(componentNode) && !ts.isBlock(componentNode.body)) {
      transformedComponentNode = factory.createArrowFunction(
        componentNode.modifiers,
        componentNode.typeParameters,
        componentNode.parameters,
        componentNode.type,
        componentNode.equalsGreaterThanToken,
        factory.createBlock([useGlitzStmt, factory.createReturnStatement(componentNode.body)], true),
      );
    } else if (ts.isFunctionDeclaration(componentNode)) {
      transformedComponentNode = factory.createFunctionDeclaration(
        componentNode.decorators,
        componentNode.modifiers,
        componentNode.asteriskToken,
        componentNode.name,
        componentNode.typeParameters,
        componentNode.parameters,
        componentNode.type,
        factory.createBlock([useGlitzStmt, ...componentNode.body!.statements], true),
      );
    } else if (ts.isFunctionExpression(componentNode)) {
      transformedComponentNode = factory.createFunctionExpression(
        componentNode.modifiers,
        componentNode.asteriskToken,
        componentNode.name,
        componentNode.typeParameters,
        componentNode.parameters,
        componentNode.type,
        factory.createBlock([useGlitzStmt, ...componentNode.body!.statements], true),
      );
    }
    transformerContext.transformations.set(originalComponentNode, transformedComponentNode);
  }
  return componentNode;
}

function createLiteral(value: any, factory: ts.NodeFactory) {
  if (typeof value === 'string') {
    return factory.createStringLiteral(value);
  } else if (typeof value === 'number') {
    return factory.createNumericLiteral(value);
  } else if (typeof value === 'boolean') {
    return value ? factory.createTrue() : factory.createFalse();
  } else {
    return undefined;
  }
}

function getAllRequiresRuntimeResult(obj: any) {
  const result: RequiresRuntimeResult[] = [];
  if (obj) {
    if (isRequiresRuntimeResult(obj)) {
      result.push(obj);
    } else if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        for (const elem of obj) {
          const res = getAllRequiresRuntimeResult(elem);
          result.push(...res);
        }
      } else {
        for (const key in obj) {
          const res = getAllRequiresRuntimeResult(obj[key]);
          result.push(...res);
        }
      }
    }
  }
  return result;
}

function isEvaluableStyle(
  object: EvaluatedStyle | RequiresRuntimeResult,
  hasStaticThemes: boolean,
): object is EvaluatedStyle {
  if (!isRequiresRuntimeResult(object)) {
    if (typeof object === 'function') {
      return false;
    }
    for (const key in object) {
      const value = object[key];
      if (isRequiresRuntimeResult(value)) {
        return false;
      }
      if (!hasStaticThemes && typeof value === 'function') {
        return false;
      }
      if (value && typeof value === 'object' && !Array.isArray(value) && !isEvaluableStyle(value, hasStaticThemes)) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function passThroughProps(props: ts.NodeArray<ts.JsxAttributeLike>) {
  return props.filter(p => {
    if (p.name && ts.isIdentifier(p.name)) {
      return p.name.text !== 'css';
    }
    return true;
  });
}

function hasSpreadWithoutCssPropOrAfterCssProp(props: ts.NodeArray<ts.JsxAttributeLike>) {
  const spreadPropIndex = props.findIndex(p => ts.isJsxSpreadAttribute(p));
  if (spreadPropIndex === -1) {
    return false;
  }
  const cssPropIndex = props.findIndex(p => ts.isJsxAttribute(p) && ts.isIdentifier(p.name) && p.name.text === 'css');
  if (cssPropIndex === -1) {
    return true;
  }
  return cssPropIndex < spreadPropIndex;
}

function isComponentName(name: string) {
  if (!name) {
    return false;
  }
  const firstChar = name[0];
  const secondChar = name[1];
  if (firstChar === firstChar.toUpperCase() && secondChar && secondChar === secondChar.toLowerCase()) {
    return true;
  }
  return false;
}

function isRequiresRuntimeResultOrStyleWithFunction(obj: RequiresRuntimeResult | { [key: string]: any }) {
  if (isRequiresRuntimeResult(obj)) {
    return true;
  }
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (typeof obj[key] === 'function' || isRequiresRuntimeResultOrStyleWithFunction(obj[key])) {
        return true;
      }
    }
  }
  return false;
}

function stripUnevaluableProperties(obj: { [key: string]: any }): EvaluatedStyle {
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  if (isRequiresRuntimeResult(obj)) {
    return {};
  }
  const style: EvaluatedStyle = {};
  for (const key in obj) {
    if (!isRequiresRuntimeResult(obj[key]) && typeof obj[key] !== 'function') {
      if (obj[key] && typeof obj[key] === 'object') {
        Object.assign(obj[key], stripUnevaluableProperties(obj[key]));
      } else {
        style[key] = obj[key];
      }
    }
  }
  return style;
}

function isUseStyle(node: ts.CallExpression) {
  if (ts.isIdentifier(node.expression) && node.expression.text === useStyleName) {
    return true;
  }
  return false;
}

// This determines if the call expression is either `styled()` or `styled.xyz()`
function isStyledCall(node: ts.CallExpression) {
  if (ts.isIdentifier(node.expression) && node.expression.text === styledName) {
    return true;
  }
  if (
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    node.expression.expression.text === styledName
  ) {
    return true;
  }
  return false;
}

function getSeverity(node: ts.Node, transformerContext: TransformerContext): Severity {
  if (transformerContext.allStylesShouldBeStatic || transformerContext.currentFileShouldBeStatic) {
    return 'error';
  }
  let severity: Severity = 'info';
  while (node.parent) {
    if (hasJSDocTag(node, 'glitz-static')) {
      severity = 'error';
      break;
    }
    node = node.parent;
  }
  return severity;
}
