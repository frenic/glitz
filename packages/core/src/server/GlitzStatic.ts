import { Style } from '@glitz/type';
import Base from '../core/Base';
import { Options } from '../types/options';
import { createHashCounter } from '../utils/hash';
import InjectorServer from './InjectorServer';

export default class GlitzStatic<TStyle = Style> extends Base<TStyle> {
  public getStyle: () => string;
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

    this.getStyle = () => {
      let css = '';
      if (plain) {
        css += plain.getStyle();
      }
      const medias = options.mediaOrder ? Object.keys(mediaIndex).sort(options.mediaOrder) : Object.keys(mediaIndex);
      for (const media of medias) {
        css += `@media ${media}{${mediaIndex[media].getStyle()}}`;
      }
      return css;
    };
  }
}
