import Base, { DEFAULT_HYDRATE_CLASS_NAME } from '../core/Base';
import { Options } from '../types/options';
import { createStyleElement } from '../utils/dom';
import { createHashCounter } from '../utils/hash';
import InjectorClient from './InjectorClient';

export default class GlitzClient extends Base {
  constructor(
    styleElements?:
      | HTMLStyleElement[]
      | NodeListOf<HTMLStyleElement>
      | HTMLCollectionOf<HTMLStyleElement>
      | 'auto'
      | null,
    options: Options = {},
  ) {
    const classHasher = createHashCounter(options.prefix);
    const keyframesHasher = createHashCounter(options.prefix);

    let mainInjector: InjectorClient;
    const mediaInjectors: {
      [media: string]: InjectorClient;
    } = {};

    const injector = (media?: string) =>
      media
        ? (mediaInjectors[media] =
            mediaInjectors[media] || new InjectorClient(createStyleElement(media), classHasher, keyframesHasher))
        : (mainInjector = mainInjector || new InjectorClient(createStyleElement(), classHasher, keyframesHasher));

    super(injector, options.transformer);

    if (styleElements === 'auto') {
      styleElements = document.getElementsByClassName(DEFAULT_HYDRATE_CLASS_NAME) as HTMLCollectionOf<HTMLStyleElement>;
    }

    if (styleElements) {
      if (process.env.NODE_ENV !== 'production') {
        if (typeof (styleElements as any)[Symbol.iterator] !== 'function') {
          throw new Error(
            'The argument needs to be an iterable list of style elements like an array or an array-like object (using e.g. `document.getElementsByClassName`, `document.querySelectorAll`)',
          );
        }
        if (styleElements.length === 0) {
          console.warn('The argument iterable list is empty and wont hydrate any server rendered rules');
        }
      }

      for (const element of (styleElements as any) as Iterable<HTMLStyleElement>) {
        // Injector for style elements without `media` is stored with an empty key. So if there's any reason to have
        // more than one of these in the future we need to change that part.
        const media = element.media;

        if (media) {
          mediaInjectors[media] = new InjectorClient(element, classHasher, keyframesHasher);
        } else {
          mainInjector = new InjectorClient(element, classHasher, keyframesHasher);
        }
      }
    }
  }
}
