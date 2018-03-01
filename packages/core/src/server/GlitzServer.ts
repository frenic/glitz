import { Style } from '@glitz/type';
import Base, { DEFAULT_HYDRATE_CLASS_NAME } from '../core/Base';
import { Options } from '../types/options';
import { createHashCounter } from '../utils/hash';
import InjectorServer from './InjectorServer';

export default class GlitzServer<TStyle = Style> extends Base<TStyle> {
  public getStyleMarkup: (className?: string) => string;
  constructor(options: Options = {}) {
    const prefix = options.prefix;
    const classHasher = createHashCounter(prefix);
    const keyframesHasher = createHashCounter(prefix);
    const fontFaceHasher = createHashCounter(prefix);

    let plain: InjectorServer;
    const mediaIndex: {
      [media: string]: InjectorServer;
    } = {};

    const injector = (media?: string) =>
      media
        ? (mediaIndex[media] = mediaIndex[media] || new InjectorServer(classHasher, keyframesHasher, fontFaceHasher))
        : (plain = plain || new InjectorServer(classHasher, keyframesHasher, fontFaceHasher));

    super(injector, options.transformer, options.atomic);

    this.getStyleMarkup = (className = DEFAULT_HYDRATE_CLASS_NAME) => {
      let markup = '';
      if (plain) {
        markup += `<style class="${className}">${plain.getStyle()}</style>`;
      }
      const medias = options.mediaOrder ? Object.keys(mediaIndex).sort(options.mediaOrder) : Object.keys(mediaIndex);
      for (const media of medias) {
        markup += `<style class="${className}" media="${media}">${mediaIndex[media].getStyle()}</style>`;
      }
      return markup;
    };
  }
}
