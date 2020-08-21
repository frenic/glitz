import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';
import transformer, { styledName } from '..';
import { GlitzStatic } from '@glitz/core';

export default function compile(files: { [fileName: string]: string }) {
  const staticGlitz = fs.readFileSync(path.join(__dirname, '..', 'static-glitz.ts')).toString();
  files['@glitz/react.ts'] = staticGlitz;

  const outputs: { [fileName: string]: string } = {};

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
      if (!fileName.includes(styledName)) {
        outputs[fileName] = data;
      }
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
  const glitz = new GlitzStatic();
  const transformers: ts.CustomTransformers = {
    before: [transformer(program, glitz)],
    after: [],
  };

  const writeFileCallback: ts.WriteFileCallback = (fileName: string, data: string) => {
    outputs[fileName] = data;
  };
  const { emitSkipped, diagnostics } = program.emit(undefined, writeFileCallback, undefined, false, transformers);

  if (emitSkipped) {
    for (const diagnostic of diagnostics) {
      if (typeof diagnostic.messageText === 'string') {
        console.error(diagnostic.messageText);
      } else {
        console.error(diagnostic.messageText.messageText);
      }
      console.error(diagnostic.file?.getText().substr(diagnostic.start!, diagnostic.length));
    }
    throw new Error('Compilation failed');
  }

  outputs['style.css'] = glitz.getStyle();

  return outputs;
}
