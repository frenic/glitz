import * as ts from 'typescript';
import { evaluate } from '../evaluator';

export default function (expression: string, files: { [fileName: string]: string } = {}, scope = {}) {
  const outputs: { [fileName: string]: string } = {};
  const rand = Math.random()
    .toString()
    .replace(/[^0-9]+/g, '');
  files['entry.ts'] += '\nconst expressionToBeEvaluated' + rand + ' = ' + expression + ';';

  let result: any;

  // tslint:disable-next-line: no-shadowed-variable
  function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => (file: ts.SourceFile) => {
      return visitNodeAndChildren(file, program, context);
    };
  }

  // tslint:disable-next-line: no-shadowed-variable
  function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): any {
    return ts.visitEachChild(
      visitNode(node, program),
      childNode => visitNodeAndChildren(childNode, program, context),
      context,
    );
  }

  // tslint:disable-next-line: no-shadowed-variable
  function visitNode(node: ts.Node, program: ts.Program): any /* TODO */ {
    if (ts.isVariableDeclaration(node)) {
      if (ts.isIdentifier(node.name) && node.initializer && node.name.text === 'expressionToBeEvaluated' + rand) {
        result = evaluate(node.initializer, program.getTypeChecker(), scope);
      }
    }
    return node;
  }

  const compilerOptions: ts.CompilerOptions = {
    noEmitOnError: true,
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    lib: ['lib.es2018.d.ts', 'lib.dom.d.ts'],
    types: [],
    jsx: ts.JsxEmit.Preserve,
  };

  const compilerHost = ts.createCompilerHost(compilerOptions);

  const customCompilerHost: ts.CompilerHost = {
    ...compilerHost,
    resolveModuleNames(moduleNames, containingFile, _, __, options) {
      const resolvedModules: ts.ResolvedModule[] = [];
      for (const moduleName of moduleNames) {
        const localFileName = `${moduleName.slice(2)}.ts`;
        if (localFileName in files) {
          resolvedModules.push({ resolvedFileName: localFileName });
          continue;
        }

        const result = ts.resolveModuleName(moduleName, containingFile, options, {
          fileExists(fileName) {
            return ts.sys.fileExists(fileName);
          },
          readFile(fileName) {
            return ts.sys.readFile(fileName);
          },
        });
        if (result.resolvedModule) {
          resolvedModules.push(result.resolvedModule);
        }
      }
      return resolvedModules;
    },
    getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile) {
      if (fileName in files) {
        return ts.createSourceFile(fileName, files[fileName], ts.ScriptTarget.Latest);
      }

      const sourceFile = compilerHost.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);

      if (!sourceFile) {
        console.log('TS asked for file', fileName, 'but that was not passed in to the compile function');
      }

      return sourceFile;
    },
    writeFile(fileName, data) {
      outputs[fileName] = data;
    },
  };

  const program = ts.createProgram(Object.keys(files), compilerOptions, customCompilerHost);
  const transformers: ts.CustomTransformers = {
    before: [transformer(program)],
    after: [],
  };

  const writeFileCallback: ts.WriteFileCallback = (fileName: string, data: string) => {
    outputs[fileName] = data;
  };
  const { emitSkipped, diagnostics } = program.emit(undefined, writeFileCallback, undefined, false, transformers);

  if (emitSkipped) {
    throw new Error(diagnostics.map(diagnostic => diagnostic.messageText).join('\n'));
  }

  return result;
}
