import { Style } from '@glitz/type';
import Base from '../core/Base';
import { DEFAULT_HYDRATION_IDENTIFIER, Options } from '../types/options';
import { createHashCounter } from '../utils/hash';
import InjectorServer from './InjectorServer';
import { createHydrate } from '../utils/hydrate';
import { formatMediaRule } from '../utils/format';

export default class GlitzServer<TStyle = Style> extends Base<TStyle> {
  public hydrate: (css: string) => void;
  public getStyleMarkup: () => string;
  public getStyleStream: () => [string, { [name: string]: string }, string] | undefined;
  constructor(options: Options = {}) {
    const prefix = options.prefix;
    const incrementClassNameHash = createHashCounter(prefix);
    const incrementKeyframesHash = createHashCounter(prefix);

    let plain: InjectorServer;
    const mediaIndex: {
      [media: string]: InjectorServer;
    } = {};

    const getInjector = (media?: string) =>
      media
        ? (mediaIndex[media] = mediaIndex[media] || new InjectorServer(incrementClassNameHash, incrementKeyframesHash))
        : (plain = plain || new InjectorServer(incrementClassNameHash, incrementKeyframesHash));

    super(getInjector, options.transformer, options.atomic);

    this.hydrate = createHydrate(getInjector, incrementClassNameHash, incrementKeyframesHash);

    const identifier = options.identifier || DEFAULT_HYDRATION_IDENTIFIER;

    this.getStyleMarkup = () => {
      let markup = '';
      if (plain) {
        markup += `<style data-${identifier}>${plain.getStyleResult()}</style>`;
      }
      const medias = options.mediaOrder ? Object.keys(mediaIndex).sort(options.mediaOrder) : Object.keys(mediaIndex);
      for (const media of medias) {
        markup += `<style data-${identifier} media="${media}">${mediaIndex[media].getStyleResult()}</style>`;
      }
      return markup;
    };

    this.getStyleStream = () => {
      let css = '';
      if (plain) {
        css += plain.getStyleStream();
      }
      const medias = options.mediaOrder ? Object.keys(mediaIndex).sort(options.mediaOrder) : Object.keys(mediaIndex);
      for (const media of medias) {
        css += formatMediaRule(media, mediaIndex[media].getStyleStream());
      }
      if (css) {
        return ['style', { [`data-${identifier}`]: '' }, css];
      }
      return undefined;
    };
  }
}
