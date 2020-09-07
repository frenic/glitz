import { GlitzStatic } from '@glitz/core';

export class GlitzStaticPlugin {
  private glitz: GlitzStatic;
  private filename: string;
  constructor(glitz: GlitzStatic, filename: string) {
    this.glitz = glitz;
    this.filename = filename;
  }
  apply(compiler: any) {
    compiler.hooks.emit.tapAsync('GlitzStaticPlugin', (compilation: any, callback: () => void) => {
      const css = this.glitz.getStyle();

      compilation.assets[this.filename] = {
        source() {
          return css;
        },
        size() {
          return css.length;
        },
      };

      callback();
    });
  }
}
