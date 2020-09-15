import { Style, Theme } from '@glitz/type';
import { Base, createInjectStyle } from '../core/Base';
import { DEFAULT_HYDRATION_IDENTIFIER, Options } from '../types/options';
import { createHashCounter } from '../utils/hash';
import InjectorServer from './InjectorServer';
import { createHydrate } from '../utils/hydrate';
import { formatMediaRule } from '../utils/format';

export default class GlitzServer<TStyle = Style> implements Base<TStyle> {
  public injectStyle: (styles: TStyle | TStyle[], theme?: Theme) => string;
  public hydrate: (css: string) => void;
  public getStyleMarkup: () => string;
  public getStyleStream: () => [string, { [name: string]: string }, string] | undefined;
  public reset: (preserveHydration?: boolean) => void;
  constructor(options: Options = {}) {
    const prefix = options.prefix;
    const incrementClassNameHash = createHashCounter(prefix);
    const incrementKeyframesHash = createHashCounter(prefix);

    let plain: InjectorServer | undefined;
    const mediaInjectors: {
      [media: string]: InjectorServer;
    } = {};

    const getInjector = (media?: string) =>
      media
        ? (mediaInjectors[media] =
            mediaInjectors[media] || new InjectorServer(incrementClassNameHash, incrementKeyframesHash))
        : (plain = plain || new InjectorServer(incrementClassNameHash, incrementKeyframesHash));

    this.injectStyle = createInjectStyle(getInjector, options.transformer);

    this.hydrate = createHydrate(getInjector);

    const identifier = options.identifier || DEFAULT_HYDRATION_IDENTIFIER;

    this.getStyleMarkup = () => {
      let markup = '';
      if (plain) {
        markup += `<style data-${identifier}>${plain.getStyleResult()}</style>`;
      }
      const medias = options.mediaOrder
        ? Object.keys(mediaInjectors).sort(options.mediaOrder)
        : Object.keys(mediaInjectors);
      for (const media of medias) {
        markup += `<style data-${identifier} media="${media}">${mediaInjectors[media].getStyleResult()}</style>`;
      }
      return markup;
    };

    this.getStyleStream = () => {
      let css = '';
      if (plain) {
        css += plain.getStyleStream();
      }
      const medias = options.mediaOrder
        ? Object.keys(mediaInjectors).sort(options.mediaOrder)
        : Object.keys(mediaInjectors);
      for (const media of medias) {
        css += formatMediaRule(media, mediaInjectors[media].getStyleStream());
      }
      if (css) {
        return ['style', { [`data-${identifier}`]: '' }, css];
      }
      return undefined;
    };

    this.reset = (preserveHydration = true) => {
      this.injectStyle = createInjectStyle(getInjector, options.transformer);

      incrementClassNameHash.reset();
      incrementKeyframesHash.reset();

      if (!preserveHydration || (plain && plain.reset())) {
        plain = undefined;
      }

      for (const media in mediaInjectors) {
        if (!preserveHydration || mediaInjectors[media].reset()) {
          delete mediaInjectors[media];
        }
      }
    };
  }
}
