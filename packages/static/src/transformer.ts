import * as ts from 'typescript';
import { GlitzStatic } from '@glitz/core';
import { isStaticElement, isStaticComponent } from './shared';
import { evaluate, isRequiresRuntimeResult, RequiresRuntimeResult, requiresRuntimeResult } from './evaluator';

export const moduleName = '@glitz/react';
export const styledName = 'styled';

export type FunctionWithTsNode = {
  (...args: any[]): any;
  tsNode?: ts.Node;
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

export type Diagnostic = {
  message: string;
  severity: 'error' | 'warning' | 'info';
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

export function transformer(
  program: ts.Program,
  glitz: GlitzStatic,
  diagnosticsReporter?: DiagnosticsReporter,
  mode?: 'development' | 'production',
): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (file: ts.SourceFile) => {
    if (file.fileName.endsWith('.tsx')) {
      if (file.statements.find(s => hasJSDocTag(s, 'glitz-all-dynamic'))) {
        return file;
      }
      const allShouldBeStatic = !!file.statements.find(s => hasJSDocTag(s, 'glitz-all-static'));

      const staticStyledComponents = {
        symbolToComponent: new Map<ts.Symbol, StaticStyledComponent>(),
        symbolsWithReferencesOutsideJsx: new Map<
          ts.Symbol,
          { component: StaticStyledComponent; references: ts.Node[]; hasBeenReported: false }
        >(),
        composedComponentSymbols: [],
      };

      // We first make a first pass to gather information about the file and populate `staticStyledComponents`.
      // The reason why we can't do this in a single pass is because we visit the file from top to bottom, and there
      // might be declarations at the bottom of the file that affects the top of the file.
      // The biggest issue here is that styled components are typically declared at the bottom of the file
      // and used in the top of the file, and we need to find the declarations before we can run transformation.
      const firstPassTransformedFile = visitNodeAndChildren(
        file,
        program,
        context,
        glitz,
        staticStyledComponents,
        allShouldBeStatic,
        true,
        diagnosticsReporter,
        mode,
      );
      let transformedNode = visitNodeAndChildren(
        firstPassTransformedFile,
        program,
        context,
        glitz,
        staticStyledComponents,
        allShouldBeStatic,
        false,
        diagnosticsReporter,
        mode,
      );

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
        transformedNode = visitNodeAndChildren(
          firstPassTransformedFile,
          program,
          context,
          glitz,
          staticStyledComponents,
          allShouldBeStatic,
          false,
          diagnosticsReporter,
          mode,
        );
      }

      return transformedNode;
    } else {
      return file;
    }
  };
}

function visitNodeAndChildren(
  node: ts.SourceFile,
  program: ts.Program,
  context: ts.TransformationContext,
  glitz: GlitzStatic,
  staticStyledComponents: StaticStyledComponents,
  allShouldBeStatic: boolean,
  isFirstPass: boolean,
  diagnosticsReporter: DiagnosticsReporter | undefined,
  mode: 'development' | 'production' | undefined,
): ts.SourceFile;
function visitNodeAndChildren(
  node: ts.Node,
  program: ts.Program,
  context: ts.TransformationContext,
  glitz: GlitzStatic,
  staticStyledComponents: StaticStyledComponents,
  allShouldBeStatic: boolean,
  isFirstPass: boolean,
  diagnosticsReporter: DiagnosticsReporter | undefined,
  mode: 'development' | 'production' | undefined,
): ts.Node | ts.Node[];
function visitNodeAndChildren(
  node: ts.Node,
  program: ts.Program,
  context: ts.TransformationContext,
  glitz: GlitzStatic,
  staticStyledComponents: StaticStyledComponents,
  allShouldBeStatic: boolean,
  isFirstPass: boolean,
  diagnosticsReporter: DiagnosticsReporter | undefined,
  mode: 'development' | 'production' | undefined,
): ts.Node | ts.Node[] {
  const visitedNode = visitNode(
    node,
    program,
    glitz,
    staticStyledComponents,
    allShouldBeStatic,
    isFirstPass,
    diagnosticsReporter,
    mode,
  );
  if (visitedNode) {
    return ts.visitEachChild(
      visitedNode,
      childNode =>
        visitNodeAndChildren(
          childNode,
          program,
          context,
          glitz,
          staticStyledComponents,
          allShouldBeStatic,
          isFirstPass,
          diagnosticsReporter,
          mode,
        ),
      context,
    );
  } else {
    return [];
  }
}

function visitNode(
  node: ts.Node,
  program: ts.Program,
  glitz: GlitzStatic,
  staticStyledComponents: StaticStyledComponents,
  allShouldBeStatic: boolean,
  isFirstPass: boolean,
  diagnosticsReporter: DiagnosticsReporter | undefined,
  mode: 'development' | 'production' | undefined,
): ts.Node | undefined {
  const typeChecker = program.getTypeChecker();

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

  // This evaluates imported styled components
  if (ts.isImportSpecifier(node) && isFirstPass) {
    if (isComponentName(node.name.text)) {
      const symbol = typeChecker.getSymbolAtLocation(node.name);
      if (symbol) {
        const potentialStyledComponent = evaluate(node.propertyName ?? node.name, program);
        if (isStaticComponent(potentialStyledComponent)) {
          if (potentialStyledComponent.styles.every(isEvaluableStyle)) {
            const component: StaticStyledComponent = {
              componentName: node.name.text,
              elementName: potentialStyledComponent.elementName,
              styles: potentialStyledComponent.styles,
            };
            staticStyledComponents.symbolToComponent.set(symbol, component);
          } else {
            if (diagnosticsReporter) {
              reportRequiresRuntimeResult(
                'Styled component could not be statically evaluated',
                'info',
                potentialStyledComponent.styles.filter(isRequiresRuntimeResultOrStyleWithFunction),
                node,
                diagnosticsReporter,
              );
            }
          }
        }
        return node;
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

  if (isFirstPass && ts.isCallExpression(node) && isStyledCall(node)) {
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
          const shouldBeStatic = hasJSDocTag(node, 'glitz-static') || allShouldBeStatic;
          const componentName = declaration.name.getText();

          if (!isFirstPass) {
            reportUsageOutsideOfJsxIfNeeded(
              componentSymbol,
              componentName,
              staticStyledComponents,
              shouldBeStatic,
              diagnosticsReporter,
            );
            return node;
          }

          if (ts.isCallExpression(declaration.initializer) && ts.isIdentifier(declaration.name)) {
            // Since some declarations of styled components are complex and look like:
            // const Styled = createComponent();
            // we look at the variable name to see if it's a variable with Pascal case
            // and in that case try to evaluate it to a styled component.
            if (isComponentName(componentName)) {
              const object = evaluate(declaration.initializer, program);
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

                if (object.styles.every(isEvaluableStyle)) {
                  const component = {
                    componentName,
                    elementName: object.elementName,
                    styles: object.styles,
                  };
                  for (const style of object.styles.map(stripUnevaluableProperties)) {
                    glitz.injectStyle(style);
                  }

                  staticStyledComponents.symbolToComponent.set(componentSymbol, component);
                } else {
                  for (const style of object.styles.map(stripUnevaluableProperties)) {
                    glitz.injectStyle(style);
                  }

                  if (hasJSDocTag(node, 'glitz-static') || allShouldBeStatic) {
                    if (diagnosticsReporter) {
                      reportRequiresRuntimeResultWhenShouldBeStatic(
                        object.styles.filter(isRequiresRuntimeResultOrStyleWithFunction),
                        node,
                        diagnosticsReporter,
                      );
                    }
                  } else {
                    if (diagnosticsReporter) {
                      reportRequiresRuntimeResult(
                        'Styled component could not be statically evaluated',
                        'info',
                        object.styles.filter(isRequiresRuntimeResultOrStyleWithFunction),
                        node,
                        diagnosticsReporter,
                      );
                    }
                  }
                }
              } else if (requiresRuntimeResult(object) && isStyledCall(declaration.initializer)) {
                if (hasJSDocTag(node, 'glitz-static') || allShouldBeStatic) {
                  reportRequiresRuntimeResultWhenShouldBeStatic(object, node, diagnosticsReporter);
                } else {
                  reportRequiresRuntimeResult(
                    'Styled component could not be statically evaluated',
                    'info',
                    object,
                    node,
                    diagnosticsReporter,
                  );
                }
              }
            }
          }
        }
      }
    }
  }

  // On the second and third passes we look for JSX tags to actually
  // replace. We _could_ look for these even if the first pass and
  // replace JSX uses where the component has been defined before
  // it's used in JSX (which is uncommon) but since we either way
  // need to make multiple passes we skip JSX on the first.
  if (!isFirstPass) {
    if (
      ts.isJsxSelfClosingElement(node) &&
      ts.isPropertyAccessExpression(node.tagName) &&
      ts.isIdentifier(node.tagName.expression) &&
      node.tagName.expression.escapedText.toString() === styledName
    ) {
      // We now know that: node == `<styled.[element name] />`
      if (!isTopLevelJsxInComposedComponent(node, typeChecker, staticStyledComponents)) {
        const elementName = node.tagName.name.escapedText.toString().toLowerCase();
        const cssData = getCssDataFromCssProp(node, program, glitz, allShouldBeStatic, diagnosticsReporter);
        if (cssData) {
          // Everything is static, replace `<styled.[element name] />` with `<[element name] className="[classes]" />`
          const jsxElement = ts.createJsxSelfClosingElement(
            ts.createIdentifier(elementName),
            undefined,
            ts.createJsxAttributes([
              ...passThroughProps(node.attributes.properties),
              ts.createJsxAttribute(
                ts.createIdentifier('className'),
                ts.createStringLiteral(glitz.injectStyle(cssData)),
              ),
              ...(mode === 'development'
                ? [
                    ts.createJsxAttribute(
                      ts.createIdentifier('data-glitzname'),
                      ts.createStringLiteral('styled.' + node.tagName.name.escapedText),
                    ),
                  ]
                : []),
            ]),
          );
          ts.setOriginalNode(jsxElement, node);
          return jsxElement;
        }
      } else {
        reportTopLevelJsxInComposedComponent(node, diagnosticsReporter);
      }
    }

    if (ts.isJsxElement(node)) {
      const openingElement = node.openingElement;
      if (
        ts.isPropertyAccessExpression(openingElement.tagName) &&
        ts.isIdentifier(openingElement.tagName.expression) &&
        openingElement.tagName.expression.escapedText.toString() === styledName
      ) {
        // We now know that: node == `<styled.[element name]>[zero or more children]</styled.[element name]>`
        if (!isTopLevelJsxInComposedComponent(node, typeChecker, staticStyledComponents)) {
          const elementName = openingElement.tagName.name.escapedText.toString().toLowerCase();
          const cssData = getCssDataFromCssProp(openingElement, program, glitz, allShouldBeStatic, diagnosticsReporter);
          if (cssData) {
            // Everything is static, replace `<[element name] className="[classes]">[zero or more children]</[element name]>`
            const jsxOpeningElement = ts.createJsxOpeningElement(
              ts.createIdentifier(elementName),
              undefined,
              ts.createJsxAttributes([
                ...passThroughProps(node.openingElement.attributes.properties),
                ts.createJsxAttribute(
                  ts.createIdentifier('className'),
                  ts.createStringLiteral(glitz.injectStyle(cssData)),
                ),
                ...(mode === 'development'
                  ? [
                      ts.createJsxAttribute(
                        ts.createIdentifier('data-glitzname'),
                        ts.createStringLiteral('styled.' + openingElement.tagName.name.escapedText),
                      ),
                    ]
                  : []),
              ]),
            );
            ts.setOriginalNode(jsxOpeningElement, node.openingElement);

            const jsxClosingElement = ts.createJsxClosingElement(ts.createIdentifier(elementName));
            ts.setOriginalNode(jsxClosingElement, node.closingElement);

            const jsxElement = ts.createJsxElement(jsxOpeningElement, node.children, jsxClosingElement);
            ts.setOriginalNode(jsxElement, node);
            return jsxElement;
          }
        } else {
          reportTopLevelJsxInComposedComponent(node, diagnosticsReporter);
        }
      }

      if (ts.isIdentifier(openingElement.tagName) && ts.isIdentifier(openingElement.tagName)) {
        const jsxTagSymbol = typeChecker.getSymbolAtLocation(openingElement.tagName);
        if (
          jsxTagSymbol &&
          staticStyledComponents.symbolToComponent.has(jsxTagSymbol) &&
          !staticStyledComponents.symbolsWithReferencesOutsideJsx.has(jsxTagSymbol)
        ) {
          // We now know that: node == `<[styled component name] [zero or more props]>[zero or more children]</[styled component name]>`
          // and we also know that the JSX points to a component that is 100% static
          // and is not referenced outside of JSX.
          if (!isTopLevelJsxInComposedComponent(node, typeChecker, staticStyledComponents)) {
            const cssPropData = getCssDataFromCssProp(
              openingElement,
              program,
              glitz,
              allShouldBeStatic,
              diagnosticsReporter,
            );
            const styledComponent = staticStyledComponents.symbolToComponent.get(jsxTagSymbol)!;
            if (styledComponent.elementName) {
              let styles = styledComponent.styles.filter(style => !!style);
              if (cssPropData) {
                styles = styles.slice();
                styles.push(cssPropData);
              }

              // Everything is static, replace with `<[element name] className="[classes]" [zero or more props]>[zero or more children]</[element name]>`
              const jsxOpeningElement = ts.createJsxOpeningElement(
                ts.createIdentifier(styledComponent.elementName),
                undefined,
                ts.createJsxAttributes([
                  ...passThroughProps(node.openingElement.attributes.properties),
                  ts.createJsxAttribute(
                    ts.createIdentifier('className'),
                    ts.createStringLiteral(glitz.injectStyle(styles)),
                  ),
                  ...(mode === 'development' && styledComponent.componentName
                    ? [
                        ts.createJsxAttribute(
                          ts.createIdentifier('data-glitzname'),
                          ts.createStringLiteral(styledComponent.componentName),
                        ),
                      ]
                    : []),
                ]),
              );
              ts.setOriginalNode(jsxOpeningElement, node.openingElement);

              const jsxClosingElement = ts.createJsxClosingElement(ts.createIdentifier(styledComponent.elementName));
              ts.setOriginalNode(jsxClosingElement, node.closingElement);

              const jsxElement = ts.createJsxElement(jsxOpeningElement, node.children, jsxClosingElement);
              ts.setOriginalNode(jsxElement, node);
              return jsxElement;
            }
          } else {
            reportTopLevelJsxInComposedComponent(node, diagnosticsReporter);
          }
        }
      }
    }
  }

  if (ts.isJsxSelfClosingElement(node) && ts.isIdentifier(node.tagName)) {
    const jsxTagSymbol = typeChecker.getSymbolAtLocation(node.tagName);
    if (
      jsxTagSymbol &&
      staticStyledComponents.symbolToComponent.has(jsxTagSymbol) &&
      !staticStyledComponents.symbolsWithReferencesOutsideJsx.has(jsxTagSymbol)
    ) {
      // We now know that: node == `<[styled component name] [zero or more props] />`
      // and we also know that the JSX points to a component that is 100% static
      // and is not referenced outside of JSX.
      if (!isTopLevelJsxInComposedComponent(node, typeChecker, staticStyledComponents)) {
        const cssPropData = getCssDataFromCssProp(node, program, glitz, allShouldBeStatic, diagnosticsReporter);
        const styledComponent = staticStyledComponents.symbolToComponent.get(jsxTagSymbol)!;
        if (styledComponent.elementName) {
          let styles = styledComponent.styles.filter(style => !!style);
          if (cssPropData) {
            styles = styles.slice();
            styles.push(cssPropData);
          }

          // Everything is static, replace with `<[element name] className="[classes]" [zero or more props] />`
          const jsxElement = ts.createJsxSelfClosingElement(
            ts.createIdentifier(styledComponent.elementName),
            undefined,
            ts.createJsxAttributes([
              ...passThroughProps(node.attributes.properties),
              ts.createJsxAttribute(
                ts.createIdentifier('className'),
                ts.createStringLiteral(glitz.injectStyle(styles)),
              ),
              ...(mode === 'development' && styledComponent.componentName
                ? [
                    ts.createJsxAttribute(
                      ts.createIdentifier('data-glitzname'),
                      ts.createStringLiteral(styledComponent.componentName),
                    ),
                  ]
                : []),
            ]),
          );
          ts.setOriginalNode(jsxElement, node);
          return jsxElement;
        }
      } else {
        reportTopLevelJsxInComposedComponent(node, diagnosticsReporter);
      }
    }
  }

  return node;
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
  staticStyledComponents: StaticStyledComponents,
  shouldBeStatic: boolean,
  diagnosticsReporter: DiagnosticsReporter | undefined,
) {
  if (diagnosticsReporter && staticStyledComponents.symbolsWithReferencesOutsideJsx.has(componentSymbol)) {
    const outsideJsxUsage = staticStyledComponents.symbolsWithReferencesOutsideJsx.get(componentSymbol)!;
    if (!outsideJsxUsage.hasBeenReported) {
      const references = outsideJsxUsage.references;

      for (const reference of references) {
        const sourceFile = reference.getSourceFile();
        const stmt = getStatement(reference);

        diagnosticsReporter({
          file: sourceFile.fileName,
          message: `Component '${componentName}' cannot be statically extracted since it's used outside of JSX`,
          source: stmt.getText(),
          severity: shouldBeStatic ? 'error' : 'info',
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
  let parent = node.parent;
  while (true) {
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

function reportTopLevelJsxInComposedComponent(node: ts.Node, diagnosticsReporter: DiagnosticsReporter | undefined) {
  const sourceFile = node.getSourceFile();
  if (diagnosticsReporter) {
    diagnosticsReporter({
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

function reportRequiresRuntimeResultWhenShouldBeStatic(
  requiresRuntimeResults: RequiresRuntimeResult | RequiresRuntimeResult[] | EvaluatedStyle[],
  node: ts.Node,
  reporter: DiagnosticsReporter | undefined,
) {
  reportRequiresRuntimeResult(
    'Component marked with @glitz-static could not be statically evaluated',
    'error',
    requiresRuntimeResults,
    node,
    reporter,
  );
}

function reportRequiresRuntimeResult(
  message: string,
  severity: 'error' | 'warning' | 'info',
  requiresRuntimeResults: RequiresRuntimeResult | RequiresRuntimeResult[] | EvaluatedStyle[],
  node: ts.Node,
  reporter: DiagnosticsReporter | undefined,
) {
  for (const result of Array.isArray(requiresRuntimeResults) ? requiresRuntimeResults : [requiresRuntimeResults]) {
    const innerDiagnostics: Diagnostic[] = [];
    let requiresRuntime = getRequiresRuntimeResult(result);
    if (!requiresRuntime) {
      const propFunc = anyValuesAreFunctions(result as EvaluatedStyle);
      if (propFunc) {
        if (propFunc) {
          requiresRuntime = requiresRuntimeResult(
            'Functions in style objects requires runtime',
            (propFunc as FunctionWithTsNode).tsNode ?? node,
          );
        }
      }
    }
    if (requiresRuntime) {
      const requireRuntimeDiagnostics = requiresRuntime.getDiagnostics();
      if (requireRuntimeDiagnostics) {
        innerDiagnostics.push({
          file: requireRuntimeDiagnostics.file,
          line: requireRuntimeDiagnostics.line,
          message: requireRuntimeDiagnostics.message,
          source: requireRuntimeDiagnostics.source,
          severity,
        });
      }
    }
    const file = node.getSourceFile();
    for (const innerDiagnostic of innerDiagnostics) {
      if (reporter) {
        reporter({
          message,
          file: file.fileName,
          line: file.getLineAndCharacterOfPosition(node.pos).line,
          source: node.getText(),
          severity,
          innerDiagnostic,
        });
      }
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
  tsStyle: ts.ObjectLiteralExpression,
  program: ts.Program,
  node: ts.Node,
  glitz: GlitzStatic,
  parentComponent: StaticStyledComponent,
): (EvaluatedStyle | RequiresRuntimeResult)[];
function getCssData(
  tsStyle: ts.ObjectLiteralExpression,
  program: ts.Program,
  node: ts.Node,
  glitz: GlitzStatic,
): EvaluatedStyle | RequiresRuntimeResult;
function getCssData(
  tsStyle: ts.ObjectLiteralExpression,
  program: ts.Program,
  node: ts.Node,
  glitz: GlitzStatic,
  parentComponent?: StaticStyledComponent,
): (EvaluatedStyle | RequiresRuntimeResult)[] | EvaluatedStyle | RequiresRuntimeResult {
  const style = evaluate(tsStyle, program) as EvaluatedStyle | RequiresRuntimeResult;
  glitz.injectStyle(stripUnevaluableProperties(style));
  const requiresRuntime = getRequiresRuntimeResult(style);
  if (requiresRuntime) {
    return requiresRuntime;
  }
  const propFunc = anyValuesAreFunctions(style as EvaluatedStyle);
  if (propFunc) {
    return requiresRuntimeResult(
      'Functions in style objects requires runtime',
      (propFunc as FunctionWithTsNode).tsNode ?? node,
    );
  }

  if (parentComponent) {
    return [...parentComponent.styles, style];
  }

  return style;
}

function anyValuesAreFunctions(style: EvaluatedStyle, level = 0): boolean | FunctionWithTsNode {
  if (level > 10) {
    console.log('Possibly infinite recursion detected in:', style);
    return false;
  }
  if (style && typeof style === 'object') {
    for (const key in style) {
      if (typeof style[key] === 'function') {
        return (style[key] as unknown) as FunctionWithTsNode;
      } else if (style[key] && typeof style[key] === 'object' && !Array.isArray(style[key])) {
        const func = anyValuesAreFunctions(style[key] as EvaluatedStyle, level + 1);
        if (func !== false) {
          return func;
        }
      }
    }
  }
  return false;
}

function getCssDataFromCssProp(
  node: ts.JsxSelfClosingElement | ts.JsxOpeningElement,
  program: ts.Program,
  glitz: GlitzStatic,
  allShouldBeStatic: boolean,
  diagnosticsReporter?: DiagnosticsReporter,
) {
  const cssJsxAttr = node.attributes.properties.find(
    p => p.name && ts.isIdentifier(p.name) && p.name.escapedText.toString() === 'css',
  );
  if (
    cssJsxAttr &&
    ts.isJsxAttribute(cssJsxAttr) &&
    cssJsxAttr.initializer &&
    ts.isJsxExpression(cssJsxAttr.initializer) &&
    cssJsxAttr.initializer.expression &&
    ts.isObjectLiteralExpression(cssJsxAttr.initializer.expression)
  ) {
    const cssData = getCssData(cssJsxAttr.initializer.expression, program, node, glitz);
    if (isEvaluableStyle(cssData)) {
      return cssData;
    } else if (allShouldBeStatic) {
      if (diagnosticsReporter) {
        reportRequiresRuntimeResultWhenShouldBeStatic(cssData, node, diagnosticsReporter);
      }
    } else {
      if (diagnosticsReporter) {
        reportRequiresRuntimeResult(
          'css prop could not be statically evaluated',
          'info',
          cssData,
          node,
          diagnosticsReporter,
        );
      }
    }
  }
  return undefined;
}

function isEvaluableStyle(object: EvaluatedStyle | RequiresRuntimeResult): object is EvaluatedStyle {
  if (!isRequiresRuntimeResult(object)) {
    for (const key in object) {
      const value = object[key];
      if (isRequiresRuntimeResult(value)) {
        return false;
      }
      if (typeof value === 'function') {
        return false;
      }
      if (value && typeof value === 'object' && !Array.isArray(value) && !isEvaluableStyle(value)) {
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

function getRequiresRuntimeResult(
  obj: RequiresRuntimeResult | { [key: string]: any },
): RequiresRuntimeResult | undefined {
  if (isRequiresRuntimeResult(obj)) {
    return obj;
  }
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }
  for (const key in obj) {
    if (isRequiresRuntimeResult(obj[key])) {
      return obj[key];
    }
  }
  return undefined;
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
