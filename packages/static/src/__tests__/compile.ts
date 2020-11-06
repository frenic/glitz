import * as path from 'path';
import * as ts from 'typescript';
import {
  transformer,
  styledName,
  Diagnostic,
  TransformerOptions,
  glitzReactModuleName,
  glitzCoreModuleName,
} from '../transformer';
import { GlitzServer } from '@glitz/core';

export type TransformerDiagnostics = Diagnostic[];
export type Code = { [fileName: string]: string };

export default function compile(
  files: { [fileName: string]: string },
  transformerOptions?: Partial<TransformerOptions>,
) {
  const outputs: Code = {};

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
        if (moduleName === glitzReactModuleName) {
          resolvedModules.push({
            resolvedFileName: path.join(__dirname, '..', 'static-glitz-react.ts'),
          });
          continue;
        }

        if (moduleName === glitzCoreModuleName) {
          resolvedModules.push({
            resolvedFileName: path.join(__dirname, '..', 'static-glitz-core.ts'),
          });
          continue;
        }

        if (moduleName === 'react') {
          resolvedModules.push({
            resolvedFileName: path.join(__dirname, '..', 'static-react.ts'),
          });
          continue;
        }

        const localTsFileName = `${moduleName.slice(2)}.ts`;
        if (localTsFileName in files) {
          resolvedModules.push({ resolvedFileName: localTsFileName });
          continue;
        }

        const localTsxFileName = `${moduleName.slice(2)}.tsx`;
        if (localTsxFileName in files) {
          resolvedModules.push({ resolvedFileName: localTsxFileName });
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
        return ts.createSourceFile(fileName, files[fileName].trim(), ts.ScriptTarget.Latest);
      }

      const sourceFile = compilerHost.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);

      if (!sourceFile) {
        console.log('TS asked for file', fileName, 'but that was not passed in to the compile function');
      }

      return sourceFile;
    },
    writeFile(fileName, data) {
      if (!fileName.includes(styledName)) {
        outputs[fileName] = data;
      }
    },
  };

  const program = ts.createProgram(Object.keys(files), compilerOptions, customCompilerHost);
  const glitz = new GlitzServer();

  const transformerDiagnostics: TransformerDiagnostics = [];
  const transformers: ts.CustomTransformers = {
    before: [
      transformer(program, glitz, {
        mode: 'development',
        diagnosticsReporter: diagnostic => transformerDiagnostics.push(diagnostic),
        ...(transformerOptions ?? {}),
      }),
    ],
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

  return [outputs, transformerDiagnostics] as const;
}
