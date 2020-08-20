import * as path from 'path';
import * as fs from 'fs';
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
    lib: ['es2018', 'dom'],
    jsx: ts.JsxEmit.Preserve,
  };

  const compilerHost: ts.CompilerHost = {
    getSourceFile(filename) {
      if (filename in files) {
        return ts.createSourceFile(filename, files[filename], ts.ScriptTarget.Latest);
      }
      const libPath = path.join(__dirname, '..', '..', '..', '..', 'node_modules', 'typescript', 'lib');
      if (filename.indexOf('.d.ts') !== -1 && fs.existsSync(path.join(libPath, filename))) {
        return ts.createSourceFile(
          filename,
          fs.readFileSync(path.join(libPath, filename)).toString(),
          ts.ScriptTarget.Latest,
        );
      }
      const possibleLibFile = 'lib.' + filename.replace('.ts', '') + '.d.ts';
      if (fs.existsSync(path.join(libPath, possibleLibFile))) {
        return ts.createSourceFile(
          possibleLibFile,
          fs.readFileSync(path.join(libPath, possibleLibFile)).toString(),
          ts.ScriptTarget.Latest,
        );
      }
      console.log('TS asked for file', filename, 'but that was not passed in to the compile function');
      return undefined;
    },
    readFile(fileName: string) {
      return fileName;
    },
    fileExists() {
      return true;
    },
    getDefaultLibFileName() {
      return 'lib.d.ts';
    },
    writeFile(fileName, data) {
      outputs[fileName] = data;
    },
    getDirectories() {
      return null as any;
    },
    useCaseSensitiveFileNames() {
      return false;
    },
    getCanonicalFileName(filename) {
      return filename;
    },
    getCurrentDirectory() {
      return '';
    },
    getNewLine() {
      return '\n';
    },
  };

  const program = ts.createProgram(Object.keys(files), compilerOptions, compilerHost);
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
