import Base, { DEFAULT_HYDRATE_CLASS_NAME } from '../core/Base';
import { Options } from '../types/options';
import { createHashCounter } from '../utils/hash';
import InjectorServer from './InjectorServer';

export default class GlitzServer extends Base {
  public getStyleMarkup: (className?: string) => string;
  constructor(options: Options = {}) {
    const classHasher = createHashCounter(options.prefix);
    const keyframesHasher = createHashCounter(options.prefix);

    let mainInjector: InjectorServer;
    const mediaInjectors: {
      [media: string]: InjectorServer;
    } = {};

    const injector = (media?: string) =>
      media
        ? (mediaInjectors[media] = mediaInjectors[media] || new InjectorServer(classHasher, keyframesHasher))
        : (mainInjector = mainInjector || new InjectorServer(classHasher, keyframesHasher));

    super(injector, options.transformer);

    this.getStyleMarkup = (className = DEFAULT_HYDRATE_CLASS_NAME) => {
      let markup = '';
      if (mainInjector) {
        markup += `<style class="${className}">${mainInjector.getStyle()}</style>`;
      }
      if (options.mediaOrder) {
        const orderedMedias = Object.keys(mediaInjectors).sort(options.mediaOrder);
        for (const media of orderedMedias) {
          markup += `<style class="${className}" media="${media}">${mediaInjectors[media].getStyle()}</style>`;
        }
      } else {
        for (const media in mediaInjectors) {
          markup += `<style class="${className}" media="${media}">${mediaInjectors[media].getStyle()}</style>`;
        }
      }
      return markup;
    };
  }
}
