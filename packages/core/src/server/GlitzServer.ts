import { Style } from '@glitz/type';
import Base from '../core/Base';
import { DEFAULT_HYDRATION_IDENTIFIER, Options } from '../types/options';
import { createHashCounter } from '../utils/hash';
import InjectorServer from './InjectorServer';

export default class GlitzServer<TStyle = Style> extends Base<TStyle> {
  public getStyleMarkup: () => string;
  constructor(options: Options = {}) {
    const prefix = options.prefix;
    const classHasher = createHashCounter(prefix);
    const keyframesHasher = createHashCounter(prefix);

    let plain: InjectorServer;
    const mediaIndex: {
      [media: string]: InjectorServer;
    } = {};

    const injector = (media?: string) =>
      media
        ? (mediaIndex[media] = mediaIndex[media] || new InjectorServer(classHasher, keyframesHasher))
        : (plain = plain || new InjectorServer(classHasher, keyframesHasher));

    super(injector, options.transformer, options.atomic);

    this.getStyleMarkup = () => {
      const identifier = options.identifier || DEFAULT_HYDRATION_IDENTIFIER;
      let markup = '';
      if (plain) {
        markup += `<style data-${identifier}>${plain.getStyle()}</style>`;
      }
      const medias = options.mediaOrder ? Object.keys(mediaIndex).sort(options.mediaOrder) : Object.keys(mediaIndex);
      for (const media of medias) {
        markup += `<style data-${identifier} media="${media}">${mediaIndex[media].getStyle()}</style>`;
      }
      return markup;
    };
  }
}
