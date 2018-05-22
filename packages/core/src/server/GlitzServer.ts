import { Style } from '@glitz/type';
import Base from '../core/Base';
import { DEFAULT_HYDRATION_IDENTIFIER, Options } from '../types/options';
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

    this.getStyleMarkup = () => {
      const attribute = options.identifier || DEFAULT_HYDRATION_IDENTIFIER;
      let markup = '';
      if (plain) {
        markup += `<style data-${attribute}>${plain.getStyle()}</style>`;
      }
      const medias = options.mediaOrder ? Object.keys(mediaIndex).sort(options.mediaOrder) : Object.keys(mediaIndex);
      for (const media of medias) {
        markup += `<style data-${attribute} media="${media}">${mediaIndex[media].getStyle()}</style>`;
      }
      return markup;
    };
  }
}
