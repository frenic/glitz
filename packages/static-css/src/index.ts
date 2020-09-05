import * as ts from 'typescript';
import { isStaticElement, isStaticComponent } from './static-glitz';
import { evaluate, isRequiresRuntimeResult, RequiresRuntimeResult } from './evaluator';
import { GlitzStatic } from '@glitz/core';
import { CommonValue } from '@glitz/type';

export const moduleName = '@glitz/react';
export const styledName = 'styled';

type StaticStyledComponent = {
  componentName: string;
  elementName: string;
  styles: EvaluatedStyle[];
  parent?: StaticStyledComponent;
};

type EvaluatedStyle = { [key: string]: CommonValue | EvaluatedStyle };

type StaticStyledComponents = { [name: string]: StaticStyledComponent };

export default function transformer(program: ts.Program, glitz: GlitzStatic): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (file: ts.SourceFile) => {
    if (file.fileName.endsWith('.tsx')) {
      // TODO: Why only tsx?
      const staticStyledComponent: StaticStyledComponents = {};
      const firstPassTransformedFile = ts.visitEachChild(
        file,
        node => visitNode(node, program, glitz, staticStyledComponent),
        context,
      );
      return visitNodeAndChildren(firstPassTransformedFile, program, context, glitz, staticStyledComponent);
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
  staticStyledComponent: StaticStyledComponents,
): ts.SourceFile;
function visitNodeAndChildren(
  node: ts.Node,
  program: ts.Program,
  context: ts.TransformationContext,
  glitz: GlitzStatic,
  staticStyledComponent: StaticStyledComponents,
): ts.Node | ts.Node[];
function visitNodeAndChildren(
  node: ts.Node,
  program: ts.Program,
  context: ts.TransformationContext,
  glitz: GlitzStatic,
  staticStyledComponent: StaticStyledComponents,
): ts.Node | ts.Node[] {
  return ts.visitEachChild(
    visitNode(node, program, glitz, staticStyledComponent),
    childNode => visitNodeAndChildren(childNode, program, context, glitz, staticStyledComponent),
    context,
  );
}

function visitNode(
  node: ts.Node,
  program: ts.Program,
  glitz: GlitzStatic,
  staticStyledComponent: StaticStyledComponents,
): any /* TODO */ {
  if (ts.isImportDeclaration(node)) {
    if ((node.moduleSpecifier as ts.StringLiteral).text === moduleName) {
      // TODO: Should only do this if the only thing imported is the static/styledx import
      // return [];

      // TODO: Do we need to remove this? Will it get dead code eliminated?
      return node;
    }
  }
  if (ts.isVariableStatement(node)) {
    if (node.declarationList.declarations.length === 1) {
      const declaration = node.declarationList.declarations[0];
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        const componentName = declaration.name.escapedText.toString();
        if (ts.isCallExpression(declaration.initializer) && ts.isIdentifier(declaration.name)) {
          const callExpr = declaration.initializer;

          if (ts.isPropertyAccessExpression(callExpr.expression) && ts.isIdentifier(callExpr.expression.expression)) {
            if (callExpr.expression.expression.escapedText === styledName) {
              const elementName = callExpr.expression.name.escapedText.toString();
              const styleObject = callExpr.arguments[0];
              if (callExpr.arguments.length === 1 && !!styleObject && ts.isObjectLiteralExpression(styleObject)) {
                const cssData = getCssData(styleObject, program);
                if (isEvaluableStyle(cssData)) {
                  staticStyledComponent[componentName] = {
                    componentName,
                    elementName,
                    styles: [cssData],
                  };
                  return [];
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
              const parentName = parentStyledComponent.escapedText.toString();
              const parent = staticStyledComponent[parentName];
              if (parent) {
                const cssData = getCssData(styleObject, program, parent);
                if (cssData.every(isEvaluableStyle)) {
                  if (staticStyledComponent[parentName]) {
                    staticStyledComponent[componentName] = {
                      componentName,
                      elementName: staticStyledComponent[parentName].elementName,
                      styles: cssData as EvaluatedStyle[],
                    };
                    return [];
                  }
                }
              }
            }
          }
          if (
            componentName.length > 1 &&
            componentName[0] === componentName[0].toUpperCase() &&
            componentName[1] === componentName[1].toLowerCase()
          ) {
            const object = evaluate(declaration.initializer, program, {});
            if (isStaticElement(object) || isStaticComponent(object)) {
              if (object.styles.every(isEvaluableStyle)) {
                // TODO: What is dis?
                staticStyledComponent[componentName] = {
                  componentName,
                  elementName: object.elementName,
                  styles: object.styles,
                };
                return [];
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
    const cssData = getCssDataFromCssProp(node, program);
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
      const cssData = getCssDataFromCssProp(openingElement, program);
      if (cssData) {
        const jsxElement = ts.createJsxElement(
          ts.createJsxOpeningElement(
            ts.createIdentifier(elementName),
            undefined,
            ts.createJsxAttributes([
              ...passThroughProps(node.openingElement.attributes.properties),
              ts.createJsxAttribute(
                ts.createIdentifier('className'),
                ts.createStringLiteral(glitz.injectStyle(cssData)),
              ),
            ]),
          ),
          node.children,
          ts.createJsxClosingElement(ts.createIdentifier(elementName)),
        );
        ts.setOriginalNode(jsxElement, node);
        return jsxElement;
      }
    }

    if (ts.isIdentifier(openingElement.tagName) && ts.isIdentifier(openingElement.tagName)) {
      const jsxTagName = openingElement.tagName.escapedText.toString();
      if (staticStyledComponent[jsxTagName]) {
        const cssPropData = getCssDataFromCssProp(openingElement, program);
        let styles = staticStyledComponent[jsxTagName].styles;
        if (cssPropData) {
          styles = styles.slice();
          styles.push(cssPropData);
        }

        const jsxElement = ts.createJsxElement(
          ts.createJsxOpeningElement(
            ts.createIdentifier(staticStyledComponent[jsxTagName].elementName),
            undefined,
            ts.createJsxAttributes([
              ...passThroughProps(node.openingElement.attributes.properties),
              ts.createJsxAttribute(
                ts.createIdentifier('className'),
                ts.createStringLiteral(glitz.injectStyle(styles)),
              ),
            ]),
          ),
          node.children,
          ts.createJsxClosingElement(ts.createIdentifier(staticStyledComponent[jsxTagName].elementName)),
        );
        ts.setOriginalNode(jsxElement, node);
        return jsxElement;
      }
    }
  }

  if (ts.isJsxSelfClosingElement(node) && ts.isIdentifier(node.tagName)) {
    const jsxTagName = node.tagName.escapedText.toString();
    if (staticStyledComponent[jsxTagName]) {
      const cssPropData = getCssDataFromCssProp(node, program);
      let styles = staticStyledComponent[jsxTagName].styles;
      if (cssPropData) {
        styles = styles.slice();
        styles.push(cssPropData);
      }

      const jsxElement = ts.createJsxSelfClosingElement(
        ts.createIdentifier(staticStyledComponent[jsxTagName].elementName),
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

function getCssData(
  tsStyle: ts.ObjectLiteralExpression,
  program: ts.Program,
  parentComponent: StaticStyledComponent,
): (EvaluatedStyle | RequiresRuntimeResult)[];
function getCssData(tsStyle: ts.ObjectLiteralExpression, program: ts.Program): EvaluatedStyle | RequiresRuntimeResult;
function getCssData(
  tsStyle: ts.ObjectLiteralExpression,
  program: ts.Program,
  parentComponent?: StaticStyledComponent,
): (EvaluatedStyle | RequiresRuntimeResult)[] | EvaluatedStyle | RequiresRuntimeResult {
  const style = evaluate(tsStyle, program, {}) as EvaluatedStyle | RequiresRuntimeResult;

  // TODO: Produce requireRuntimeResult() here somehow

  if (parentComponent) {
    return [...parentComponent.styles, style];
  }

  return style;
}

function getCssDataFromCssProp(node: ts.JsxSelfClosingElement | ts.JsxOpeningElement, program: ts.Program) {
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
    const cssData = getCssData(cssJsxAttr.initializer.expression, program);
    if (isEvaluableStyle(cssData)) {
      return cssData;
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
