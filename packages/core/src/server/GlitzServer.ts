import { Style } from '@glitz/type';
import Base from '../core/Base';
import { DEFAULT_HYDRATION_IDENTIFIER, Options } from '../types/options';
import { createHashCounter } from '../utils/hash';
import InjectorServer from './InjectorServer';

type StyleDetails = [string, { [name: string]: string }, string];

export default class GlitzServer<TStyle = Style> extends Base<TStyle> {
  public getStyleMarkup: () => string;
  public getStyleStreamDetails: () => StyleDetails[];
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

    const identifier = options.identifier || DEFAULT_HYDRATION_IDENTIFIER;

    this.getStyleMarkup = () => {
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

    this.getStyleStreamDetails = () => {
      const details: StyleDetails[] = [];
      if (plain) {
        const css = plain.getStyleStream();
        if (css) {
          details.push(['style', { [`data-${identifier}`]: '' }, css]);
        }
      }
      const medias = options.mediaOrder ? Object.keys(mediaIndex).sort(options.mediaOrder) : Object.keys(mediaIndex);
      for (const media of medias) {
        const css = mediaIndex[media].getStyleStream();
        if (css) {
          details.push(['style', { [`data-${identifier}`]: '', media }, css]);
        }
      }
      return details;
    };
  }
}
