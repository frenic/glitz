import { Globals, Style, Theme } from '@glitz/type';
import { Base, createStyleInjectors } from '../core/create-style-injectors';
import { DEFAULT_HYDRATION_IDENTIFIER, Options } from '../types/options';
import { createHashCounter } from '../utils/hash';
import InjectorServer from './InjectorServer';
import { createHydrate } from '../utils/hydrate';
import { formatMediaRule } from '../utils/format';

export default class GlitzServer<TStyle = Style> implements Base<TStyle> {
  public identifier: string;
  public injectStyle: (styles: TStyle | readonly TStyle[], theme?: Theme) => string;
  public injectGlobals: (styles: Globals, theme?: Theme) => void;
  public hydrate: (css: string) => void;
  public getStyle: (markup?: boolean, stream?: boolean) => string;
  public clone: () => GlitzServer<TStyle>;
  constructor(options?: Options);
  constructor(
    options: Options = {},
    classNameHash = createHashCounter(options.prefix),
    keyframesHash = createHashCounter(options.prefix),
    plainInjector?: InjectorServer,
    mediaInjectors: Record<string, InjectorServer> = {},
  ) {
    const identifier = (this.identifier = options.identifier ?? DEFAULT_HYDRATION_IDENTIFIER);

    const getInjector = (media?: string) =>
      media
        ? (mediaInjectors[media] = mediaInjectors[media] || new InjectorServer(classNameHash, keyframesHash))
        : (plainInjector = plainInjector || new InjectorServer(classNameHash, keyframesHash));

    const [injectStyle, injectGlobals] = createStyleInjectors(getInjector, options.transformer);

    this.injectStyle = injectStyle;

    this.injectGlobals = injectGlobals;

    this.hydrate = createHydrate(getInjector);

    this.getStyle = (markup = false, stream = false) => {
      let result = '';
      if (plainInjector) {
        const style = stream ? plainInjector.getStyleStream() : plainInjector.getStyleResult();
        result += markup ? `<style data-${identifier}>${style}</style>` : style;
      }
      const medias = options.mediaOrder
        ? Object.keys(mediaInjectors).sort(options.mediaOrder)
        : Object.keys(mediaInjectors);
      for (const media of medias) {
        const style = stream ? mediaInjectors[media].getStyleStream() : mediaInjectors[media].getStyleResult();
        if (style) {
          result += markup
            ? `<style data-${identifier} media="${media}">${style}</style>`
            : formatMediaRule(media, style);
        }
      }
      return result;
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
