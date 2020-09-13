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
): ts.Node | ts.Node[] {
  const visitedNode = visitNode(
    node,
    program,
    glitz,
    staticStyledComponents,
    allShouldBeStatic,
    isFirstPass,
    diagnosticsReporter,
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
    const symbol = typeChecker.getSymbolAtLocation(node.name);
    if (symbol) {
      const potentialStyledComponent = evaluate(node.propertyName ?? node.name, program, {});
      if (isStaticComponent(potentialStyledComponent)) {
        const component: StaticStyledComponent = {
          componentName: node.name.text,
          elementName: potentialStyledComponent.elementName,
          styles: potentialStyledComponent.styles,
        };
        staticStyledComponents.symbolToComponent.set(symbol, component);
        return node;
      }
    }
  }

  if (
    ts.isImportDeclaration(node) &&
    node.importClause &&
    node.importClause.namedBindings &&
    ts.isNamedImports(node.importClause.namedBindings) &&
    !isFirstPass
  ) {
    let importedStaticComponents = 0;
    for (const element of node.importClause.namedBindings.elements) {
      const symbol = typeChecker.getSymbolAtLocation(element.name);
      if (
        symbol &&
        staticStyledComponents.symbolToComponent.has(symbol) &&
        !staticStyledComponents.symbolsWithReferencesOutsideJsx.has(symbol)
      ) {
        importedStaticComponents++;
      }
    }

    if (importedStaticComponents === node.importClause.namedBindings.elements.length) {
      return undefined;
    }
    return node;
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

  // This is where we either collect or replace/transform a styled component declaration
  // like this:
  // const Styled = styled.div({color: 'red'});
  // or:
  // const Styled = styled(TheParent, {color: 'red'});
  if (
    ts.isVariableStatement(node) &&
    (!node.modifiers || !node.modifiers.find(m => m.kind == ts.SyntaxKind.ExportKeyword))
  ) {
    if (node.declarationList.declarations.length === 1) {
      const declaration = node.declarationList.declarations[0];
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        const componentSymbol = typeChecker.getSymbolAtLocation(declaration.name);
        if (componentSymbol) {
          const shouldBeStatic = hasJSDocTag(node, 'glitz-static') || allShouldBeStatic;
          const componentName = declaration.name.getText();

          if (!isFirstPass) {
            return replaceComponentDeclarationNode(
              componentSymbol,
              componentName,
              node,
              staticStyledComponents,
              shouldBeStatic,
              diagnosticsReporter,
            );
          }

          if (ts.isCallExpression(declaration.initializer) && ts.isIdentifier(declaration.name)) {
            const callExpr = declaration.initializer;

            if (ts.isPropertyAccessExpression(callExpr.expression) && ts.isIdentifier(callExpr.expression.expression)) {
              if (callExpr.expression.expression.escapedText === styledName) {
                const elementName = callExpr.expression.name.escapedText.toString();
                const styleObject = callExpr.arguments[0];
                if (callExpr.arguments.length === 1 && !!styleObject && ts.isObjectLiteralExpression(styleObject)) {
                  // We now know that: node == `const [variable name] = styled.[element name]({[css rules]})`

                  const cssData = getCssData(styleObject, program, node);
                  if (isEvaluableStyle(cssData)) {
                    const component = {
                      componentName,
                      elementName,
                      styles: [cssData],
                    };
                    staticStyledComponents.symbolToComponent.set(componentSymbol, component);
                    return node;
                  } else if (shouldBeStatic) {
                    if (diagnosticsReporter) {
                      reportRequiresRuntimeResultWhenShouldBeStatic(cssData, node, diagnosticsReporter);
                    }
                  } else {
                    if (diagnosticsReporter) {
                      reportRequiresRuntimeResult(
                        'Styled component could not be statically evaluated',
                        'info',
                        cssData,
                        node,
                        diagnosticsReporter,
                      );
                    }
                  }
                }
              }
            }
            if (ts.isIdentifier(callExpr.expression) && callExpr.expression.escapedText.toString() === styledName) {
              if (callExpr.arguments.length === 1) {
                const styleObject = callExpr.arguments[0];
                if (ts.isObjectLiteralExpression(styleObject)) {
                  // We now know that: node == `const [variable name] = styled({[css rules]})`

                  const cssData = getCssData(styleObject, program, node);
                  if (isEvaluableStyle(cssData)) {
                    const component: StaticStyledComponent = {
                      componentName,
                      elementName: undefined,
                      styles: [cssData],
                    };
                    staticStyledComponents.symbolToComponent.set(componentSymbol, component);
                    return node;
                  } else if (hasJSDocTag(node, 'glitz-static') || allShouldBeStatic) {
                    if (diagnosticsReporter) {
                      reportRequiresRuntimeResultWhenShouldBeStatic(cssData, node, diagnosticsReporter);
                    }
                  } else {
                    if (diagnosticsReporter) {
                      reportRequiresRuntimeResult(
                        'Styled component could not be statically evaluated',
                        'info',
                        cssData,
                        node,
                        diagnosticsReporter,
                      );
                    }
                  }
                }
              } else if (callExpr.arguments.length === 2) {
                const parentStyledComponent = callExpr.arguments[0];
                const styleObject = callExpr.arguments[1];

                if (ts.isIdentifier(parentStyledComponent) && ts.isObjectLiteralExpression(styleObject)) {
                  // We now know that: node == `const [variable name] = styled([component to compose], {[css rules]})`
                  const parentSymbol = typeChecker.getSymbolAtLocation(parentStyledComponent)!;
                  const parent = staticStyledComponents.symbolToComponent.get(parentSymbol);
                  if (parent) {
                    const cssData = getCssData(styleObject, program, node, parent);
                    if (cssData.every(isEvaluableStyle)) {
                      const component = {
                        componentName,
                        elementName: parent.elementName,
                        styles: cssData as EvaluatedStyle[],
                        parent,
                      };
                      staticStyledComponents.symbolToComponent.set(componentSymbol, component);
                      return node;
                    } else if (hasJSDocTag(node, 'glitz-static') || allShouldBeStatic) {
                      if (diagnosticsReporter) {
                        reportRequiresRuntimeResultWhenShouldBeStatic(
                          cssData.filter(isRequiresRuntimeResult),
                          node,
                          diagnosticsReporter,
                        );
                      }
                    } else {
                      if (diagnosticsReporter) {
                        reportRequiresRuntimeResult(
                          'Styled component could not be statically evaluated',
                          'info',
                          cssData.filter(isRequiresRuntimeResult),
                          node,
                          diagnosticsReporter,
                        );
                      }
                    }
                  }
                }
              }
            }

            // Since some declarations of styled components are complex and look like:
            // const Styled = createComponent();
            // we look at the variable name to see if it's a variable with Pascal case
            // and in that case try to evaluate it to a styled component.
            if (
              componentName.length > 1 &&
              componentName[0] === componentName[0].toUpperCase() &&
              componentName[1] === componentName[1].toLowerCase()
            ) {
              let isThreewayComposition = false;
              if (ts.isCallExpression(declaration.initializer) && ts.isIdentifier(declaration.initializer.expression)) {
                const symbol = typeChecker.getSymbolAtLocation(declaration.initializer.expression);
                if (
                  symbol &&
                  staticStyledComponents.symbolToComponent.has(symbol) &&
                  declaration.initializer.arguments.length === 2
                ) {
                  isThreewayComposition = true;

                  const composeComponent = staticStyledComponents.symbolToComponent.get(symbol)!;
                  const baseComponentIdentifier = declaration.initializer.arguments[0];
                  const styleObject = declaration.initializer.arguments[1];

                  if (ts.isIdentifier(baseComponentIdentifier) && ts.isObjectLiteralExpression(styleObject)) {
                    const baseComponentSymbol = typeChecker.getSymbolAtLocation(baseComponentIdentifier);
                    if (baseComponentSymbol && staticStyledComponents.symbolToComponent.has(baseComponentSymbol)) {
                      const baseComponent = staticStyledComponents.symbolToComponent.get(baseComponentSymbol)!;

                      const cssData = getCssData(styleObject, program, node, baseComponent);
                      if (cssData.every(isEvaluableStyle)) {
                        const styles = composeComponent.styles.slice();
                        styles.push(...(cssData as EvaluatedStyle[]));

                        const component: StaticStyledComponent = {
                          componentName,
                          elementName: baseComponent.elementName,
                          styles,
                          parent: baseComponent,
                        };
                        staticStyledComponents.symbolToComponent.set(componentSymbol, component);
                      } else if (hasJSDocTag(node, 'glitz-static') || allShouldBeStatic) {
                        if (diagnosticsReporter) {
                          reportRequiresRuntimeResultWhenShouldBeStatic(
                            cssData.filter(isRequiresRuntimeResult),
                            node,
                            diagnosticsReporter,
                          );
                        }
                      } else {
                        if (diagnosticsReporter) {
                          reportRequiresRuntimeResult(
                            'Styled component could not be statically evaluated',
                            'info',
                            cssData.filter(isRequiresRuntimeResult),
                            node,
                            diagnosticsReporter,
                          );
                        }
                      }
                    }
                  }
                }
              }

              if (!isThreewayComposition) {
                const object = evaluate(declaration.initializer, program, {});
                if (isStaticElement(object) || isStaticComponent(object)) {
                  if (object.styles.every(isEvaluableStyle)) {
                    const component = {
                      componentName,
                      elementName: object.elementName,
                      styles: object.styles,
                    };
                    staticStyledComponents.symbolToComponent.set(componentSymbol, component);
                  } else if (hasJSDocTag(node, 'glitz-static') || allShouldBeStatic) {
                    if (diagnosticsReporter) {
                      reportRequiresRuntimeResultWhenShouldBeStatic(
                        object.styles.filter(isRequiresRuntimeResult),
                        node,
                        diagnosticsReporter,
                      );
                    }
                  } else {
                    if (diagnosticsReporter) {
                      reportRequiresRuntimeResult(
                        'Styled component could not be statically evaluated',
                        'info',
                        object.styles.filter(isRequiresRuntimeResult),
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
        const cssData = getCssDataFromCssProp(node, program, allShouldBeStatic, diagnosticsReporter);
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
          const cssData = getCssDataFromCssProp(openingElement, program, allShouldBeStatic, diagnosticsReporter);
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
            const cssPropData = getCssDataFromCssProp(openingElement, program, allShouldBeStatic, diagnosticsReporter);
            const styledComponent = staticStyledComponents.symbolToComponent.get(jsxTagSymbol)!;
            if (styledComponent.elementName) {
              let styles = styledComponent.styles;
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
        const cssPropData = getCssDataFromCssProp(node, program, allShouldBeStatic, diagnosticsReporter);
        const styledComponent = staticStyledComponents.symbolToComponent.get(jsxTagSymbol)!;
        if (styledComponent.elementName) {
          let styles = styledComponent.styles;
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
  let func: ts.ArrowFunction | ts.FunctionExpression | undefined = undefined;
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

// Used to removed declarations of components that is guaranteed to be static and no longer referenced.
// A smart minifier could probably detect that the variable is no longer used but it can't be certain
// that a call to `styled(...)` doesn't have any side effects so it would remove the variable but keep
// the call to `styled(...)`, transforming this:
// const Styled = styled(...);
// to:
// styled(...);
// which isn't good enough for us.
function replaceComponentDeclarationNode(
  componentSymbol: ts.Symbol,
  componentName: string,
  node: ts.Node,
  staticStyledComponents: StaticStyledComponents,
  shouldBeStatic: boolean,
  diagnosticsReporter: DiagnosticsReporter | undefined,
) {
  if (staticStyledComponents.symbolsWithReferencesOutsideJsx.has(componentSymbol)) {
    if (diagnosticsReporter) {
      const outsideJsxUsage = staticStyledComponents.symbolsWithReferencesOutsideJsx.get(componentSymbol)!;
      if (!outsideJsxUsage.hasBeenReported) {
        const references = outsideJsxUsage.references;

        for (const reference of references) {
          const sourceFile = reference.getSourceFile();
          let stmt = getStatement(reference);

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
    return node;
  }

  if (staticStyledComponents.symbolToComponent.has(componentSymbol)) {
    return undefined;
  }

  return node;
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
  diagnosticsReporter &&
    diagnosticsReporter({
      message:
        'Top level styled.[Element] cannot be statically extracted inside components that are decorated by other components',
      file: sourceFile.fileName,
      line: sourceFile.getLineAndCharacterOfPosition(node.pos).line,
      severity: 'info',
      source: node.getText(),
    });
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
  requiresRuntimeResults: RequiresRuntimeResult | RequiresRuntimeResult[],
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
  requiresRuntimeResults: RequiresRuntimeResult | RequiresRuntimeResult[],
  node: ts.Node,
  reporter: DiagnosticsReporter | undefined,
) {
  for (const result of Array.isArray(requiresRuntimeResults) ? requiresRuntimeResults : [requiresRuntimeResults]) {
    const requireRuntimeDiagnostics = result.getDiagnostics()!;
    const file = node.getSourceFile();
    reporter &&
      reporter({
        message,
        file: file.fileName,
        line: file.getLineAndCharacterOfPosition(node.pos).line,
        source: node.getText(),
        severity,
        innerDiagnostic: {
          file: requireRuntimeDiagnostics.file,
          line: requireRuntimeDiagnostics.line,
          message: requireRuntimeDiagnostics.message,
          source: requireRuntimeDiagnostics.source,
          severity,
        },
      });
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
  parentComponent: StaticStyledComponent,
): (EvaluatedStyle | RequiresRuntimeResult)[];
function getCssData(
  tsStyle: ts.ObjectLiteralExpression,
  program: ts.Program,
  node: ts.Node,
): EvaluatedStyle | RequiresRuntimeResult;
function getCssData(
  tsStyle: ts.ObjectLiteralExpression,
  program: ts.Program,
  node: ts.Node,
  parentComponent?: StaticStyledComponent,
): (EvaluatedStyle | RequiresRuntimeResult)[] | EvaluatedStyle | RequiresRuntimeResult {
  const style = evaluate(tsStyle, program, {}) as EvaluatedStyle | RequiresRuntimeResult;
  if (isRequiresRuntimeResult(style)) {
    return style;
  }
  const propFunc = anyValuesAreFunctions(style);
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

function anyValuesAreFunctions(style: EvaluatedStyle): boolean | FunctionWithTsNode {
  for (const key in style) {
    if (typeof style[key] === 'function') {
      return (style[key] as unknown) as FunctionWithTsNode;
    } else if (typeof style[key] === 'object') {
      const func = anyValuesAreFunctions(style[key] as EvaluatedStyle);
      if (func !== false) {
        return func;
      }
    }
  }
  return false;
}

function getCssDataFromCssProp(
  node: ts.JsxSelfClosingElement | ts.JsxOpeningElement,
  program: ts.Program,
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
    const cssData = getCssData(cssJsxAttr.initializer.expression, program, node);
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
