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

    const mediaOrder = options.mediaOrder;
    const mediaElements: { [media: string]: HTMLStyleElement } = {};
    let hasMediaElements = false;

    let mainInjector: InjectorClient;
    const mediaInjectors: {
      [media: string]: InjectorClient;
    } = {};

    const injector = (media?: string) => {
      if (media) {
        if (mediaInjectors[media]) {
          return mediaInjectors[media];
        }

        // Inserts element as last one when `null`
        let insertBefore: HTMLStyleElement | null = null;

        if (mediaOrder && hasMediaElements) {
          const medias = Object.keys(mediaElements);
          const orderedMedias = medias.concat(media).sort(mediaOrder);
          const index = orderedMedias.indexOf(media);
          if (index < orderedMedias.length - 1) {
            insertBefore = mediaElements[orderedMedias[index + 1]];
          }
        }

        hasMediaElements = true;
        const element = (mediaElements[media] = createStyleElement(media, insertBefore));
        return (mediaInjectors[media] = new InjectorClient(element, classHasher, keyframesHasher));
      } else {
        if (mainInjector) {
          return mainInjector;
        }

        let insertBefore: HTMLStyleElement | null = null;

        if (hasMediaElements) {
          const medias = Object.keys(mediaElements);
          if (mediaOrder) {
            const orderedMedias = medias.sort(mediaOrder);
            insertBefore = mediaElements[orderedMedias[0]];
          } else {
            insertBefore = mediaElements[medias[0]];
          }
        }

        return (mainInjector = new InjectorClient(
          createStyleElement(null, insertBefore),
          classHasher,
          keyframesHasher,
        ));
      }
    };

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
          hasMediaElements = true;
          mediaElements[media] = element;
          mediaInjectors[media] = new InjectorClient(element, classHasher, keyframesHasher);
        } else {
          mainInjector = new InjectorClient(element, classHasher, keyframesHasher);
        }
      }

      if (process.env.NODE_ENV !== 'production') {
        if (mediaOrder) {
          // Verify hydrated style element order
          const medias = Object.keys(mediaElements);
          const orderedMedias = medias.sort(mediaOrder);
          for (const key in medias) {
            if (medias[key] !== orderedMedias[key]) {
              console.error(
                'The order of media queries rendered by the server did not meet the expected ' +
                  'order by the browser. Make sure you pass the same function to the `mediaOrder`' +
                  'option for both `GlitzServer` and `GlitzClient`.',
              );
              break;
            }
          }
        }
      }
    }
  }
}
