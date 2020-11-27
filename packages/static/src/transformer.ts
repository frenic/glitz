import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { GlitzServer } from '@glitz/core';
import {
  isStaticElement,
  isStaticComponent,
  isStaticDecorator,
  StaticElementName,
  StaticElement,
  StaticComponent,
  Style,
} from './shared';
import {
  evaluate,
  partiallyEvaluate,
  resolveImportSymbol,
  isRequiresRuntimeResult,
  RequiresRuntimeResult,
  requiresRuntimeResult,
  evaluationCache,
  FunctionWithTsNode,
  staticModuleOverloads,
  EvaluationStats,
} from './evaluator';
import { getStaticExports } from './static-module-overloads';

const glitzComments = {
  dynamic: '@glitz-dynamic',
  allDynamic: '@glitz-all-dynamic',
  static: '@glitz-static',
  allStatic: '@glitz-all-static',
  suppress: '@glitz-suppress',
};

export const glitzReactModuleName = '@glitz/react';
export const glitzCoreModuleName = '@glitz/core';
export const styledName = 'styled';
export const useStyleName = 'useStyle';
const staticThemesName = 'staticThemes';
const themeIdentifierName = '__glitzTheme';
const useGlitzThemeName = 'useGlitzTheme';
const useThemeName = 'useTheme';
const themeIdPropertyName = 'id';
const diagnosticsReportedFlag = 'diagnosticsReported';

staticModuleOverloads[glitzReactModuleName] = () => {
  const files: { [moduleName: string]: string } = {};
  files[glitzReactModuleName + '.ts'] = fs.readFileSync(path.join(__dirname, 'static-glitz-react.ts')).toString();
  files['shared.ts'] = fs.readFileSync(path.join(__dirname, 'shared.ts')).toString();
  return getStaticExports(glitzReactModuleName, files);
};

staticModuleOverloads[glitzCoreModuleName] = () => {
  const files: { [moduleName: string]: string } = {};
  files[glitzCoreModuleName + '.ts'] = fs.readFileSync(path.join(__dirname, 'static-glitz-core.ts')).toString();
  files['shared.ts'] = fs.readFileSync(path.join(__dirname, 'shared.ts')).toString();
  return getStaticExports(glitzCoreModuleName, files);
};

staticModuleOverloads['react'] = () => {
  const files: { [moduleName: string]: string } = {};
  files['react.ts'] = fs.readFileSync(path.join(__dirname, 'static-react.ts')).toString();
  return getStaticExports('react', files);
};

type StaticStyledComponent = {
  componentName: string;
  elementName: StaticElementName | undefined;
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
  symbolsWithReferencesOutsideJsx: Map<ts.Symbol, { component: StaticStyledComponent; references: ts.Node[] }>;
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

type AutoImportedModule = {
  importPath: string;
  importName: string;
};

type TransformerContext = {
  program: ts.Program;
  glitz: GlitzServer;
  passNumber: number;
  currentFile: ts.SourceFile;
  autoImportedModules: AutoImportedModule[];
  currentNode: ts.Node;
  currentFileShouldBeStatic: boolean;
  staticStyledComponents: StaticStyledComponents;
  staticThemes: StaticThemes;
  staticThemesFile?: string;
  diagnosticsReporter?: DiagnosticsReporter;
  mode?: 'development' | 'production';
  allStylesShouldBeStatic?: boolean;
  tsContext: ts.TransformationContext;
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
  transformations: Map<ts.Node, ts.Node | ts.Node[]>;
  /**
   * This map is added to when a transformation in `transformations` is used. Note that
   * we don't remove from `transformations` because that would cause a transformation
   * in an early pass to get removed by a later pass.
   * We check the size of this map against the size of `transformations` to know if
   * all transformations are applied.
   */
  appliedTransformations: Map<ts.Node, ts.Node | ts.Node[]>;
  /**
   * This can be used as a way of setting flags to make sure that we don't run the same
   * transformations multiple times.
   */
  nodeFlags: Map<ts.Node, string[]>;
};

export function transformer(
  program: ts.Program,
  glitz: GlitzServer,
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
      if (file.statements.find(s => hasComment(s, glitzComments.allDynamic))) {
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
          autoImportedModules: [],
          currentNode: file,
          currentFileShouldBeStatic: !!file.statements.find(s => hasComment(s, glitzComments.allStatic)),
          tsContext: context,
          currentFileUsesGlitzThemes: false,
          currentFileHasImportedUseTheme: false,
          transformations: new Map<ts.Node, ts.Node | ts.Node[]>(),
          appliedTransformations: new Map<ts.Node, ts.Node | ts.Node[]>(),
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
      //
      // We also make a third pass if there are any other transformations that got registered
      // on the second pass.
      if (
        staticStyledComponents.symbolsWithReferencesOutsideJsx.size !== 0 ||
        transformerContext.transformations.size > transformerContext.appliedTransformations.size
      ) {
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
  const typeChecker = transformerContext.program.getTypeChecker();
  const factory = transformerContext.tsContext.factory;
  const staticStyledComponents = transformerContext.staticStyledComponents;
  const isFirstPass = transformerContext.passNumber === 1;
  const originalNode = ts.getOriginalNode(node);

  // This detects any non JSX usage of a variable pointing to a styled component
  if (ts.isIdentifier(node) && !isStaticComponentVariableUse(node)) {
    const symbol = typeChecker.getSymbolAtLocation(node);
    if (symbol && staticStyledComponents.symbolToComponent.has(symbol)) {
      const component = staticStyledComponents.symbolToComponent.get(symbol)!;
      if (!staticStyledComponents.symbolsWithReferencesOutsideJsx.has(symbol)) {
        staticStyledComponents.symbolsWithReferencesOutsideJsx.set(symbol, {
          component,
          references: [],
        });
      }
      staticStyledComponents.symbolsWithReferencesOutsideJsx.get(symbol)?.references.push(node.parent);
    }
  }

  // This evaluates imported styled components
  if ((ts.isImportSpecifier(node) || ts.isImportClause(node)) && node.name && isFirstPass) {
    if (isComponentName(node.name.text) && !hasComment(node, glitzComments.dynamic)) {
      const symbol = typeChecker.getSymbolAtLocation(node.name);
      if (symbol) {
        const stats: EvaluationStats = {
          usedVariables: new Map<ts.Declaration, any>(),
        };
        const result = evaluateToStaticComponentOrElement(
          ts.isImportSpecifier(node) && node.propertyName ? node.propertyName : node.name,
          transformerContext,
          stats,
        );
        if (result.canUseResult && result.elementOrComponent) {
          const component: StaticStyledComponent = {
            componentName: node.name.text,
            elementName: result.elementOrComponent.elementName,
            styles: result.elementOrComponent.styles,
          };
          staticStyledComponents.symbolToComponent.set(symbol, component);
        } else {
          result.report();
        }
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
    declarePure(node);
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
            reportUsageOutsideOfJsxIfNeeded(componentSymbol, node, componentName, transformerContext);
          } else {
            if (ts.isCallExpression(declaration.initializer) && ts.isIdentifier(declaration.name)) {
              // Since some declarations of styled components are complex and look like:
              // const Styled = createComponent();
              // we look at the variable name to see if it's a variable with Pascal case
              // and in that case try to evaluate it to a styled component.
              if (isComponentName(componentName) && !hasComment(node, glitzComments.dynamic)) {
                const stats: EvaluationStats = {
                  usedVariables: new Map<ts.Declaration, any>(),
                };
                const result = evaluateToStaticComponentOrElement(declaration.initializer, transformerContext, stats);
                if (result.canUseResult && result.elementOrComponent) {
                  stats.usedVariables!.forEach((_, k) => {
                    if (
                      ts.isVariableDeclaration(k) &&
                      k.getSourceFile().fileName === transformerContext.currentFile.fileName
                    ) {
                      if (k.initializer && ts.isCallExpression(k.initializer)) {
                        declarePure(k.initializer);
                      }
                    }
                  });
                  declarePure(declaration.initializer);

                  const component = {
                    componentName,
                    elementName: result.elementOrComponent.elementName,
                    styles: result.elementOrComponent.styles,
                  };
                  for (const style of result.elementOrComponent.styles.map(stripUnevaluableProperties)) {
                    transformerContext.glitz.injectStyle(style);
                  }

                  staticStyledComponents.symbolToComponent.set(componentSymbol, component);
                } else {
                  result.report();
                }
              } else if (isUseStyle(declaration.initializer)) {
                const styles = evaluate(declaration.initializer, transformerContext.program);
                const analyzeResult = analyzeEvaluationResult(
                  styles,
                  declaration,
                  ExpectedEvaluationResult.StylesArray,
                  transformerContext,
                );
                if (analyzeResult.canUseResult && analyzeResult.stylesArray) {
                  const classNameExpr = getClassNameExpression(styles, transformerContext);
                  if (isRequiresRuntimeResult(classNameExpr)) {
                    reportRequiresRuntimeResult(
                      'Evaluation of theme function requires runtime',
                      classNameExpr,
                      node,
                      transformerContext,
                    );
                  } else {
                    const variableStmt = factory.createVariableStatement(
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
                    transformerContext.transformations.set(node, variableStmt);
                  }
                } else {
                  analyzeResult.report();
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
    const cssProp = getCssDataFromCssProp(node, transformerContext);
    if (cssProp.found) {
      if (cssProp.styles) {
        // Everything is static, replace `<styled.[element name] />` with `<[element name] className="[classes]" />`
        const classNameExpr = getClassNameExpression(cssProp.styles, transformerContext);
        if (isRequiresRuntimeResult(classNameExpr)) {
          reportRequiresRuntimeResult(
            'Evaluation of theme function requires runtime',
            classNameExpr,
            node,
            transformerContext,
          );
        } else {
          const componentName = styledName + '.' + node.tagName.name.escapedText;
          rewriteToHtmlElement(node, elementName, componentName, classNameExpr, transformerContext);
        }
      } else if (!rewriteFunctionToReturnClassNamesIfPossible(node, transformerContext)) {
        cssProp.report();
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
      const elementName = openingElement.tagName.name.escapedText.toString().toLowerCase();
      const cssProp = getCssDataFromCssProp(openingElement, transformerContext);
      if (cssProp.found) {
        if (cssProp.styles) {
          const classNameExpr = getClassNameExpression(cssProp.styles, transformerContext);
          if (isRequiresRuntimeResult(classNameExpr)) {
            reportRequiresRuntimeResult(
              'Evaluation of theme function requires runtime',
              classNameExpr,
              node,
              transformerContext,
            );
          } else {
            const componentName = styledName + '.' + openingElement.tagName.name.escapedText;
            rewriteToHtmlElement(node, elementName, componentName, classNameExpr, transformerContext);
          }
        } else if (!rewriteFunctionToReturnClassNamesIfPossible(node, transformerContext)) {
          cssProp.report();
        }
      }
    }

    if (ts.isIdentifier(openingElement.tagName) && ts.isIdentifier(openingElement.tagName)) {
      const jsxTagSymbol = typeChecker.getSymbolAtLocation(openingElement.tagName);
      if (
        jsxTagSymbol &&
        staticStyledComponents.symbolToComponent.has(jsxTagSymbol) &&
        !staticStyledComponents.symbolsWithReferencesOutsideJsx.has(jsxTagSymbol) &&
        !hasSpreadWithoutCssPropOrAfterCssProp(node.openingElement.attributes.properties) &&
        !isTopLevelJsxInComposedComponent(
          node,
          transformerContext.program.getTypeChecker(),
          transformerContext.staticStyledComponents,
        )
      ) {
        // We now know that: node == `<[styled component name] [zero or more props]>[zero or more children]</[styled component name]>`
        // and we also know that the JSX points to a component that is 100% static
        // and is not referenced outside of JSX.
        const cssProp = getCssDataFromCssProp(openingElement, transformerContext);
        if (cssProp.found && !cssProp.styles) {
          cssProp.report();
        } else {
          const styledComponent = staticStyledComponents.symbolToComponent.get(jsxTagSymbol)!;
          if (styledComponent.elementName) {
            let styles = styledComponent.styles.filter(style => !!style);
            if (cssProp.styles) {
              styles = styles.slice();
              styles.push(...cssProp.styles);
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
              rewriteToHtmlElement(
                node,
                styledComponent.elementName,
                styledComponent.componentName,
                classNameExpr,
                transformerContext,
              );
            }
          }
        }
      } else if (jsxTagSymbol && staticStyledComponents.symbolsWithReferencesOutsideJsx.has(jsxTagSymbol)) {
        // Since usage outside of JSX is determined in later passes we need to reset the node when
        // we detect this, since the earlier passes will have happily set a transformation for it
        transformerContext.transformations.set(node, node);
      }
    }
  }

  if (ts.isJsxSelfClosingElement(node) && ts.isIdentifier(node.tagName)) {
    const jsxTagSymbol = typeChecker.getSymbolAtLocation(node.tagName);
    if (
      jsxTagSymbol &&
      staticStyledComponents.symbolToComponent.has(jsxTagSymbol) &&
      !staticStyledComponents.symbolsWithReferencesOutsideJsx.has(jsxTagSymbol) &&
      !hasSpreadWithoutCssPropOrAfterCssProp(node.attributes.properties) &&
      !isTopLevelJsxInComposedComponent(
        node,
        transformerContext.program.getTypeChecker(),
        transformerContext.staticStyledComponents,
      )
    ) {
      // We now know that: node == `<[styled component name] [zero or more props] />`
      // and we also know that the JSX points to a component that is 100% static
      // and is not referenced outside of JSX.
      const cssProp = getCssDataFromCssProp(node, transformerContext);
      const styledComponent = staticStyledComponents.symbolToComponent.get(jsxTagSymbol)!;
      if (cssProp.found && !cssProp.styles) {
        cssProp.report();
      } else if (styledComponent.elementName) {
        let styles = styledComponent.styles.filter(style => !!style);
        if (cssProp.styles) {
          styles = styles.slice();
          styles.push(...cssProp.styles);
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
          rewriteToHtmlElement(
            node,
            styledComponent.elementName,
            styledComponent.componentName,
            classNameExpr,
            transformerContext,
          );
        }
      }
    } else if (jsxTagSymbol && staticStyledComponents.symbolsWithReferencesOutsideJsx.has(jsxTagSymbol)) {
      // Since usage outside of JSX is determined in later passes we need to reset the node when
      // we detect this, since the earlier passes will have happily set a transformation for it
      transformerContext.transformations.set(node, node);
    }
  }

  if (!isFirstPass && transformerContext.transformations.has(originalNode)) {
    const previouslyTransformed = transformerContext.transformations.get(originalNode)!;
    transformerContext.appliedTransformations.set(originalNode, previouslyTransformed);
    return previouslyTransformed;
  }

  return node;
}

function rewriteToHtmlElement(
  node: ts.JsxElement | ts.JsxSelfClosingElement,
  elementName: StaticElementName,
  componentName: string,
  className: ts.Expression,
  transformerContext: TransformerContext,
) {
  const factory = transformerContext.tsContext.factory;
  const typeChecker = transformerContext.program.getTypeChecker();
  const properties = ts.isJsxElement(node) ? node.openingElement.attributes.properties : node.attributes.properties;

  let setDataGlitzName = true;
  const elementNameNode = elementName as ts.Node;
  let elementNameString = '';
  if (typeof elementName === 'string') {
    elementNameString = elementName;
  } else if (ts.isIdentifier(elementNameNode)) {
    let symbol = typeChecker.getSymbolAtLocation(elementNameNode);
    if (symbol && !symbol.valueDeclaration) {
      const [symbolOrSymbols] = resolveImportSymbol(elementNameNode.text, symbol, transformerContext.program);
      if (symbolOrSymbols && !Array.isArray(symbolOrSymbols)) {
        symbol = symbolOrSymbols;
      }
    }
    if (symbol && symbol.valueDeclaration) {
      const valueDeclaration = symbol.valueDeclaration;
      if (
        ts.isFunctionDeclaration(valueDeclaration) ||
        (ts.isVariableDeclaration(valueDeclaration) && isTopLevelDeclaration(valueDeclaration))
      ) {
        if (valueDeclaration.getSourceFile().fileName !== transformerContext.currentFile.fileName) {
          const importedName = importDeclaration(valueDeclaration, transformerContext);
          if (importedName) {
            elementNameString = importedName;
            setDataGlitzName = false;
          }
        } else {
          elementNameString = elementNameNode.text;
          setDataGlitzName = false;
        }
      }
    }
  }
  if (!elementNameString) {
    reportRequiresRuntimeResult(
      'Unable to determine static component/element name',
      undefined,
      elementNameNode,
      transformerContext,
    );
    return;
  }

  const jsxAttributes = factory.createJsxAttributes([
    ...passThroughProps(properties),
    factory.createJsxAttribute(
      factory.createIdentifier('className'),
      factory.createJsxExpression(undefined, className),
    ),
    ...(transformerContext.mode === 'development' && componentName && setDataGlitzName
      ? [
          factory.createJsxAttribute(
            factory.createIdentifier('data-glitzname'),
            factory.createStringLiteral(componentName),
          ),
        ]
      : []),
  ]);

  if (ts.isJsxElement(node)) {
    const jsxOpeningElement = factory.createJsxOpeningElement(
      factory.createIdentifier(elementNameString),
      undefined,
      jsxAttributes,
    );
    ts.setOriginalNode(jsxOpeningElement, node.openingElement);

    const jsxClosingElement = factory.createJsxClosingElement(factory.createIdentifier(elementNameString));
    ts.setOriginalNode(jsxClosingElement, node.closingElement);

    const jsxElement = factory.createJsxElement(jsxOpeningElement, node.children, jsxClosingElement);
    ts.setOriginalNode(jsxElement, node);
    transformerContext.transformations.set(node, jsxElement);
  } else {
    const jsxSelfClosingElement = factory.createJsxSelfClosingElement(
      factory.createIdentifier(elementNameString),
      undefined,
      jsxAttributes,
    );
    ts.setOriginalNode(jsxSelfClosingElement, node);
    transformerContext.transformations.set(node, jsxSelfClosingElement);
  }
}

function isTopLevelDeclaration(decl: ts.VariableDeclaration | ts.FunctionDeclaration) {
  if (ts.isVariableDeclaration(decl)) {
    return ts.isSourceFile(decl.parent.parent.parent);
  }
  if (ts.isFunctionDeclaration(decl)) {
    return ts.isSourceFile(decl.parent);
  }
  return false;
}

function importDeclaration(
  decl: ts.VariableDeclaration | ts.FunctionDeclaration,
  transformerContext: TransformerContext,
) {
  if (!isTopLevelDeclaration(decl)) {
    return undefined;
  }
  let sourceFile: ts.SourceFile | undefined = undefined;
  let exportedName: string | undefined = undefined;
  if (ts.isVariableDeclaration(decl) && ts.isIdentifier(decl.name)) {
    if (
      ts.isVariableStatement(decl.parent.parent) &&
      decl.parent.parent.modifiers &&
      decl.parent.parent.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      exportedName = decl.name.text;
      sourceFile = decl.parent.parent.parent as ts.SourceFile;
    }
  }
  if (ts.isFunctionDeclaration(decl)) {
    sourceFile = decl.parent as ts.SourceFile;
    if (decl.modifiers) {
      if (decl.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
        exportedName = decl.modifiers.find(m => m.kind === ts.SyntaxKind.DefaultKeyword)
          ? 'default'
          : decl.name
          ? decl.name.text
          : undefined;
      }
    }
  }
  if (sourceFile && exportedName) {
    const dirname = path.dirname(transformerContext.currentFile.fileName);
    let importPath = path.relative(dirname, sourceFile.fileName).replace(/\\/g, '/');
    if (!importPath.startsWith('.')) {
      importPath = './' + importPath;
    }
    const pathParts = importPath.split('/');
    const nodeModulesIndex = pathParts.lastIndexOf('node_modules');
    if (nodeModulesIndex !== -1) {
      importPath = pathParts.slice(nodeModulesIndex).join('/');
    }
    const dotParts = importPath.split('.');
    dotParts.splice(dotParts.length - 1, 1);
    importPath = dotParts.join('.');
    const factory = transformerContext.tsContext.factory;
    let importName = exportedName;
    let importClause: ts.ImportClause;
    if (exportedName === 'default') {
      importName = importPath.replace(/\//g, '');
      importClause = factory.createImportClause(false, factory.createIdentifier(importName), undefined);
    } else {
      importName = 'AutoImported' + importName;
      importClause = factory.createImportClause(
        false,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(factory.createIdentifier(exportedName), factory.createIdentifier(importName)),
        ]),
      );
    }
    if (!transformerContext.autoImportedModules.find(m => m.importPath === importPath && m.importName === importName)) {
      transformerContext.autoImportedModules.push({
        importPath,
        importName,
      });
      const importStmt = factory.createImportDeclaration(
        undefined,
        undefined,
        importClause,
        factory.createStringLiteral(importPath),
      );
      injectTopLevelNode(importStmt, transformerContext);
    }
    return importName;
  }
  return undefined;
}

// This adds a node as a top level statement, after the first statement in the file
function injectTopLevelNode(node: ts.Node | ts.Node[], transformerContext: TransformerContext) {
  const firstStmt = transformerContext.currentFile.statements[0];
  let nodes: ts.Node[] = [];
  if (transformerContext.transformations.has(firstStmt)) {
    const transformation = transformerContext.transformations.get(firstStmt)!;
    if (Array.isArray(transformation)) {
      nodes = transformation;
    } else {
      nodes.push(transformation);
    }
  } else {
    nodes.push(firstStmt);
  }
  if (Array.isArray(node)) {
    nodes.push(...node);
  } else {
    nodes.push(node);
  }
  transformerContext.transformations.set(firstStmt, nodes);
}

// For any node inside a component, traverse up until we find a component declaration
// and return the symbol for it. Used to detect if JSX is inside a component that has been
// composed.
function getComponentSymbol(node: ts.Node, typeChecker: ts.TypeChecker): ts.Symbol | undefined {
  const componentNode = getComponentNode(node);
  if (!componentNode) {
    return undefined;
  }
  if (ts.isFunctionDeclaration(componentNode) && componentNode.name) {
    return typeChecker.getSymbolAtLocation(componentNode.name);
  }
  if (
    (ts.isFunctionExpression(componentNode) || ts.isArrowFunction(node)) &&
    ts.isVariableDeclaration(componentNode.parent)
  ) {
    return typeChecker.getSymbolAtLocation(componentNode.parent.name);
  }
  return undefined;
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
  if (isFunction(node) && isComponent(node)) {
    return node;
  }
  return getComponentNode(node.parent);
}

function isComponent(func: ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression) {
  const hasJsx = containsJsx(func);
  if (!hasJsx) {
    return false;
  }
  const parentFunction = getParentFunction(func);
  if (parentFunction && isComponent(parentFunction)) {
    return false;
  }
  return true;
}

function getParentFunction(node: ts.Node) {
  let parent = node.parent;
  while (parent) {
    if (isFunction(parent)) {
      return parent;
    }
    parent = parent.parent;
  }
  return undefined;
}

function containsJsx(func: ts.Node) {
  let hasJsx = false;
  ts.forEachChild(func, child => {
    if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child) || ts.isJsxFragment(child)) {
      hasJsx = true;
    } else if (!isFunction(child)) {
      const childContainsJSX = containsJsx(child);
      if (childContainsJSX) {
        hasJsx = true;
      }
    }
  });
  return hasJsx;
}

// Detects if the node is inside a component that is declared inline inside a call to styled, such as:
// const Styled = styled((props) => <styled.Div css={{ color: 'red' }}, { color: 'blue' })
// Used to bail on top level static css inside such components.
function isInsideInlineStyledComponent(node: ts.Node) {
  let currentNode = node;
  // eslint-disable-next-line no-constant-condition
  while (currentNode) {
    if (
      ts.isCallExpression(currentNode) &&
      ts.isIdentifier(currentNode.expression) &&
      currentNode.expression.text === styledName
    ) {
      return true;
    }

    currentNode = currentNode.parent;
  }
  return false;
}

function reportUsageOutsideOfJsxIfNeeded(
  componentSymbol: ts.Symbol,
  node: ts.Node,
  componentName: string,
  transformerContext: TransformerContext,
) {
  if (hasNodeFlag(transformerContext, node, diagnosticsReportedFlag)) {
    return;
  }
  setNodeFlag(transformerContext, node, diagnosticsReportedFlag);

  if (
    transformerContext.diagnosticsReporter &&
    transformerContext.staticStyledComponents.symbolsWithReferencesOutsideJsx.has(componentSymbol)
  ) {
    const outsideJsxUsage = transformerContext.staticStyledComponents.symbolsWithReferencesOutsideJsx.get(
      componentSymbol,
    )!;
    const references = outsideJsxUsage.references;

    for (const reference of references) {
      const sourceFile = reference.getSourceFile();
      const stmt = getStatement(reference);
      const severity = getSeverity(componentSymbol.valueDeclaration, transformerContext);

      if (severity !== 'suppressed') {
        transformerContext.diagnosticsReporter({
          file: sourceFile.fileName,
          message: `Component '${componentName}' cannot be statically extracted since it's used outside of JSX`,
          source: stmt.getText(),
          line: getLineNumber(reference),
          severity,
        });
      }
    }
  }
}

function getJsxElement(node: ts.Node) {
  while (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) {
    node = node.parent;
    if (ts.isSourceFile(node)) {
      return undefined;
    }
  }
  return node as ts.JsxElement | ts.JsxSelfClosingElement;
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
  const jsxElement = getJsxElement(node);
  if (!jsxElement) {
    return false;
  }
  let parent: ts.Node | undefined = jsxElement.parent;
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
  const containingComponentSymbol = getComponentSymbol(jsxElement, typeChecker);

  if (!ts.isReturnStatement(parent) && !ts.isArrowFunction(parent)) {
    return false;
  }

  if (
    (containingComponentSymbol &&
      staticStyledComponents.composedComponentSymbols.indexOf(containingComponentSymbol) !== -1) ||
    isInsideInlineStyledComponent(jsxElement)
  ) {
    return true;
  }
  return false;
}

function evaluateToStaticComponentOrElement(
  expression: ts.Expression,
  transformerContext: TransformerContext,
  stats: EvaluationStats,
) {
  const object = evaluate(expression, transformerContext.program, undefined, stats);
  const analyzeResult = analyzeEvaluationResult(
    object,
    expression,
    ExpectedEvaluationResult.ElementOrComponent,
    transformerContext,
  );
  return analyzeResult;
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
    if (ts.isImportClause(parent)) {
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
  requiresRuntimeResults: RequiresRuntimeResult | RequiresRuntimeResult[] | EvaluatedStyle[] | undefined,
  node: ts.Node,
  transformerContext: TransformerContext,
) {
  if (hasNodeFlag(transformerContext, node, diagnosticsReportedFlag)) {
    return;
  }
  setNodeFlag(transformerContext, node, diagnosticsReportedFlag);

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
      const severity = getSeverity(requiresRuntime.node ?? node, transformerContext);
      if (requireRuntimeDiagnostics && severity !== 'suppressed') {
        innerDiagnostics.push({
          file: requireRuntimeDiagnostics.file,
          line: requireRuntimeDiagnostics.line,
          message: requireRuntimeDiagnostics.message,
          source: requireRuntimeDiagnostics.source,
          severity,
        });
      }
    } else {
      const severity = getSeverity(node, transformerContext);
      if (severity !== 'suppressed') {
        transformerContext.diagnosticsReporter({
          message,
          file: node.getSourceFile().fileName,
          line: getLineNumber(node),
          source: node.getText(),
          severity,
        });
      }
    }
    const file = node.getSourceFile();
    for (const innerDiagnostic of innerDiagnostics) {
      const severity = getSeverity(node, transformerContext);
      if (severity !== 'suppressed') {
        transformerContext.diagnosticsReporter({
          message,
          file: file.fileName,
          line: getLineNumber(node),
          source: node.getText(),
          innerDiagnostic,
          severity,
        });
      }
    }
  }
}

function hasComment(node: ts.Node, commentToLookFor: string) {
  const jsDoc = (node as any).jsDoc;
  if (jsDoc && Array.isArray(jsDoc)) {
    for (const comment of jsDoc) {
      if (
        comment &&
        comment.tags &&
        Array.isArray(comment.tags) &&
        comment.tags.find((t: ts.JSDocTag) => t.tagName.text === commentToLookFor.replace('@', ''))
      ) {
        return true;
      }
    }
  }

  const sourceFileText = node.getSourceFile().getText();
  const comments = ts.getLeadingCommentRanges(sourceFileText, node.getFullStart()) ?? [];
  comments.push(...(ts.getTrailingCommentRanges(sourceFileText, node.getFullStart()) ?? []));

  for (const comment of comments) {
    const text = sourceFileText.substring(comment.pos, comment.end);
    if (text && text.indexOf(commentToLookFor) !== -1) {
      return true;
    }
  }

  return false;
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
          !ts.isConditionalExpression(style[key] as any) &&
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
  const cssPropExpression = getCssPropExpression(node);
  if (cssPropExpression) {
    const stats: EvaluationStats = {
      evaluationStack: [],
    };
    const shouldEvaluate = (node: ts.Node, stats?: EvaluationStats) => {
      if (!ts.isConditionalExpression(node)) {
        return true;
      }

      // We only allow ternaries on the first level of a css prop object
      const objectLiteralParents = stats!.evaluationStack!.filter(n => ts.isObjectLiteralExpression(n));
      if (objectLiteralParents.length !== 1) {
        return true;
      }

      // We don't to look for ternaries inside theme functions
      const functionDeclAsParent = stats!.evaluationStack!.filter(n => isFunction(n));
      if (functionDeclAsParent.length) {
        return true;
      }

      return false;
    };
    const cssData = partiallyEvaluate(cssPropExpression, shouldEvaluate, transformerContext.program, undefined, stats);
    const analyzeResult = analyzeEvaluationResult(cssData, node, ExpectedEvaluationResult.CssProp, transformerContext);
    return {
      found: true,
      styles: analyzeResult.cssProp,
      report: analyzeResult.report,
    };
  }
  return { found: false, report: () => undefined };
}

const dynamicCssJsDocPropRegex = new RegExp('\\/\\*\\s*' + glitzComments.dynamic + '\\s*\\*\\/');
const dynamicCssCommentPropRegex = new RegExp('\\/\\/\\s*' + glitzComments.dynamic + '\\s*');
function getCssPropExpression(node: ts.JsxSelfClosingElement | ts.JsxOpeningElement) {
  // Because TypeScript doesn't give us comments for JSX nodes
  if (dynamicCssJsDocPropRegex.test(node.getText()) || dynamicCssCommentPropRegex.test(node.getText())) {
    return undefined;
  }
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
    return cssJsxAttr.initializer.expression;
  }
  return undefined;
}

const decoratorRewrittenFlag = 'decoratorRewritten';

function rewriteFunctionToReturnClassNamesIfPossible(
  element: ts.JsxSelfClosingElement | ts.JsxElement,
  transformerContext: TransformerContext,
  elementName?: string,
  componentName?: string,
) {
  if (hasNodeFlag(transformerContext, element, decoratorRewrittenFlag)) {
    return true;
  }

  let cssPropExpression = getCssPropExpression(ts.isJsxElement(element) ? element.openingElement : element);
  if (cssPropExpression) {
    const shouldEvaluate = (node: ts.Node) => {
      if (isFunction(node)) {
        return false;
      }
      return true;
    };
    const possibleFunction = partiallyEvaluate(cssPropExpression, shouldEvaluate, transformerContext.program);
    if (isFunction(possibleFunction)) {
      let functionIsExported = false;
      if (
        ts.isVariableDeclaration(possibleFunction.parent) &&
        ts.isVariableStatement(possibleFunction.parent.parent.parent)
      ) {
        const stmt = possibleFunction.parent.parent.parent;
        if (stmt.modifiers && stmt.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
          functionIsExported = true;
        }
      } else if (ts.isFunctionDeclaration(possibleFunction)) {
        if (
          possibleFunction.modifiers &&
          possibleFunction.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword)
        ) {
          functionIsExported = true;
        }
      }

      if (functionIsExported) {
        reportRequiresRuntimeResult(
          'Cannot rewrite decorator since it is exported',
          undefined,
          possibleFunction,
          transformerContext,
        );
        return false;
      }

      let evaluatedReturnsCount = 0;
      let totalReturnsCount = 0;
      const returnTransformations = new Map<ts.Expression, ts.Expression>();

      const visitFunctionChild = (node: ts.Node) => {
        if (ts.isReturnStatement(node)) {
          totalReturnsCount++;
          if (node.expression) {
            let styles = evaluate(node.expression, transformerContext.program);
            if (typeof styles === 'function') {
              styles = styles();
            }
            if (isEvaluableStyle(styles, !!transformerContext.staticThemes, true)) {
              const classNames = getClassNameExpression(styles, transformerContext);
              if (!isRequiresRuntimeResult(classNames)) {
                const expression = ts.isJsxExpression(classNames) ? classNames.expression! : classNames;
                returnTransformations.set(node.expression, expression);
                evaluatedReturnsCount++;
              } else {
                reportRequiresRuntimeResult(
                  'Unable to evaluate return statement',
                  classNames,
                  node,
                  transformerContext,
                );
              }
            } else {
              reportRequiresRuntimeResult(
                'Unable to evaluate return statement',
                requiresRuntimeResult('could not statically evaluate styles', node),
                node,
                transformerContext,
              );
            }
          } else {
            evaluatedReturnsCount++;
          }
        } else {
          ts.forEachChild(node, visitFunctionChild);
        }
      };
      ts.forEachChild(possibleFunction, visitFunctionChild);

      if (evaluatedReturnsCount === totalReturnsCount) {
        returnTransformations.forEach((v, k) => {
          transformerContext.transformations.set(k, v);
        });

        if (ts.isIdentifier(cssPropExpression)) {
          cssPropExpression = transformerContext.tsContext.factory.createCallExpression(
            cssPropExpression,
            undefined,
            [],
          );
        }

        const tagName = ts.isJsxElement(element) ? element.openingElement.tagName : element.tagName;

        if (
          ts.isPropertyAccessExpression(tagName) &&
          ts.isIdentifier(tagName.expression) &&
          tagName.expression.escapedText.toString() === styledName
        ) {
          elementName = tagName.name.escapedText.toString().toLowerCase();
          componentName = `${styledName}.${tagName.name.escapedText}`;
        } else if (!elementName || !componentName) {
          throw new Error(
            'Unable to determine element and component name for ' +
              element.getText() +
              ' in ' +
              element.getSourceFile().fileName,
          );
        }
        rewriteToHtmlElement(element, elementName, componentName, cssPropExpression, transformerContext);
        setNodeFlag(transformerContext, element, decoratorRewrittenFlag);
        return true;
      }
    }
  }
  return false;
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
  const allStyles = Array.isArray(style) ? style : [style];
  const allTernaryStyles: string[] = [];
  const stylesPerTernary: {
    [ternary: string]: {
      ternary: ts.ConditionalExpression;
      classNamesWhenTrue: string[];
      classNamesWhenFalse: string[];
    };
  } = {};
  let conditionalFound = false;
  for (const styleObject of allStyles) {
    for (const key in styleObject) {
      const value = styleObject[key] as any;
      if (ts.isConditionalExpression(value)) {
        if (propFunc) {
          return requiresRuntimeResult(
            'Functions in style objects cannot be combined with ternaries',
            (propFunc as FunctionWithTsNode).tsNode!,
          );
        }
        conditionalFound = true;

        const whenTrue = evaluate(value.whenTrue, transformerContext.program);
        if (isRequiresRuntimeResult(whenTrue)) {
          return whenTrue;
        }
        if (isFunctionWithTsNode(whenTrue)) {
          return requiresRuntimeResult('Functions in style objects cannot be combined with ternaries', value);
        }
        const whenFalse = evaluate(value.whenFalse, transformerContext.program);
        if (isRequiresRuntimeResult(whenFalse)) {
          return whenFalse;
        }
        if (isFunctionWithTsNode(whenFalse)) {
          return requiresRuntimeResult('Functions in style objects cannot be combined with ternaries', value);
        }

        const ternaryString = value.getText();
        if (!(ternaryString in stylesPerTernary)) {
          stylesPerTernary[ternaryString] = {
            ternary: value,
            classNamesWhenTrue: [],
            classNamesWhenFalse: [],
          };
        }

        stylesPerTernary[ternaryString].classNamesWhenTrue.push(
          ...transformerContext.glitz.injectStyle({ [key]: whenTrue }).split(' '),
        );
        stylesPerTernary[ternaryString].classNamesWhenFalse.push(
          ...transformerContext.glitz.injectStyle({ [key]: whenFalse }).split(' '),
        );
        delete styleObject[key];
      }
    }

    if (conditionalFound) {
      if (Object.keys(styleObject).length) {
        const classNames = transformerContext.glitz.injectStyle(styleObject);
        for (const className of classNames.split(' ')) {
          if (allTernaryStyles.indexOf(className) === -1) {
            allTernaryStyles.push(className);
          }
        }
      }
    }
  }

  if (conditionalFound) {
    const stylesPerTernaryKeys = Object.keys(stylesPerTernary);
    let ternaryClassNameExpression: ts.Expression | undefined = undefined;
    if (allTernaryStyles.length) {
      ternaryClassNameExpression = factory.createStringLiteral(allTernaryStyles.join(' ') + ' ');
    }

    for (let i = 0; i < stylesPerTernaryKeys.length; i++) {
      const current = stylesPerTernary[stylesPerTernaryKeys[i]];
      let right: ts.Expression = factory.createConditionalExpression(
        current.ternary.condition,
        undefined,
        factory.createStringLiteral(current.classNamesWhenTrue.join(' ')),
        undefined,
        factory.createStringLiteral(current.classNamesWhenFalse.join(' ')),
      );
      if (i !== stylesPerTernaryKeys.length - 1) {
        right = factory.createBinaryExpression(right, ts.SyntaxKind.PlusToken, factory.createStringLiteral(' '));
      }
      if (!ternaryClassNameExpression) {
        ternaryClassNameExpression = right;
      } else {
        ternaryClassNameExpression = factory.createBinaryExpression(
          ternaryClassNameExpression,
          ts.SyntaxKind.PlusToken,
          right,
        );
      }
    }

    return ternaryClassNameExpression!;
  }

  if (!transformerContext.staticThemes) {
    if (propFunc) {
      return requiresRuntimeResult(
        'Functions in style objects requires runtime or statically declared themes',
        (propFunc as FunctionWithTsNode).tsNode!,
      );
    } else {
      const classNames = transformerContext.glitz.injectStyle(style);
      return factory.createStringLiteral(classNames);
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
                            factory.createCallExpression(
                              factory.createPropertyAccessExpression(
                                factory.createIdentifier('JSON'),
                                factory.createIdentifier('stringify'),
                              ),
                              undefined,
                              [factory.createIdentifier(themeIdentifierName)],
                            ),
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
          return factory.createBinaryExpression(
            factory.createStringLiteral(classesUsedInAllThemes.join(' ') + ' '),
            ts.SyntaxKind.PlusToken,
            ternaryExrp!,
          );
        }
        return ternaryExrp;
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
    injectImportUseGlitz(transformerContext);
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
    declarePure(useGlitzCall);
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

const useGlitzImportIsInjectedFlag = 'useGlitzImportIsInjected';

function injectImportUseGlitz(transformerContext: TransformerContext) {
  if (hasNodeFlag(transformerContext, transformerContext.currentFile, useGlitzImportIsInjectedFlag)) {
    return;
  }
  setNodeFlag(transformerContext, transformerContext.currentFile, useGlitzImportIsInjectedFlag);

  const factory = transformerContext.tsContext.factory;
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
    factory.createStringLiteral(glitzReactModuleName),
  );
  const nodes: ts.Node[] = [importDecl];
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
    nodes.push(asyncThemeImport);
  }
  injectTopLevelNode(nodes, transformerContext);
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

const enum ExpectedEvaluationResult {
  StylesArray,
  CssProp,
  ElementOrComponent,
}

function analyzeEvaluationResult(
  evaluationResult: unknown,
  node: ts.Node,
  expected: ExpectedEvaluationResult,
  transformerContext: TransformerContext,
  stats?: EvaluationStats,
) {
  if (isStaticDecorator(evaluationResult)) {
    try {
      evaluationResult = evaluationResult();
    } catch (e) {
      if (isRequiresRuntimeResult(e)) {
        evaluationResult = e;
      }
    }
  }

  let bailedOnTopLevelComposedStyledElement = false;
  const evaluationObjects = collectEvaluationObjects(evaluationResult);

  const result = {
    allRequiresRuntimeResult: evaluationObjects.requiresRuntimeResult,
    allFunctions: evaluationObjects.functions,
    nodes: evaluationObjects.nodes,
    canUseResult: true,
    stylesArray: undefined as undefined | Style[],
    elementOrComponent: undefined as undefined | StaticElement | StaticComponent,
    cssProp: undefined as undefined | EvaluatedStyle[],
    evaluationResult,
    glitzUsedInEvaluation: undefined as undefined | boolean,
    report: () => {
      if (!transformerContext.diagnosticsReporter) {
        return;
      }
      const severity = getSeverity(node, transformerContext);
      if (severity === 'suppressed') {
        return;
      }
      if (hasNodeFlag(transformerContext, node, diagnosticsReportedFlag)) {
        return;
      }
      setNodeFlag(transformerContext, node, diagnosticsReportedFlag);

      const allRequireRuntimeDiagnostics = result.allRequiresRuntimeResult.map(r => r.getDiagnostics());
      if (!allRequireRuntimeDiagnostics.length && result.glitzUsedInEvaluation) {
        allRequireRuntimeDiagnostics.push(undefined);
      }

      let message = '';
      switch (expected) {
        case ExpectedEvaluationResult.CssProp:
          message = 'Unable to statically evaluate css prop';
          break;
        case ExpectedEvaluationResult.ElementOrComponent:
          message = 'Unable to statically evaluate to a component or element';
          break;
        case ExpectedEvaluationResult.StylesArray:
          message = 'Unable to statically evaluate to one or more style objects';
          break;
      }
      if (bailedOnTopLevelComposedStyledElement) {
        message =
          'Top level styled.[Element] cannot be statically extracted inside components that are decorated by other components';
      } else if (result.allFunctions.length && !transformerContext.staticThemesFile) {
        message = 'Functions in style objects requires runtime or statically declared themes';
        for (const func of result.allFunctions) {
          transformerContext.diagnosticsReporter({
            message,
            severity,
            file: func.tsNode.getSourceFile().fileName,
            line: getLineNumber(func.tsNode),
            source: func.tsNode.getText(),
          });
        }
      }

      for (const requireRuntimeDiagnostics of allRequireRuntimeDiagnostics) {
        transformerContext.diagnosticsReporter({
          message,
          severity,
          file: node.getSourceFile().fileName,
          line: getLineNumber(node),
          source: node.getText(),
          innerDiagnostic: requireRuntimeDiagnostics
            ? {
                file: requireRuntimeDiagnostics.file,
                line: requireRuntimeDiagnostics.line,
                message: requireRuntimeDiagnostics.message,
                source: requireRuntimeDiagnostics.source,
                severity,
              }
            : undefined,
        });
      }
    },
  };

  if (stats) {
    result.glitzUsedInEvaluation = staticGlitzUsed(stats);
  }

  if (Array.isArray(evaluationResult)) {
    if (expected === ExpectedEvaluationResult.StylesArray) {
      if (evaluationResult.every(s => isEvaluableStyle(s, !!transformerContext.staticThemes))) {
        result.stylesArray = evaluationResult;
      } else {
        result.canUseResult = false;
        for (const style of evaluationResult.map(stripUnevaluableProperties)) {
          transformerContext.glitz.injectStyle(style);
        }
      }
    } else if (expected === ExpectedEvaluationResult.ElementOrComponent) {
      let staticElementOrComponent: StaticElement | StaticComponent | undefined = undefined;
      for (const elem of evaluationResult) {
        if (isStaticElement(elem) || isStaticComponent(elem)) {
          staticElementOrComponent = elem;
          transformerContext.glitz.injectStyle(elem.styles.map(stripUnevaluableProperties));
        } else if (staticElementOrComponent) {
          staticElementOrComponent.styles.push(elem);
          transformerContext.glitz.injectStyle(stripUnevaluableProperties(elem));
        }
      }
      if (
        staticElementOrComponent &&
        staticElementOrComponent.styles.every(s => isEvaluableStyle(s, !!transformerContext.staticThemesFile))
      ) {
        result.elementOrComponent = staticElementOrComponent;
      } else {
        result.canUseResult = false;
      }
    } else if (expected === ExpectedEvaluationResult.CssProp) {
      if (evaluationResult.every(s => isEvaluableStyle(s, !!transformerContext.staticThemesFile, true))) {
        result.cssProp = evaluationResult;
      } else {
        result.canUseResult = false;
        for (const style of evaluationResult.map(stripUnevaluableProperties)) {
          transformerContext.glitz.injectStyle(style);
        }
      }
    }
  } else {
    if (expected === ExpectedEvaluationResult.ElementOrComponent) {
      if (!isStaticComponent(evaluationResult) && !isStaticElement(evaluationResult)) {
        result.canUseResult = false;
      } else {
        if (evaluationResult.styles.every(s => isEvaluableStyle(s, !!transformerContext.staticThemesFile))) {
          result.elementOrComponent = evaluationResult;
        } else {
          for (const style of evaluationResult.styles.map(stripUnevaluableProperties)) {
            transformerContext.glitz.injectStyle(style);
          }
          result.canUseResult = false;
        }
      }
    } else if (expected === ExpectedEvaluationResult.CssProp) {
      if (isEvaluableStyle(evaluationResult, !!transformerContext.staticThemesFile, true)) {
        result.cssProp = [evaluationResult];
      } else {
        result.canUseResult = false;
        transformerContext.glitz.injectStyle(stripUnevaluableProperties(evaluationResult));
      }
    }
  }

  if (expected === ExpectedEvaluationResult.CssProp && result.cssProp) {
    if (
      isTopLevelJsxInComposedComponent(
        node,
        transformerContext.program.getTypeChecker(),
        transformerContext.staticStyledComponents,
      )
    ) {
      result.canUseResult = false;
      for (const style of result.cssProp.map(stripUnevaluableProperties)) {
        transformerContext.glitz.injectStyle(style);
      }
      result.cssProp = undefined;
      bailedOnTopLevelComposedStyledElement = true;
      const jsxElement = getJsxElement(node);
      if (jsxElement) {
        const originalNode = ts.getOriginalNode(jsxElement);
        if (transformerContext.transformations.has(originalNode)) {
          transformerContext.transformations.set(originalNode, originalNode);
        }
        if (transformerContext.appliedTransformations.has(originalNode)) {
          transformerContext.appliedTransformations.set(originalNode, originalNode);
        }
      }
    }
  }
  if (!transformerContext.staticThemesFile && result.allFunctions.length) {
    result.canUseResult = false;
  }
  if (result.allRequiresRuntimeResult.length) {
    result.canUseResult = false;
  }
  return result;
}

type EvaluationResults = {
  requiresRuntimeResult: RequiresRuntimeResult[];
  functions: FunctionWithTsNode[];
  nodes: ts.Node[];
};

function collectEvaluationObjects(obj: any, result?: EvaluationResults): EvaluationResults {
  result = result ?? {
    requiresRuntimeResult: [],
    functions: [],
    nodes: [],
  };
  if (obj) {
    if (isRequiresRuntimeResult(obj)) {
      result.requiresRuntimeResult.push(obj);
    } else if (isNode(obj)) {
      result.nodes.push(obj);
    } else if (typeof obj === 'function') {
      if (!isStaticComponent(obj) && !isStaticDecorator(obj)) {
        result.functions.push(obj);
      } else if (isStaticComponent(obj)) {
        for (const elem of obj.styles) {
          collectEvaluationObjects(elem, result);
        }
      }
    } else if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        for (const elem of obj) {
          collectEvaluationObjects(elem, result);
        }
      } else {
        for (const key in obj) {
          collectEvaluationObjects(obj[key], result);
        }
      }
    }
  }
  return result;
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
      } else if (!isNode(obj)) {
        for (const key in obj) {
          const res = getAllRequiresRuntimeResult(obj[key]);
          result.push(...res);
        }
      }
    }
  }
  return result;
}

function isEvaluableStyle(object: any, hasStaticThemes: boolean, allowTernaries = false): object is EvaluatedStyle {
  if (!isRequiresRuntimeResult(object)) {
    if (typeof object === 'function') {
      return false;
    }
    for (const key in object) {
      const value = object[key];
      if (isNode(value) && ts.isConditionalExpression(value)) {
        return allowTernaries;
      }
      if (isRequiresRuntimeResult(value)) {
        return false;
      }
      if (!hasStaticThemes && typeof value === 'function') {
        return false;
      }
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !isEvaluableStyle(value, hasStaticThemes, allowTernaries)
      ) {
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

function stripUnevaluableProperties(obj: any): EvaluatedStyle {
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  if (isRequiresRuntimeResult(obj)) {
    return {};
  }
  const style: EvaluatedStyle = {};
  for (const key in obj) {
    if (!isRequiresRuntimeResult(obj[key]) && !isNode(obj[key]) && typeof obj[key] !== 'function') {
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

function getSeverity(node: ts.Node, transformerContext: TransformerContext): Severity | 'suppressed' {
  if (transformerContext.allStylesShouldBeStatic || transformerContext.currentFileShouldBeStatic) {
    return 'error';
  }
  let severity: Severity = 'info';
  while (node.parent) {
    if (hasComment(node, glitzComments.static)) {
      severity = 'error';
      break;
    }
    if (hasComment(node, glitzComments.suppress)) {
      return 'suppressed';
    }
    node = node.parent;
  }
  return severity;
}

function isFunctionWithTsNode(o: unknown): o is FunctionWithTsNode {
  if (!o || typeof o !== 'function') {
    return false;
  }
  const func = o as FunctionWithTsNode;
  return !!func.tsNode;
}

function isFunction(node: ts.Node): node is ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression {
  return ts.isArrowFunction(node) || ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node);
}

// Important to mark all calls to glitz functions as pure as it means the minifier
// will remove the calls if the aren't used. If they're not marked as pure the
// minifier can't be sure that the function calls doesn't cause side effects.
function declarePure(node: ts.CallExpression) {
  const existingComments = ts.getSyntheticLeadingComments(node);
  if (existingComments && existingComments.find(c => c.text === '#__PURE__')) {
    return;
  }

  ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, '#__PURE__', false);
}

function hasNodeFlag(transformerContext: TransformerContext, node: ts.Node, flag: string) {
  return transformerContext.nodeFlags.get(node)?.find(f => f === flag);
}

function setNodeFlag(transformerContext: TransformerContext, node: ts.Node, flag: string) {
  if (!transformerContext.nodeFlags.has(node)) {
    transformerContext.nodeFlags.set(node, []);
  }
  if (!hasNodeFlag(transformerContext, node, flag)) {
    transformerContext.nodeFlags.get(node)!.push(flag);
  }
}

function staticGlitzUsed(stats: EvaluationStats) {
  let staticGlitzUsed = false;
  stats.usedVariables!.forEach((_, k) => {
    if (k.getSourceFile().fileName.indexOf(glitzReactModuleName) !== -1) {
      staticGlitzUsed = true;
    }
  });
  return staticGlitzUsed;
}

function getLineNumber(node: ts.Node) {
  node = ts.getOriginalNode(node);
  const file = ts.getOriginalNode(node.getSourceFile()) as ts.SourceFile;
  return file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
}

function isNode(obj: unknown): obj is ts.Node {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  const node = obj as ts.Node;
  return !!node.kind && !!node.pos;
}
