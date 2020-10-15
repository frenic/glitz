import * as ts from 'typescript';

export type FunctionWithTsNode = {
  (...args: any[]): any;
  tsNode?: ts.Node;
};

type SymbolWithIdentifier = { symbol: ts.Symbol; identifier: ts.Identifier };
type SupportedExpressionsNodes = ts.Expression | ts.FunctionDeclaration | ts.EnumDeclaration | ts.Declaration;
type SupportedExpressions = SupportedExpressionsNodes | SymbolWithIdentifier;
type Exports = { [exportName: string]: ts.Symbol };
export type EvaluationStats = {
  usedVariables?: Map<ts.Declaration, any>;
  evaluationStack?: SupportedExpressionsNodes[];
};
export const staticModuleOverloads: { [moduleName: string]: () => readonly [Exports, ts.Program] } = {};

export function evaluate(expr: SupportedExpressions, program: ts.Program, scope?: Scope, stats?: EvaluationStats): any {
  try {
    const context: EvaluationContext = {
      program,
      scope: scope ?? createScope(),
      shouldEvaluate: () => true,
      stats,
    };
    return evaluateInternal(expr, context);
  } catch (e) {
    if (isRequiresRuntimeResult(e)) {
      return e;
    } else if (!(e instanceof EvaluationError)) {
      const node = isSymbolWithIdentifier(expr) ? expr.identifier : expr;
      console.log('Error evaluating expression:', node.getText());
      console.log('Expression exists in file:', node.getSourceFile().fileName);
      console.error(e);
      throw new EvaluationError(e);
    } else {
      throw e;
    }
  }
}

export function partiallyEvaluate(
  expr: SupportedExpressions,
  shouldEvaluate: (node: ts.Node, stats?: EvaluationStats) => boolean,
  program: ts.Program,
  scope?: Scope,
  stats?: EvaluationStats,
) {
  try {
    const context: EvaluationContext = {
      program,
      scope: scope ?? createScope(),
      shouldEvaluate,
      stats,
    };
    const result = evaluateInternal(expr, context);
    if (isStopEvaluationResult(result)) {
      delete (result as any)['typeKind'];
    }
    return result;
  } catch (e) {
    if (isRequiresRuntimeResult(e)) {
      return e;
    } else if (isStopEvaluationResult(e)) {
      if (isStopEvaluationResult(e)) {
        delete (e as any)['typeKind'];
      }
      return e;
    } else if (!(e instanceof EvaluationError)) {
      const node = isSymbolWithIdentifier(expr) ? expr.identifier : expr;
      console.log('Error evaluating expression:', node.getText());
      console.log('Expression exists in file:', node.getSourceFile().fileName);
      console.error(e);
      throw new EvaluationError(e);
    } else {
      throw e;
    }
  }
}

type StopEvaluationResult = ts.Node & {
  typeKind: 'StopEvaluationResult';
};

class EvaluationError extends Error {
  constructor(e: Error) {
    super();
    this.message = e.message;
    this.name = e.name;
    this.stack = e.stack;
  }
}

type EvaluationContext = {
  program: ts.Program;
  shouldEvaluate: (node: ts.Node, stats?: EvaluationStats) => boolean;
  scope: Scope;
  stats?: EvaluationStats;
};

export const evaluationCache: {
  [fileName: string]: Map<ts.Symbol, { valueDeclaration: ts.Declaration; result: any }>;
} = {};
export const cacheHits: { [fileName: string]: { [variableName: string]: number } } = {};

const globalGlobals: { [name: string]: any } = {};

globalGlobals.Array = Array;
globalGlobals.Object = Object;
globalGlobals.String = String;
globalGlobals.Number = Number;
globalGlobals.Boolean = Boolean;
globalGlobals.RegExp = RegExp;

function evaluateInternal(expr: SupportedExpressions, context: EvaluationContext): any {
  const { shouldEvaluate, stats } = context;
  let scope = context.scope;
  if (!scope) {
    scope = createScope();
  }
  const typeChecker = context.program.getTypeChecker();
  stats?.evaluationStack?.push(isSymbolWithIdentifier(expr) ? expr.identifier : expr);

  if (isSymbolWithIdentifier(expr)) {
    let symbol: ts.Symbol | undefined = expr.symbol;
    const identifier = expr.identifier;
    if (scope && scope.has(symbol)) {
      return scope.get(symbol);
    }
    let fileNameToCacheFor: string | undefined;
    let evaluationResult: any;
    let hasEvaluated = false;
    if (!symbol.valueDeclaration) {
      let symbolOrSymbols: ts.Symbol | ts.Symbol[] | undefined;
      let program;
      [symbolOrSymbols, program, fileNameToCacheFor] = resolveImportSymbol(identifier.text, symbol, context.program);
      context = { ...context, program };
      if (Array.isArray(symbolOrSymbols)) {
        symbolOrSymbols[0].declarations[0];
        const exportedNamespace: { [name: string]: any } = {};
        for (const exportedSymbol of symbolOrSymbols) {
          const exportedValue = evaluateInternal({ symbol: exportedSymbol, identifier }, context);

          if (isRequiresRuntimeResult(exportedValue)) {
            return exportedValue;
          }
          exportedNamespace[exportedSymbol.escapedName.toString()] = exportedValue;
        }
        return exportedNamespace;
      } else {
        symbol = symbolOrSymbols;
      }
      if (symbol && fileNameToCacheFor) {
        if (fileNameToCacheFor in evaluationCache) {
          const cache = evaluationCache[fileNameToCacheFor];
          if (cache.has(symbol)) {
            if (!(fileNameToCacheFor in cacheHits)) {
              cacheHits[fileNameToCacheFor] = {};
            }
            if (!(symbol.escapedName.toString() in cacheHits[fileNameToCacheFor])) {
              cacheHits[fileNameToCacheFor][symbol.escapedName.toString()] = 0;
            }
            cacheHits[fileNameToCacheFor][symbol.escapedName.toString()]++;
            const cacheEntry = cache.get(symbol)!;
            stats?.usedVariables?.set(cacheEntry.valueDeclaration, cacheEntry.result);
            return cacheEntry.result;
          }
        }
      }
    }
    if (!symbol || !symbol.valueDeclaration) {
      return requiresRuntimeResult('Unable to find the value declaration of imported symbol', identifier);
    }
    if (ts.isShorthandPropertyAssignment(symbol.valueDeclaration)) {
      symbol = typeChecker.getShorthandAssignmentValueSymbol(symbol.valueDeclaration);
    }
    if (!symbol) {
      return requiresRuntimeResult(`Unable to resolve identifier '${identifier.text}'`, identifier);
    }
    let valueDeclaration = symbol.valueDeclaration;
    if (ts.isVariableDeclaration(symbol.valueDeclaration)) {
      if (!symbol.valueDeclaration.initializer) {
        return requiresRuntimeResult(`Unable to resolve identifier '${identifier.text}'`, identifier);
      }
      evaluationResult = evaluateInternal(symbol.valueDeclaration.initializer, context);
      hasEvaluated = true;
    }
    if (ts.isFunctionDeclaration(valueDeclaration)) {
      if (!valueDeclaration.body) {
        const declarationWithBody = symbol.declarations.find(
          d => !!(d as ts.FunctionDeclaration).body,
        ) as ts.FunctionDeclaration;
        if (declarationWithBody) {
          valueDeclaration = declarationWithBody;
        }
      }
      evaluationResult = evaluateInternal(valueDeclaration, context);
      hasEvaluated = true;
    }
    if (ts.isEnumDeclaration(symbol.valueDeclaration)) {
      evaluationResult = evaluateInternal(symbol.valueDeclaration, context);
      hasEvaluated = true;
    }
    if (hasEvaluated) {
      stats?.usedVariables?.set(valueDeclaration, evaluationResult);
    }
    if (scope && scope.has(symbol)) {
      return scope.get(symbol);
    }
    if (!hasEvaluated) {
      evaluationResult = requiresRuntimeResult(
        `Could not determine a static value for: ${identifier.text}`,
        identifier,
      );
    }
    if (fileNameToCacheFor) {
      if (!(fileNameToCacheFor in evaluationCache)) {
        evaluationCache[fileNameToCacheFor] = new Map<ts.Symbol, any>();
      }
      evaluationCache[fileNameToCacheFor].set(symbol, { result: evaluationResult, valueDeclaration });
    }
    return evaluationResult;
  }

  if (!shouldEvaluate(expr, stats)) {
    const stopEvaluationResult: StopEvaluationResult = expr as any;
    stopEvaluationResult.typeKind = 'StopEvaluationResult' as const;
    return stopEvaluationResult;
  }

  if (ts.isBinaryExpression(expr)) {
    if (expr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      const left = evaluateInternal(expr.left, context);
      if (shouldShortCircuitEvaluation(left)) {
        return left;
      }
      if (!left) {
        return left;
      }

      return evaluateInternal(expr.right, context);
    }

    const left = evaluateInternal(expr.left, context);
    if (shouldShortCircuitEvaluation(left)) {
      return left;
    }

    const right = evaluateInternal(expr.right, context);
    if (shouldShortCircuitEvaluation(right)) {
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
    } else if (expr.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      if (ts.isIdentifier(expr.left)) {
        const leftSymbol = typeChecker.getSymbolAtLocation(expr.left);
        if (leftSymbol) {
          scope.set(leftSymbol, right);
          return right;
        } else {
          return requiresRuntimeResult('Unable to find symbol for variable ' + expr.left.getText(), expr);
        }
      } else {
        return requiresRuntimeResult('Assignment only supported in variables and not objects or arrays', expr.left);
      }
    } else if (expr.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken) {
      return left === right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken) {
      return left == right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken) {
      return left !== right;
    } else if (expr.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken) {
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
    return evaluateInternal(expr.expression, context);
  } else if (ts.isConditionalExpression(expr)) {
    const condition = evaluateInternal(expr.condition, context);
    if (shouldShortCircuitEvaluation(condition)) {
      return condition;
    }
    return condition ? evaluateInternal(expr.whenTrue, context) : evaluateInternal(expr.whenFalse, context);
  } else if (ts.isPrefixUnaryExpression(expr)) {
    if (expr.operator === ts.SyntaxKind.PlusPlusToken || expr.operator === ts.SyntaxKind.MinusMinusToken) {
      return requiresRuntimeResult('-- or ++ expressions are not supported', expr);
    }
    const value = evaluateInternal(expr.operand, context);
    if (shouldShortCircuitEvaluation(value)) {
      return value;
    }
    if (expr.operator === ts.SyntaxKind.PlusToken) {
      return +value;
    }
    if (expr.operator === ts.SyntaxKind.MinusToken) {
      return -value;
    }
    if (expr.operator === ts.SyntaxKind.TildeToken) {
      return ~value;
    }
    if (expr.operator === ts.SyntaxKind.ExclamationToken) {
      return !value;
    }
  } else if (ts.isPropertyAccessExpression(expr)) {
    const obj = evaluateInternal(expr.expression, context);
    if (shouldShortCircuitEvaluation(obj)) {
      return obj;
    }
    if (!obj && expr.questionDotToken) {
      return undefined;
    }
    const property = expr.name.escapedText.toString();
    return obj[property];
  } else if (ts.isElementAccessExpression(expr)) {
    const obj = evaluateInternal(expr.expression, context);
    if (shouldShortCircuitEvaluation(obj)) {
      return obj;
    }
    if (!obj && expr.questionDotToken) {
      return undefined;
    }
    const property = evaluateInternal(expr.argumentExpression, context);
    if (shouldShortCircuitEvaluation(property)) {
      return property;
    }
    return obj[property];
  } else if (ts.isTaggedTemplateExpression(expr)) {
    return requiresRuntimeResult('Tagged templates are not supported', expr);
  } else if (ts.isTemplateExpression(expr)) {
    let s = expr.head.text;
    for (const span of expr.templateSpans) {
      const value = evaluateInternal(span.expression, context);
      if (shouldShortCircuitEvaluation(value)) {
        return value;
      }
      s += value;
      s += span.literal.text;
    }
    return s;
  } else if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr) || ts.isFunctionDeclaration(expr)) {
    const parameters: { name: string; symbol: ts.Symbol; isDotDotDot: boolean; defaultValue: any }[] = [];
    for (const parameter of expr.parameters) {
      if (ts.isIdentifier(parameter.name)) {
        const defaultValue = parameter.initializer ? evaluateInternal(parameter.initializer, context) : undefined;
        const symbol = typeChecker.getSymbolAtLocation(parameter.name);
        if (!symbol) {
          return requiresRuntimeResult('Static expressions requires TS symbols', expr);
        }
        parameters.push({
          name: parameter.name.text,
          symbol,
          isDotDotDot: !!parameter.dotDotDotToken,
          defaultValue,
        });
      } else {
        return requiresRuntimeResult('Static expressions does not support spread', expr);
      }
    }

    return Object.assign(
      (...args: any[]) => {
        const parameterScope = createScope(scope);
        const parameterContext = {
          ...context,
          scope: parameterScope,
        };

        for (let i = 0; i < parameters.length; i++) {
          if (parameters[i].isDotDotDot) {
            parameterScope.current.set(parameters[i].symbol, args.slice(i));
          } else {
            if (args.length > i) {
              parameterScope.current.set(parameters[i].symbol, args[i]);
            } else {
              parameterScope.current.set(parameters[i].symbol, parameters[i].defaultValue);
            }
          }
        }
        if (!expr.body) {
          return undefined;
        }

        let result: RequiresRuntimeResult | unknown;
        if (!ts.isBlock(expr.body)) {
          result = evaluateInternal(expr.body, parameterContext);
        } else {
          result = evaluateStatements(expr.body.statements, parameterContext);
        }

        if (shouldShortCircuitEvaluation(result)) {
          throw result;
        }
        return result;
      },
      { tsNode: expr },
    ) as FunctionWithTsNode;
  } else if (ts.isCallExpression(expr)) {
    let callable: Function;
    let callableContext: any = null;
    if (ts.isPropertyAccessExpression(expr.expression)) {
      callableContext = evaluateInternal(expr.expression.expression, context);
      if (shouldShortCircuitEvaluation(callableContext)) {
        return callableContext;
      }
      const name = expr.expression.name.text;
      callable = callableContext[name];
    } else {
      callable = evaluateInternal(expr.expression, context) as Function;
    }
    if (shouldShortCircuitEvaluation(callable)) {
      return callable;
    }
    if (typeof callable !== 'function') {
      return requiresRuntimeResult(`Unable to evaluate ${expr.expression.getText()} to a function`, expr.expression);
    }
    const args = [];
    for (const arg of expr.arguments) {
      const value = evaluateInternal(arg, context);
      if (shouldShortCircuitEvaluation(value)) {
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
    const value = evaluateInternal(expr.expression, context);
    if (shouldShortCircuitEvaluation(value)) {
      return value;
    }
    return typeof value;
  } else if (ts.isIdentifier(expr)) {
    if (expr.text in globalGlobals) {
      return globalGlobals[expr.text];
    }
    if (expr.text === 'undefined') {
      return undefined;
    }

    const type = typeChecker.getTypeAtLocation(expr);
    if (type.isStringLiteral()) {
      return type.value;
    }
    const symbol = typeChecker.getSymbolAtLocation(expr);
    if (!symbol) {
      return requiresRuntimeResult(`Unable to resolve identifier '${expr.text}'`, expr);
    }
    const value = evaluateInternal({ identifier: expr, symbol }, context);
    return value;
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
        const spreadObject = evaluateInternal(property.expression, context);
        if (shouldShortCircuitEvaluation(spreadObject)) {
          return spreadObject;
        }
        Object.assign(obj, spreadObject);
      } else {
        let propertyName = '';
        if (property.name && ts.isIdentifier(property.name)) {
          propertyName = property.name.text;
        }
        if (property.name && ts.isComputedPropertyName(property.name)) {
          const value = evaluateInternal(property.name.expression, context);
          if (shouldShortCircuitEvaluation(value)) {
            return value;
          }
          propertyName = value.toString();
        }
        if (property.name && ts.isStringLiteral(property.name)) {
          propertyName = property.name.text;
        }
        let value: any;
        if (ts.isPropertyAssignment(property)) {
          value = evaluateInternal(property.initializer, context);
        }
        if (ts.isShorthandPropertyAssignment(property)) {
          value = evaluateInternal(property.name, context);
        }

        // Note that we check isRequiresRuntimeResult() and not isStopEvaluationResult()
        // since it's useful to be able to combine an object with static values and TS nodes
        // that are not yet evaluated.
        if (isRequiresRuntimeResult(value)) {
          return value;
        }

        obj[propertyName] = value;
      }
    }
    return obj;
  } else if (ts.isArrayLiteralExpression(expr)) {
    const array: any[] = [];
    for (const element of expr.elements) {
      const value = evaluateInternal(element, context);
      // Note that we check isRequiresRuntimeResult() and not isStopEvaluationResult()
      // since it's useful to be able to combine an object with static values and TS nodes
      // that are not yet evaluated.
      if (isRequiresRuntimeResult(value)) {
        return value;
      }
      if (ts.isSpreadElement(element)) {
        if (isStopEvaluationResult(value)) {
          return value;
        }
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
        const value = evaluateInternal(member.name.expression, context);
        if (isStopEvaluationResult(value)) {
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
        const value = evaluateInternal(member.initializer, context);
        // Note that we check isRequiresRuntimeResult() and not isStopEvaluationResult()
        // since it's useful to be able to combine an object with static values and TS nodes
        // that are not yet evaluated.
        if (isRequiresRuntimeResult(value)) {
          return value;
        }
        enm[memberName] = value;
      }
      i++;
    }
    return enm;
  } else if (ts.isSpreadElement(expr)) {
    return evaluateInternal(expr.expression, context);
  } else if (ts.isAsExpression(expr)) {
    return evaluateInternal(expr.expression, context);
  }
  return requiresRuntimeResult('Unable to evaluate expression, unsupported expression token kind: ' + expr.kind, expr);
}

type ResolveImportResults = readonly [ts.Symbol | ts.Symbol[] | undefined, ts.Program, string | undefined];

function resolveImportSymbol(variableName: string, symbol: ts.Symbol, program: ts.Program): ResolveImportResults {
  const typeChecker = program.getTypeChecker();
  let symbolOrSymbols: ts.Symbol | ts.Symbol[] = symbol;
  let fileName: string | undefined;
  if (!symbol.valueDeclaration) {
    const importDecl = symbol.declarations[0];
    if (importDecl && ts.isNamespaceImport(importDecl)) {
      fileName = importDecl.parent.parent.moduleSpecifier.getText().replace(/["']+/g, '');
      if (fileName in staticModuleOverloads) {
        const [staticExports, staticProgram] = staticModuleOverloads[fileName]();
        symbolOrSymbols = Object.values(staticExports);
        program = staticProgram;
      } else {
        const importSymbol = typeChecker.getSymbolAtLocation(importDecl.parent.parent.moduleSpecifier);
        if (importSymbol) {
          if (ts.isSourceFile(importSymbol.valueDeclaration)) {
            fileName = importSymbol.valueDeclaration.fileName;
          }
          symbolOrSymbols = typeChecker.getExportsOfModule(importSymbol);
        }
      }
    } else if (importDecl && ts.isImportSpecifier(importDecl)) {
      if (importDecl.propertyName) {
        variableName = importDecl.propertyName.text;
      }
      fileName = importDecl.parent.parent.parent.moduleSpecifier.getText().replace(/["']+/g, '');
      if (fileName in staticModuleOverloads) {
        const [staticExports, staticProgram] = staticModuleOverloads[fileName]();
        if (variableName in staticExports) {
          symbolOrSymbols = staticExports[variableName];
          program = staticProgram;
        } else {
          return [undefined, program, undefined] as const;
        }
      } else {
        const importSymbol = typeChecker.getSymbolAtLocation(importDecl.parent.parent.parent.moduleSpecifier);
        if (importSymbol) {
          if (ts.isSourceFile(importSymbol.valueDeclaration)) {
            fileName = importSymbol.valueDeclaration.fileName;
          }
          const exports = typeChecker.getExportsOfModule(importSymbol);
          for (const exp of exports) {
            if (exp.escapedName === variableName) {
              symbolOrSymbols = exp;
              break;
            }
          }
        }
      }
    } else if (importDecl && ts.isImportClause(importDecl)) {
      fileName = importDecl.parent.moduleSpecifier.getText().replace(/["']+/g, '');
      if (fileName in staticModuleOverloads) {
        const [staticExports, staticProgram] = staticModuleOverloads[fileName]();
        if ('default' in staticExports) {
          symbolOrSymbols = staticExports['default'];
          program = staticProgram;
        } else {
          return [undefined, program, undefined] as const;
        }
      } else {
        const importSymbol = typeChecker.getSymbolAtLocation(importDecl.parent.moduleSpecifier);
        if (importSymbol) {
          if (ts.isSourceFile(importSymbol.valueDeclaration)) {
            fileName = importSymbol.valueDeclaration.fileName;
          }
          const exports = typeChecker.getExportsOfModule(importSymbol);
          for (const exp of exports) {
            if (exp.escapedName === 'default') {
              symbolOrSymbols = exp;
              break;
            }
          }
        }
      }
    }
  }
  if (!Array.isArray(symbolOrSymbols) && !symbolOrSymbols.valueDeclaration) {
    const exportSpecifier = symbolOrSymbols.declarations[0];
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
                const importResult = resolveImportSymbol(variableToLookFor, exp, program);
                if (!importResult[0]) {
                  return [undefined, program, undefined] as const;
                }
                [symbolOrSymbols, program, fileName] = importResult;
              } else {
                symbolOrSymbols = exp;
              }
              break;
            }
          }
        }
      } else {
        const local = typeChecker.getExportSpecifierLocalTargetSymbol(exportSpecifier);
        if (local) {
          symbolOrSymbols = local;
        }
      }
    }
  }
  return [symbolOrSymbols, program, fileName] as const;
}

const StatementsDidNotReturn = {};

function evaluateStatements(statements: ts.NodeArray<ts.Statement>, context: EvaluationContext): any {
  const typeChecker = context.program.getTypeChecker();
  const newScope = createScope(context.scope);
  const newContext = {
    ...context,
    scope: newScope,
  };
  for (const statement of statements) {
    if (ts.isExpressionStatement(statement)) {
      evaluateInternal(statement.expression, newContext);
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          const symbol = typeChecker.getSymbolAtLocation(declaration.name);
          if (!symbol) {
            return requiresRuntimeResult(
              'Unable to find symbol for variable ' + declaration.name.getText(),
              declaration,
            );
          }

          let value: any;
          if (declaration.initializer) {
            value = evaluateInternal(declaration.initializer, newContext);
            if (isStopEvaluationResult(value)) {
              return value;
            }
          }
          newScope.set(symbol, value);
        } else {
          return requiresRuntimeResult(
            'Unable to statically determine value for ' + declaration.name.getText(),
            declaration,
          );
        }
      }
    } else if (ts.isIfStatement(statement)) {
      const result = evaluateIfStatement(statement, newContext);
      if (isStopEvaluationResult(result) || result !== StatementsDidNotReturn) {
        return result;
      }
    } else if (ts.isFunctionDeclaration(statement)) {
      if (statement.name) {
        const symbol = typeChecker.getSymbolAtLocation(statement.name);
        if (symbol) {
          const func = evaluateInternal(statement, newContext);
          if (isStopEvaluationResult(func)) {
            return func;
          }
          newScope.set(symbol, func);
        } else {
          return requiresRuntimeResult(
            'Unable to statically determine value for ' + statement.name.getText(),
            statement,
          );
        }
      }
    } else if (ts.isSwitchStatement(statement)) {
      const result = evaluateSwitchStatement(statement, newContext);
      if (isStopEvaluationResult(result) || result !== StatementsDidNotReturn) {
        return result;
      }
    } else if (ts.isReturnStatement(statement)) {
      if (!statement.expression) {
        return undefined;
      }
      return evaluateInternal(statement.expression, newContext);
    } else if (ts.isBreakStatement(statement)) {
      return StatementsDidNotReturn;
    } else {
      return requiresRuntimeResult('Unsupported statement type', statement);
    }
  }
  return StatementsDidNotReturn;
}

function evaluateSwitchStatement(switchStatement: ts.SwitchStatement, context: EvaluationContext) {
  const switchValue = evaluateInternal(switchStatement.expression, context);
  if (isStopEvaluationResult(switchValue)) {
    return switchValue;
  }
  for (const clause of switchStatement.caseBlock.clauses) {
    if (ts.isCaseClause(clause)) {
      const clauseValue = evaluateInternal(clause.expression, context);
      if (isRequiresRuntimeResult(switchValue)) {
        return switchValue;
      }
      if (clauseValue === switchValue) {
        const result = evaluateStatements(clause.statements, context);
        if (result !== StatementsDidNotReturn) {
          return result;
        }
        if (clause.statements.some(s => ts.isBreakStatement(s))) {
          break;
        }
      }
    } else if (ts.isDefaultClause(clause)) {
      const result = evaluateStatements(clause.statements, context);
      if (result !== StatementsDidNotReturn) {
        return result;
      }
    }
  }
  return StatementsDidNotReturn;
}

function evaluateIfStatement(ifStatement: ts.IfStatement, context: EvaluationContext): any {
  const expression = evaluateInternal(ifStatement.expression, context);
  if (isStopEvaluationResult(expression)) {
    return expression;
  }
  if (expression) {
    if (ts.isBlock(ifStatement.thenStatement)) {
      const result = evaluateStatements(ifStatement.thenStatement.statements, context);
      if (result !== StatementsDidNotReturn) {
        return result;
      }
    } else if (ts.isReturnStatement(ifStatement.thenStatement)) {
      if (!ifStatement.thenStatement.expression) {
        return undefined;
      }
      return evaluateInternal(ifStatement.thenStatement.expression, context);
    } else {
      return requiresRuntimeResult('Unable to statically evaluate then statement', ifStatement.thenStatement);
    }
  } else if (ifStatement.elseStatement) {
    if (ts.isIfStatement(ifStatement.elseStatement)) {
      return evaluateIfStatement(ifStatement.elseStatement, context);
    } else if (ts.isBlock(ifStatement.elseStatement)) {
      const result = evaluateStatements(ifStatement.elseStatement.statements, context);
      if (result !== StatementsDidNotReturn) {
        return result;
      }
    } else if (ts.isReturnStatement(ifStatement.elseStatement)) {
      if (!ifStatement.elseStatement.expression) {
        return undefined;
      }
      return evaluateInternal(ifStatement.elseStatement.expression, context);
    } else {
      return requiresRuntimeResult('Unable to statically evaluate else statement', ifStatement.elseStatement);
    }
  }
  return StatementsDidNotReturn;
}

export type RequiresRuntimeResult = {
  __requiresRuntime: true;
  message: string;
  node?: ts.Node;
  getDiagnostics(): undefined | { line: number; source: string; file: string; message: string };
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
      const file = ts.getOriginalNode(node.getSourceFile()) as ts.SourceFile;
      node = ts.getOriginalNode(node);

      return {
        message,
        source: node.getText(file),
        file: file.fileName,
        line: file.getLineAndCharacterOfPosition(node.getStart()).line + 1,
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

function isStopEvaluationResult(o: unknown): o is StopEvaluationResult {
  if (!o || typeof o !== 'object') {
    return false;
  }
  const res = o as StopEvaluationResult;
  return res.typeKind === 'StopEvaluationResult';
}

function shouldShortCircuitEvaluation(o: unknown) {
  if (isRequiresRuntimeResult(o) || isStopEvaluationResult(o)) {
    return true;
  }
  return false;
}

type Scope = {
  current: Map<ts.Symbol, any>;
  parent?: Scope;
  globals?: { [name: string]: any };
  has(symbol: ts.Symbol): boolean;
  get(symbol: ts.Symbol): boolean;
  set(symbol: ts.Symbol, value: any): void;
};

export function createScope(parent?: Scope, globals?: { [name: string]: any }): Scope {
  const currentGlobals = globals ?? parent?.globals ?? {};
  const current = new Map<ts.Symbol, any>();
  return {
    current,
    parent,
    globals: globals ?? parent?.globals,
    has(symbol: ts.Symbol) {
      if (current.has(symbol)) {
        return true;
      }
      if (parent && parent.has(symbol)) {
        return true;
      }
      if (symbol.escapedName.toString() in currentGlobals) {
        return true;
      }
      return false;
    },
    get(symbol: ts.Symbol) {
      if (current.has(symbol)) {
        return current.get(symbol);
      }
      if (parent && parent.has(symbol)) {
        return parent.get(symbol);
      }
      if (symbol.escapedName.toString() in currentGlobals) {
        return currentGlobals[symbol.escapedName.toString()];
      }
      return undefined;
    },
    set(symbol: ts.Symbol, value: any) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let currentScope: Scope | undefined = this;
      let valueSet = false;
      while (currentScope) {
        if (currentScope.current.has(symbol)) {
          currentScope.current.set(symbol, value);
          valueSet = true;
          break;
        }
        currentScope = currentScope.parent;
      }

      if (!valueSet) {
        if (symbol.escapedName.toString() in currentGlobals) {
          currentGlobals[symbol.escapedName.toString()] = value;
        } else {
          current.set(symbol, value);
        }
      }
    },
  };
}

function isSymbolWithIdentifier(o: unknown): o is SymbolWithIdentifier {
  if (!o || typeof o !== 'object') {
    return false;
  }
  const symbolWithIdentifier = o as SymbolWithIdentifier;
  return !!symbolWithIdentifier.identifier && !!symbolWithIdentifier.symbol;
}
