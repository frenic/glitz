import * as ts from 'typescript';

const cachedStaticPrograms: { [name: string]: ts.Program } = {};
function getStaticProgram(name: string, files: { [moduleName: string]: string }) {
  if (name in cachedStaticPrograms) {
    return cachedStaticPrograms[name];
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
      for (const module of moduleNames) {
        const localTsFileName = `${module.slice(2)}.ts`;
        if (localTsFileName in files) {
          resolvedModules.push({ resolvedFileName: localTsFileName });
          continue;
        }

        const localTsxFileName = `${module.slice(2)}.tsx`;
        if (localTsxFileName in files) {
          resolvedModules.push({ resolvedFileName: localTsxFileName });
          continue;
        }

        const result = ts.resolveModuleName(module, containingFile, options, {
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

  cachedStaticPrograms[name] = ts.createProgram(Object.keys(files), compilerOptions, customCompilerHost);
  return cachedStaticPrograms[name];
}

type Exports = { [name: string]: ts.Symbol };
const cachedStaticExports: { [name: string]: Exports } = {};
export function getStaticExports(name: string, files: { [moduleName: string]: string }) {
  const program = getStaticProgram(name, files);
  if (name in cachedStaticExports) {
    return [cachedStaticExports[name], program] as const;
  }
  cachedStaticExports[name] = {};

  const typeChecker = program.getTypeChecker();
  const staticSource = program.getSourceFile(name + '.ts');
  if (!staticSource) {
    throw new Error('Cannot find static entry file for module ' + name);
  }

  for (const stmt of staticSource.statements) {
    if (
      ts.isVariableStatement(stmt) &&
      stmt.modifiers &&
      stmt.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const decl of stmt.declarationList.declarations) {
        cachedStaticExports[name][decl.name.getText()] = typeChecker.getSymbolAtLocation(decl.name)!;
      }
    }

    if (ts.isExportAssignment(stmt)) {
      const symbol = typeChecker.getSymbolAtLocation(stmt.expression);
      if (symbol) {
        cachedStaticExports[name]['default'] = symbol;
      }
    }

    if (
      ts.isFunctionDeclaration(stmt) &&
      stmt.modifiers &&
      stmt.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword) &&
      stmt.name
    ) {
      const exportName = stmt.modifiers.find(m => m.kind === ts.SyntaxKind.DefaultKeyword)
        ? 'default'
        : stmt.name.getText();
      cachedStaticExports[name][exportName] = typeChecker.getSymbolAtLocation(stmt.name)!;
    }
  }
  return [cachedStaticExports[name], program] as const;
}
