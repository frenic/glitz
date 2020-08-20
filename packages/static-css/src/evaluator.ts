import * as ts from 'typescript';

export function evaluate(
  expr: ts.Expression | ts.FunctionDeclaration | ts.EnumDeclaration,
  typeChecker: ts.TypeChecker,
  scope: { [name: string]: any },
): any {
  scope.Array = Array;
  scope.Object = Object;
  scope.String = String;
  scope.Number = Number;
  scope.Boolean = Boolean;
  scope.RegExp = RegExp;
  if (ts.isBinaryExpression(expr)) {
    if (expr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      // tslint:disable-next-line: no-shadowed-variable
      const left = evaluate(expr.left, typeChecker, scope);
      if (isRequiresRuntimeResult(left)) {
        return left;
      }
      if (!left) {
        return left;
      }

      return evaluate(expr.right, typeChecker, scope);
    }

    const left = evaluate(expr.left, typeChecker, scope);
    if (isRequiresRuntimeResult(left)) {
      return left;
    }

    const right = evaluate(expr.right, typeChecker, scope);
    if (isRequiresRuntimeResult(right)) {
      return right;
    }

    if (expr.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      return left + right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.MinusToken) {
      return left - right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.AsteriskToken) {
      return left * right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.SlashToken) {
      return left / right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken) {
      return left === right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken) {
      // tslint:disable-next-line: triple-equals
      return left == right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken) {
      return left !== right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken) {
      // tslint:disable-next-line: triple-equals
      return left != right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.GreaterThanToken) {
      return left > right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.GreaterThanEqualsToken) {
      return left >= right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.LessThanToken) {
      return left < right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.LessThanEqualsToken) {
      return left <= right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
      return left || right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) {
      if (left !== undefined && left !== null) {
        return left;
      }
      return right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.InKeyword) {
      if (!right) {
        return false;
      }
      if (typeof right === 'object' && right instanceof Array) {
        return right.indexOf(left) !== -1;
      }
      if (typeof right === 'object' || typeof right === 'function') {
        return left in right;
      }
      return false;
    }
  } else if (ts.isParenthesizedExpression(expr)) {
    return evaluate(expr.expression, typeChecker, scope);
  } else if (ts.isConditionalExpression(expr)) {
    const condition = evaluate(expr.condition, typeChecker, scope);
    if (isRequiresRuntimeResult(condition)) {
      return condition;
    }
    return condition ? evaluate(expr.whenTrue, typeChecker, scope) : evaluate(expr.whenFalse, typeChecker, scope);
  } else if (ts.isPrefixUnaryExpression(expr)) {
    if (expr.operator === ts.SyntaxKind.PlusPlusToken || expr.operator === ts.SyntaxKind.MinusMinusToken) {
      return requiresRuntimeResult('-- or ++ expressions are not supported', expr);
    }
    const value = evaluate(expr.operand, typeChecker, scope);
    if (isRequiresRuntimeResult(value)) {
      return value;
    }
    if (expr.operator === ts.SyntaxKind.PlusToken) {
      return +value;
    }
    if (expr.operator === ts.SyntaxKind.MinusToken) {
      return -value;
    }
    if (expr.operator === ts.SyntaxKind.TildeToken) {
      // tslint:disable-next-line: no-bitwise
      return ~value;
    }
    if (expr.operator === ts.SyntaxKind.ExclamationToken) {
      return !value;
    }
  } else if (ts.isPropertyAccessExpression(expr)) {
    const obj = evaluate(expr.expression, typeChecker, scope);
    if (isRequiresRuntimeResult(obj)) {
      return obj;
    }
    if (!obj && expr.questionDotToken) {
      return undefined;
    }
    const property = expr.name.escapedText.toString();
    return obj[property];
  } else if (ts.isElementAccessExpression(expr)) {
    const obj = evaluate(expr.expression, typeChecker, scope);
    if (isRequiresRuntimeResult(obj)) {
      return obj;
    }
    if (!obj && expr.questionDotToken) {
      return undefined;
    }
    const property = evaluate(expr.argumentExpression, typeChecker, scope);
    if (isRequiresRuntimeResult(property)) {
      return property;
    }
    return obj[property];
  } else if (ts.isTaggedTemplateExpression(expr)) {
    return requiresRuntimeResult('Tagged templates are not supported', expr);
  } else if (ts.isTemplateExpression(expr)) {
    let s = expr.head.text;
    for (const span of expr.templateSpans) {
      const value = evaluate(span.expression, typeChecker, scope);
      if (isRequiresRuntimeResult(value)) {
        return value;
      }
      s += value;
      s += span.literal.text;
    }
    return s;
  } else if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr) || ts.isFunctionDeclaration(expr)) {
    let bodyExpression: ts.Expression | undefined;
    if (expr.body) {
      if (ts.isBlock(expr.body)) {
        const returnStatement = expr.body.statements.find(s => ts.isReturnStatement(s)) as
          | ts.ReturnStatement
          | undefined;
        if (returnStatement) {
          bodyExpression = returnStatement.expression;
        }
      } else {
        bodyExpression = expr.body;
      }
    }
    const parameters: { name: string; isDotDotDot: boolean }[] = [];
    for (const parameter of expr.parameters) {
      if (ts.isIdentifier(parameter.name)) {
        parameters.push({ name: parameter.name.text, isDotDotDot: !!parameter.dotDotDotToken });
      } else {
        return requiresRuntimeResult('Static expressions does not support spread', expr);
      }
    }

    return (...args: any[]) => {
      if (bodyExpression === undefined) {
        return undefined;
      }

      const parameterScope: { [argName: string]: any } = { ...scope };
      for (let i = 0; i < parameters.length; i++) {
        if (parameters[i].isDotDotDot) {
          parameterScope[parameters[i].name] = args.slice(i);
        } else {
          parameterScope[parameters[i].name] = args[i];
        }
      }
      return evaluate(bodyExpression, typeChecker, parameterScope);
    };
  } else if (ts.isCallExpression(expr)) {
    // tslint:disable-next-line: ban-types
    let callable: Function;
    let callableContext: any = null;
    if (ts.isPropertyAccessExpression(expr.expression)) {
      callableContext = evaluate(expr.expression.expression, typeChecker, scope);
      if (isRequiresRuntimeResult(callableContext)) {
        return callableContext;
      }
      const name = expr.expression.name.text;
      callable = callableContext[name];
    } else {
      // tslint:disable-next-line: ban-types
      callable = evaluate(expr.expression, typeChecker, scope) as Function;
    }
    if (isRequiresRuntimeResult(callable)) {
      return callable;
    }
    if (typeof callable !== 'function') {
      return requiresRuntimeResult(`Unable to evaluate ${expr.expression.getText()} to a function`, expr.expression);
    }
    const args = [];
    for (const arg of expr.arguments) {
      const value = evaluate(arg, typeChecker, scope);
      if (isRequiresRuntimeResult(value)) {
        return value;
      }
      if (ts.isSpreadElement(arg)) {
        if (!Array.isArray(value)) {
          return requiresRuntimeResult('Spread value could not be statically determined to be an array', arg);
        }
        for (const el of value) {
          args.push(el);
        }
      } else {
        args.push(value);
      }
    }
    return callable.apply(callableContext, args);
  } else if (ts.isTypeOfExpression(expr)) {
    const value = evaluate(expr.expression, typeChecker, scope);
    if (isRequiresRuntimeResult(value)) {
      return value;
    }
    return typeof value;
  } else if (ts.isIdentifier(expr)) {
    if (expr.text in scope) {
      return scope[expr.text];
    }
    if (expr.text === 'undefined') {
      return undefined;
    }

    const type = typeChecker.getTypeAtLocation(expr);
    if (type.isStringLiteral()) {
      return type.value;
    }
    let symbol = typeChecker.getSymbolAtLocation(expr);
    if (!symbol) {
      return requiresRuntimeResult(`Unable to resolve identifier '${expr.text}'`, expr);
    }
    if (!symbol.valueDeclaration) {
      symbol = resolveImportSymbol(expr.text, symbol, typeChecker);
    }
    if (!symbol.valueDeclaration) {
      return requiresRuntimeResult('Unable to find the value declaration of imported symbol', expr);
    }
    if (ts.isShorthandPropertyAssignment(symbol.valueDeclaration)) {
      symbol = typeChecker.getShorthandAssignmentValueSymbol(symbol.valueDeclaration);
    }
    if (!symbol) {
      return requiresRuntimeResult(`Unable to resolve identifier '${expr.text}'`, expr);
    }
    if (ts.isVariableDeclaration(symbol.valueDeclaration)) {
      if (!symbol.valueDeclaration.initializer) {
        return requiresRuntimeResult(`Unable to resolve identifier '${expr.text}'`, expr);
      }
      return evaluate(symbol.valueDeclaration.initializer, typeChecker, scope);
    }
    if (ts.isFunctionDeclaration(symbol.valueDeclaration)) {
      return evaluate(symbol.valueDeclaration, typeChecker, scope);
    }
    if (ts.isEnumDeclaration(symbol.valueDeclaration)) {
      return evaluate(symbol.valueDeclaration, typeChecker, scope);
    }
    return requiresRuntimeResult('Not implemented: ' + expr.text + ', ' + expr.kind, expr);
  } else if (ts.isNoSubstitutionTemplateLiteral(expr)) {
    return expr.text;
  } else if (ts.isStringLiteral(expr)) {
    return expr.text;
  } else if (ts.isNumericLiteral(expr)) {
    return Number(expr.text);
  } else if (expr.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  } else if (expr.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  } else if (expr.kind === ts.SyntaxKind.NullKeyword) {
    return null;
  } else if (expr.kind === ts.SyntaxKind.UndefinedKeyword) {
    return undefined;
  } else if (ts.isObjectLiteralExpression(expr)) {
    const obj: any = {};
    for (const property of expr.properties) {
      if (ts.isSpreadAssignment(property)) {
        const spreadObject = evaluate(property.expression, typeChecker, scope);
        if (isRequiresRuntimeResult(spreadObject)) {
          return spreadObject;
        }
        Object.assign(obj, spreadObject);
      } else {
        let propertyName = '';
        if (property.name && ts.isIdentifier(property.name)) {
          propertyName = property.name.text;
        }
        if (property.name && ts.isComputedPropertyName(property.name)) {
          // tslint:disable-next-line: no-shadowed-variable
          const value = evaluate(property.name.expression, typeChecker, scope);
          if (isRequiresRuntimeResult(value)) {
            return value;
          }
          propertyName = value.toString();
        }
        if (property.name && ts.isStringLiteral(property.name)) {
          propertyName = property.name.text;
        }
        let value: any;
        if (ts.isPropertyAssignment(property)) {
          value = evaluate(property.initializer, typeChecker, scope);
          if (isRequiresRuntimeResult(value)) {
            return value;
          }
        }
        if (ts.isShorthandPropertyAssignment(property)) {
          value = evaluate(property.name, typeChecker, scope);
          if (isRequiresRuntimeResult(value)) {
            return value;
          }
        }

        obj[propertyName] = value;
      }
    }
    return obj;
  } else if (ts.isArrayLiteralExpression(expr)) {
    const array: any[] = [];
    for (const element of expr.elements) {
      const value = evaluate(element, typeChecker, scope);
      if (isRequiresRuntimeResult(value)) {
        return value;
      }
      if (ts.isSpreadElement(element)) {
        if (!Array.isArray(value)) {
          return requiresRuntimeResult('Spread value could not be statically determined to be an array', element);
        }
        for (const el of value) {
          array.push(el);
        }
      } else {
        array.push(value);
      }
    }
    return array;
  } else if (ts.isEnumDeclaration(expr)) {
    const enm: any = {};
    let i = 0;
    for (const member of expr.members) {
      let memberName: string;
      if (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name) || ts.isNumericLiteral(member.name)) {
        memberName = member.name.text;
      } else if (ts.isComputedPropertyName(member.name)) {
        const value = evaluate(member.name.expression, typeChecker, scope);
        if (isRequiresRuntimeResult(value)) {
          return value;
        }
        memberName = value.toString();
      } else {
        return requiresRuntimeResult('Unsupported enum declaration', expr);
      }
      if (!member.initializer) {
        enm[memberName] = i;
        enm[i] = memberName;
      } else {
        const value = evaluate(member.initializer, typeChecker, scope);
        if (isRequiresRuntimeResult(value)) {
          return value;
        }
        enm[memberName] = value;
      }
      i++;
    }
    return enm;
  } else if (ts.isSpreadElement(expr)) {
    return evaluate(expr.expression, typeChecker, scope);
  }
  return requiresRuntimeResult('Unable to evaluate expression, unsupported expression token kind: ' + expr.kind, expr);
}

function resolveImportSymbol(variableName: string, symbol: ts.Symbol, typeChecker: ts.TypeChecker) {
  if (!symbol.valueDeclaration) {
    const importSpecifier = symbol.declarations[0];
    if (importSpecifier && ts.isImportSpecifier(importSpecifier)) {
      const importSymbol = typeChecker.getSymbolAtLocation(importSpecifier.parent.parent.parent.moduleSpecifier);
      if (importSymbol) {
        const exports = typeChecker.getExportsOfModule(importSymbol);
        for (const exp of exports) {
          if (exp.escapedName === variableName) {
            symbol = exp;
            break;
          }
        }
      }
    }
  }
  if (!symbol.valueDeclaration) {
    const exportSpecifier = symbol.declarations[0];
    if (ts.isExportSpecifier(exportSpecifier)) {
      const variableToLookFor = exportSpecifier.propertyName?.text ?? exportSpecifier.name.text;
      const moduleSpecifier = exportSpecifier.parent.parent.moduleSpecifier;
      if (moduleSpecifier) {
        const importSymbol = typeChecker.getSymbolAtLocation(moduleSpecifier);
        if (importSymbol) {
          const exports = typeChecker.getExportsOfModule(importSymbol);
          for (const exp of exports) {
            if (exp.escapedName === variableToLookFor) {
              if (!exp.valueDeclaration) {
                symbol = resolveImportSymbol(variableToLookFor, exp, typeChecker);
              } else {
                symbol = exp;
              }
              break;
            }
          }
        }
      } else {
        const local = typeChecker.getExportSpecifierLocalTargetSymbol(exportSpecifier);
        if (local) {
          symbol = local;
        }
      }
    }
  }
  return symbol;
}

export type RequiresRuntimeResult = {
  __requiresRuntime: true;
  message: string;
  node?: ts.Node;
  getDiagnostics(): undefined | { line: number; source: string; file: string };
};

export function requiresRuntimeResult(message: string, node?: ts.Node): RequiresRuntimeResult {
  return {
    __requiresRuntime: true,
    message,
    node,
    getDiagnostics() {
      if (!node) {
        return undefined;
      }
      let file = node;
      while (!ts.isSourceFile(file)) {
        file = file.parent;
      }

      return {
        source: node.getText(file),
        file: file.fileName,
        line: file.getLineAndCharacterOfPosition(node.pos).line,
      };
    },
  };
}

export function isRequiresRuntimeResult(o: unknown): o is RequiresRuntimeResult {
  if (!o || typeof o !== 'object') {
    return false;
  }
  const res = o as RequiresRuntimeResult;
  return res.__requiresRuntime === true;
}

// function evaluateVariableDeclarations(
//   body: ts.FunctionBody,
//   typeChecker: ts.TypeChecker,
//   scope: { [name: string]: any },
// ) {
//   const localScope: { [name: string]: any } = Object.assign({}, scope);
//   for (const stmt of body.statements) {
//     if (ts.isVariableStatement(stmt)) {
//       for (const decl of stmt.declarationList.declarations) {
//         if (ts.isIdentifier(decl.name)) {
//           let value: any = undefined;
//           if (decl.initializer) {
//             value = evaluate(decl.initializer, typeChecker, localScope);
//             if (isRequiresRuntimeResult(value)) {
//               return value;
//             }
//           }
//           localScope[decl.name.text] = value;
//         }
//       }
//     } else if (ts.isFunctionDeclaration(stmt)) {
//       // TODO
//     }
//   }
//   return localScope;
// }
