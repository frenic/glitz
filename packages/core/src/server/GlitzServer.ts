import { Globals, Style, Theme } from '@glitz/type';
import { Base, createStyleInjectors } from '../core/create-inject-style';
import { DEFAULT_HYDRATION_IDENTIFIER, Options } from '../types/options';
import { createHashCounter } from '../utils/hash';
import InjectorServer from './InjectorServer';
import { createHydrate } from '../utils/hydrate';
import { formatMediaRule } from '../utils/format';

export default class GlitzServer<TStyle = Style> implements Base<TStyle> {
  public injectStyle: (styles: TStyle | readonly TStyle[], theme?: Theme) => string;
  public injectGlobals: (styles: Globals, theme?: Theme) => void;
  public hydrate: (css: string) => void;
  public getStyleMarkup: () => string;
  public getStyleStream: () => [string, { [name: string]: string }, string] | undefined;
  public clone: () => GlitzServer<TStyle>;
  constructor(options?: Options);
  constructor(
    options: Options = {},
    classNameHash = createHashCounter(options.prefix),
    keyframesHash = createHashCounter(options.prefix),
    plainInjector?: InjectorServer,
    mediaInjectors: Record<string, InjectorServer> = {},
  ) {
    const getInjector = (media?: string) =>
      media
        ? (mediaInjectors[media] = mediaInjectors[media] || new InjectorServer(classNameHash, keyframesHash))
        : (plainInjector = plainInjector || new InjectorServer(classNameHash, keyframesHash));

    const [injectStyle, injectGlobals] = createStyleInjectors(getInjector, options.transformer);

    this.injectStyle = injectStyle;

    this.injectGlobals = injectGlobals;

    this.hydrate = createHydrate(getInjector);

    const identifier = options.identifier || DEFAULT_HYDRATION_IDENTIFIER;

    this.getStyleMarkup = () => {
      let markup = '';
      if (plainInjector) {
        markup += `<style data-${identifier}>${plainInjector.getStyleResult()}</style>`;
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
      if (plainInjector) {
        css += plainInjector.getStyleStream();
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

    this.clone = () => {
      const classNameHashClone = classNameHash.clone();
      const keyframesHashClone = keyframesHash.clone();

      const mediaInjectorsClone: Record<string, InjectorServer> = {};
      for (const media in mediaInjectors) {
        mediaInjectorsClone[media] = mediaInjectors[media].clone(classNameHashClone, keyframesHashClone);
      }

      return new (GlitzServer as any)(
        options,
        classNameHashClone,
        keyframesHashClone,
        plainInjector?.clone(classNameHashClone, keyframesHashClone),
        mediaInjectorsClone,
      );
    };
  }
}
