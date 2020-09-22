import { GlitzStatic } from '@glitz/core';

type Output = ((output: string) => Promise<unknown> | void) | string;

export class GlitzStaticPlugin {
  private glitz: GlitzStatic;
  private output: Output;
  constructor(glitz: GlitzStatic, output: Output) {
    this.glitz = glitz;
    this.output = output;
  }
  apply(compiler: any) {
    compiler.hooks.emit.tapAsync('GlitzStaticPlugin', async (compilation: any, callback: () => void) => {
      const css = this.glitz.getStyle();
      const output = this.output;

      if (typeof output === 'string') {
        compilation.assets[output] = {
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

      callback();
    });
  }
}
