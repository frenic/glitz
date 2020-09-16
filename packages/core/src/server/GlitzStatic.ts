import { Style, Theme } from '@glitz/type';
import { Base, createInjectStyle } from '../core/Base';
import { Options } from '../types/options';
import { createHashCounter } from '../utils/hash';
import InjectorServer from './InjectorServer';
import { formatMediaRule } from '../utils/format';

export default class GlitzStatic<TStyle = Style> implements Base<TStyle> {
  public injectStyle: (styles: TStyle | TStyle[], theme?: Theme) => string;
  public getStyle: () => string;
  constructor(options: Options = {}) {
    const prefix = options.prefix;
    const classNameHash = createHashCounter(prefix);
    const keyframesHash = createHashCounter(prefix);

    let plain: InjectorServer;
    const mediaIndex: {
      [media: string]: InjectorServer;
    } = {};

    const injector = (media?: string) =>
      media
        ? (mediaIndex[media] = mediaIndex[media] || new InjectorServer(classNameHash, keyframesHash))
        : (plain = plain || new InjectorServer(classNameHash, keyframesHash));

    this.injectStyle = createInjectStyle(injector, options.transformer);

    this.getStyle = () => {
      let css = '';
      if (plain) {
        css += plain.getStyleResult();
      }
      const medias = options.mediaOrder ? Object.keys(mediaIndex).sort(options.mediaOrder) : Object.keys(mediaIndex);
      for (const media of medias) {
        css += formatMediaRule(media, mediaIndex[media].getStyleResult());
      }
      return css;
    };
  }
}
