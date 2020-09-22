import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { moduleName } from './transformer';

let cachedStaticGlitzProgram: ts.Program | undefined;
function getStaticGlitzProgram() {
  if (cachedStaticGlitzProgram) {
    return cachedStaticGlitzProgram;
  }
  const compilerOptions: ts.CompilerOptions = {
    noEmitOnError: true,
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    lib: ['lib.es2018.d.ts', 'lib.dom.d.ts'],
    types: [],
    jsx: ts.JsxEmit.Preserve,
  };

  const files: { [moduleName: string]: string } = {};
  files[moduleName + '.ts'] = fs.readFileSync(path.join(__dirname, 'static-glitz.ts')).toString();
  files['shared.ts'] = fs.readFileSync(path.join(__dirname, 'shared.ts')).toString();

  const compilerHost = ts.createCompilerHost(compilerOptions);

  const customCompilerHost: ts.CompilerHost = {
    ...compilerHost,
    resolveModuleNames(moduleNames, containingFile, _, __, options) {
      const resolvedModules: ts.ResolvedModule[] = [];
      for (const name of moduleNames) {
        const localTsFileName = `${name.slice(2)}.ts`;
        if (localTsFileName in files) {
          resolvedModules.push({ resolvedFileName: localTsFileName });
          continue;
        }

        const localTsxFileName = `${name.slice(2)}.tsx`;
        if (localTsxFileName in files) {
          resolvedModules.push({ resolvedFileName: localTsxFileName });
          continue;
        }

        const result = ts.resolveModuleName(name, containingFile, options, {
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
    writeFile() {
      /** noop */
    },
  };

  cachedStaticGlitzProgram = ts.createProgram(Object.keys(files), compilerOptions, customCompilerHost);
  return cachedStaticGlitzProgram;
}

let cachedStaticGlitzExports: { [name: string]: ts.Symbol } | undefined;
export function getStaticGlitzExports() {
  if (cachedStaticGlitzExports) {
    return [cachedStaticGlitzExports, cachedStaticGlitzProgram as ts.Program] as const;
  }
  cachedStaticGlitzExports = {};

  const program = getStaticGlitzProgram();
  const typeChecker = program.getTypeChecker();
  const staticSource = program.getSourceFile(moduleName + '.ts');
  if (!staticSource) {
    throw new Error('Cannot find static Glitz file');
  }

  for (const stmt of staticSource.statements) {
    if (
      ts.isVariableStatement(stmt) &&
      stmt.modifiers &&
      stmt.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const decl of stmt.declarationList.declarations) {
        cachedStaticGlitzExports[decl.name.getText()] = typeChecker.getSymbolAtLocation(decl.name)!;
      }
    }

    if (
      ts.isFunctionDeclaration(stmt) &&
      stmt.modifiers &&
      stmt.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword) &&
      stmt.name
    ) {
      cachedStaticGlitzExports[stmt.name.getText()] = typeChecker.getSymbolAtLocation(stmt.name)!;
    }
  }
  return [cachedStaticGlitzExports, cachedStaticGlitzProgram as ts.Program] as const;
}
