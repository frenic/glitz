import * as crypto from 'crypto';
import { GlitzStatic } from '@glitz/core';
import type * as webpack from 'webpack';

const PLUGIN_NAME = 'GlitzStaticPlugin';
const HASH_REGEX = /\[contenthash(?::(\d+))?\]/i;

type Output = ((output: string) => Promise<unknown> | void) | string;

export class GlitzStaticPlugin {
  private glitz: GlitzStatic;
  private output: Output;
  private hash: (css: string, length: number) => string;
  constructor(glitz: GlitzStatic, output: Output) {
    this.glitz = glitz;
    this.output = output;
    this.hash = (css, length): string => {
      const hash = crypto.createHash('md5', { encoding: 'hex' });
      hash.write(css);
      hash.end();
      return hash.read(length);
    };
  }
  apply(compiler: webpack.Compiler) {
    const output = this.output;

    compiler.hooks.emit.tapPromise(PLUGIN_NAME, async compilation => {
      const css = this.glitz.getStyle();
      if (typeof output === 'string') {
        const filename = output.replace(HASH_REGEX, ({}, length) =>
          this.hash(css, length ? parseInt(length, 10) : Infinity),
        );
        compilation.assets[filename] = {
          source() {
            return css;
          },
          size() {
            return css.length;
          },
        };
      } else {
        await output(css);
      }

      const { diagnostics } = this.glitz;
      const logger = compilation.getLogger(PLUGIN_NAME);

      function message(diagnostic: typeof diagnostics extends (infer U)[] ? U : never, level = 0): string {
        return (
          `${'    '.repeat(level)}${diagnostic.message}\n` +
          `${'    '.repeat(level)}  in ${diagnostic.file}:${diagnostic.line}` +
          (diagnostic.innerDiagnostic ? `\n${message(diagnostic.innerDiagnostic, ++level)}` : '')
        );
      }

      for (const diagnostic of this.glitz.diagnostics) {
        const { severity } = diagnostic;
        switch (severity) {
          case 'error':
            compilation.errors.push(message(diagnostic));
            break;
          case 'warning':
            compilation.warnings.push(message(diagnostic));
            break;
          case 'info':
            logger.info(message(diagnostic));
            break;
        }
      }
    });
  }
}
