import { posix, relative } from 'path';
import * as ts from 'typescript';

export function typescriptDiagnostics(filename: string) {
  const program = ts.createProgram([filename], {
    target: ts.ScriptTarget.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: ts.JsxEmit.Preserve,
    strict: true,
    baseUrl: __dirname,
    skipLibCheck: true,
    paths: {
      '@glitz/*': ['./packages/*/src'],
      '@glitz/type': ['./packages/type'],
    },
    noEmit: true,
  });

  const diagnostics = ts.getPreEmitDiagnostics(program);

  return diagnostics
    .filter(diagnostic => diagnostic.file && diagnostic.start)
    .map(diagnostic => {
      const { line, character } = diagnostic.file!.getLineAndCharacterOfPosition(diagnostic.start!);
      const path = relative(__dirname, diagnostic.file!.fileName);
      return `${posix.join(...path.split('\\'))} ${line}:${character} - ${ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n',
      )}`;
    });
}
