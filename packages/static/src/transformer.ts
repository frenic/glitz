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
  elementName: string;
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
  symbolToComponent: Map<ts.Symbol, StaticStyledComponent>;
  symbolsWithReferencesOutsideJsx: Map<ts.Symbol, StaticStyledComponent>;
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
        symbolsWithReferencesOutsideJsx: new Map<ts.Symbol, StaticStyledComponent>(),
      };
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
  diagnosticsReporter?: DiagnosticsReporter,
): ts.SourceFile;
function visitNodeAndChildren(
  node: ts.Node,
  program: ts.Program,
  context: ts.TransformationContext,
  glitz: GlitzStatic,
  staticStyledComponents: StaticStyledComponents,
  allShouldBeStatic: boolean,
  isFirstPass: boolean,
  diagnosticsReporter?: DiagnosticsReporter,
): ts.Node | ts.Node[];
function visitNodeAndChildren(
  node: ts.Node,
  program: ts.Program,
  context: ts.TransformationContext,
  glitz: GlitzStatic,
  staticStyledComponents: StaticStyledComponents,
  allShouldBeStatic: boolean,
  isFirstPass: boolean,
  diagnosticsReporter?: DiagnosticsReporter,
): ts.Node | ts.Node[] {
  return ts.visitEachChild(
    visitNode(node, program, glitz, staticStyledComponents, allShouldBeStatic, isFirstPass, diagnosticsReporter),
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
}

function visitNode(
  node: ts.Node,
  program: ts.Program,
  glitz: GlitzStatic,
  staticStyledComponents: StaticStyledComponents,
  allShouldBeStatic: boolean,
  isFirstPass: boolean,
  diagnosticsReporter?: DiagnosticsReporter,
): any /* TODO */ {
  const typeChecker = program.getTypeChecker();
  if (ts.isImportDeclaration(node)) {
    if ((node.moduleSpecifier as ts.StringLiteral).text === moduleName) {
      // TODO: Should only do this if the only thing imported is the static/styledx import
      // return [];

      // TODO: Do we need to remove this? Will it get dead code eliminated?
      return node;
    }
  }
  if (hasJSDocTag(node, 'glitz-dynamic')) {
    return node;
  }
  if (ts.isIdentifier(node) && !isStaticComponentVariableUse(node)) {
    const symbol = typeChecker.getSymbolAtLocation(node);
    if (symbol && staticStyledComponents.symbolToComponent.has(symbol)) {
      const component = staticStyledComponents.symbolToComponent.get(symbol)!;
      if (!staticStyledComponents.symbolsWithReferencesOutsideJsx.has(symbol)) {
        staticStyledComponents.symbolsWithReferencesOutsideJsx.set(symbol, component);
      }
    }
  }
  if (ts.isVariableStatement(node)) {
    if (node.declarationList.declarations.length === 1) {
      const declaration = node.declarationList.declarations[0];
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        const componentSymbol = typeChecker.getSymbolAtLocation(declaration.name)!;
        if (staticStyledComponents.symbolsWithReferencesOutsideJsx.has(componentSymbol)) {
          return node;
        }

        if (!isFirstPass) {
          return replaceComponentDeclarationNode(componentSymbol, node, staticStyledComponents);
        }

        const componentName = declaration.name.getText();

        if (ts.isCallExpression(declaration.initializer) && ts.isIdentifier(declaration.name)) {
          const callExpr = declaration.initializer;

          if (ts.isPropertyAccessExpression(callExpr.expression) && ts.isIdentifier(callExpr.expression.expression)) {
            if (callExpr.expression.expression.escapedText === styledName) {
              const elementName = callExpr.expression.name.escapedText.toString();
              const styleObject = callExpr.arguments[0];
              if (callExpr.arguments.length === 1 && !!styleObject && ts.isObjectLiteralExpression(styleObject)) {
                const cssData = getCssData(styleObject, program, node);
                if (isEvaluableStyle(cssData)) {
                  const component = {
                    componentName,
                    elementName,
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
            }
          }
          if (
            ts.isIdentifier(callExpr.expression) &&
            callExpr.expression.escapedText.toString() === styledName &&
            callExpr.arguments.length === 2
          ) {
            const parentStyledComponent = callExpr.arguments[0];
            const styleObject = callExpr.arguments[1];

            if (ts.isIdentifier(parentStyledComponent) && ts.isObjectLiteralExpression(styleObject)) {
              const parentSymbol = typeChecker.getSymbolAtLocation(parentStyledComponent)!;
              const parent = staticStyledComponents.symbolToComponent.get(parentSymbol);
              if (parent) {
                const cssData = getCssData(styleObject, program, node, parent);
                if (cssData.every(isEvaluableStyle)) {
                  const component = {
                    componentName,
                    elementName: parent.elementName,
                    styles: cssData as EvaluatedStyle[],
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

          // Since some declarations of styled components are complex and look like:
          // const Styled = createComponent();
          // we look at the variable name to see if it's a variable with Pascal case
          // and in that case try to evaluate it to a styled component.
          if (
            componentName.length > 1 &&
            componentName[0] === componentName[0].toUpperCase() &&
            componentName[1] === componentName[1].toLowerCase()
          ) {
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

  if (
    ts.isJsxSelfClosingElement(node) &&
    ts.isPropertyAccessExpression(node.tagName) &&
    ts.isIdentifier(node.tagName.expression) &&
    node.tagName.expression.escapedText.toString() === styledName
  ) {
    const elementName = node.tagName.name.escapedText.toString().toLowerCase();
    const cssData = getCssDataFromCssProp(node, program, allShouldBeStatic, diagnosticsReporter);
    if (cssData) {
      const jsxElement = ts.createJsxSelfClosingElement(
        ts.createIdentifier(elementName),
        undefined,
        ts.createJsxAttributes([
          ...passThroughProps(node.attributes.properties),
          ts.createJsxAttribute(ts.createIdentifier('className'), ts.createStringLiteral(glitz.injectStyle(cssData))),
        ]),
      );
      ts.setOriginalNode(jsxElement, node);
      return jsxElement;
    }
  }

  if (ts.isJsxElement(node)) {
    const openingElement = node.openingElement;
    if (
      ts.isPropertyAccessExpression(openingElement.tagName) &&
      ts.isIdentifier(openingElement.tagName.expression) &&
      openingElement.tagName.expression.escapedText.toString() === styledName
    ) {
      const elementName = openingElement.tagName.name.escapedText.toString().toLowerCase();
      const cssData = getCssDataFromCssProp(openingElement, program, allShouldBeStatic, diagnosticsReporter);
      if (cssData) {
        const jsxOpeningElement = ts.createJsxOpeningElement(
          ts.createIdentifier(elementName),
          undefined,
          ts.createJsxAttributes([
            ...passThroughProps(node.openingElement.attributes.properties),
            ts.createJsxAttribute(ts.createIdentifier('className'), ts.createStringLiteral(glitz.injectStyle(cssData))),
          ]),
        );
        ts.setOriginalNode(jsxOpeningElement, node.openingElement);

        const jsxClosingElement = ts.createJsxClosingElement(ts.createIdentifier(elementName));
        ts.setOriginalNode(jsxClosingElement, node.closingElement);

        const jsxElement = ts.createJsxElement(jsxOpeningElement, node.children, jsxClosingElement);
        ts.setOriginalNode(jsxElement, node);
        return jsxElement;
      }
    }

    if (ts.isIdentifier(openingElement.tagName) && ts.isIdentifier(openingElement.tagName)) {
      const jsxTagSymbol = typeChecker.getSymbolAtLocation(openingElement.tagName);
      if (
        jsxTagSymbol &&
        staticStyledComponents.symbolToComponent.has(jsxTagSymbol) &&
        !staticStyledComponents.symbolsWithReferencesOutsideJsx.has(jsxTagSymbol)
      ) {
        const cssPropData = getCssDataFromCssProp(openingElement, program, allShouldBeStatic, diagnosticsReporter);
        const styledComponent = staticStyledComponents.symbolToComponent.get(jsxTagSymbol)!;
        let styles = styledComponent.styles;
        if (cssPropData) {
          styles = styles.slice();
          styles.push(cssPropData);
        }

        const jsxOpeningElement = ts.createJsxOpeningElement(
          ts.createIdentifier(styledComponent.elementName),
          undefined,
          ts.createJsxAttributes([
            ...passThroughProps(node.openingElement.attributes.properties),
            ts.createJsxAttribute(ts.createIdentifier('className'), ts.createStringLiteral(glitz.injectStyle(styles))),
          ]),
        );
        ts.setOriginalNode(jsxOpeningElement, node.openingElement);

        const jsxClosingElement = ts.createJsxClosingElement(ts.createIdentifier(styledComponent.elementName));
        ts.setOriginalNode(jsxClosingElement, node.closingElement);

        const jsxElement = ts.createJsxElement(jsxOpeningElement, node.children, jsxClosingElement);
        ts.setOriginalNode(jsxElement, node);
        return jsxElement;
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
      const cssPropData = getCssDataFromCssProp(node, program, allShouldBeStatic, diagnosticsReporter);
      const styledComponent = staticStyledComponents.symbolToComponent.get(jsxTagSymbol)!;
      let styles = styledComponent.styles;
      if (cssPropData) {
        styles = styles.slice();
        styles.push(cssPropData);
      }

      const jsxElement = ts.createJsxSelfClosingElement(
        ts.createIdentifier(styledComponent.elementName),
        undefined,
        ts.createJsxAttributes([
          ...passThroughProps(node.attributes.properties),
          ts.createJsxAttribute(ts.createIdentifier('className'), ts.createStringLiteral(glitz.injectStyle(styles))),
        ]),
      );
      ts.setOriginalNode(jsxElement, node);
      return jsxElement;
    }
  }

  return node;
}

function replaceComponentDeclarationNode(
  componentSymbol: ts.Symbol,
  node: ts.Node,
  staticStyledComponents: StaticStyledComponents,
) {
  if (
    staticStyledComponents.symbolToComponent.has(componentSymbol) &&
    !staticStyledComponents.symbolsWithReferencesOutsideJsx.has(componentSymbol)
  ) {
    return [];
  }
  return node;
}

function isStaticComponentVariableUse(node: ts.Node) {
  const parent = node.parent;
  if (parent) {
    if (ts.isVariableDeclaration(parent)) {
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
  reporter: DiagnosticsReporter,
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
  reporter: DiagnosticsReporter,
) {
  for (const result of Array.isArray(requiresRuntimeResults) ? requiresRuntimeResults : [requiresRuntimeResults]) {
    const requireRuntimeDiagnostics = result.getDiagnostics()!;
    const file = node.getSourceFile();
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
