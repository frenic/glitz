import { Style, Theme } from '@glitz/type';
import { Base, createInjectStyle } from '../core/create-inject-style';
import { DEFAULT_HYDRATION_IDENTIFIER, Options } from '../types/options';
import { createStyleElement, insertStyleElement } from '../utils/dom';
import { createHashCounter } from '../utils/hash';
import InjectorClient from './InjectorClient';
import { createHydrate } from '../utils/hydrate';

export default class GlitzClient<TStyle = Style> implements Base<TStyle> {
  public injectStyle: (styles: TStyle | readonly TStyle[], theme?: Theme) => string;
  public hydrate: (css: string) => void;
  constructor(options: Options = {}) {
    const prefix = options.prefix;
    const classNameHash = createHashCounter(prefix);
    const keyframesHash = createHashCounter(prefix);

    const mediaOrderOption = options.mediaOrder;
    const mediaSheets: { [media: string]: HTMLStyleElement } = {};
    let initialMediaSheet: HTMLStyleElement | null = null;

    let plain: InjectorClient;
    const mediaInjectors: {
      [media: string]: InjectorClient;
    } = {};

    const identifier = options.identifier || DEFAULT_HYDRATION_IDENTIFIER;

    const getInjector = (media?: string) => {
      if (media) {
        if (mediaInjectors[media]) {
          return mediaInjectors[media];
        }

        const element = (mediaSheets[media] = createStyleElement(media, identifier));

        let insertBefore: HTMLStyleElement | null = null;
        if (mediaOrderOption) {
          const orderedMediaKeys = Object.keys(mediaSheets).sort(mediaOrderOption);
          initialMediaSheet = mediaSheets[orderedMediaKeys[0]];
          insertBefore = mediaSheets[orderedMediaKeys[orderedMediaKeys.indexOf(media) + 1]] || null;
        }

        insertStyleElement(element, insertBefore);

        return (mediaInjectors[media] = new InjectorClient(element, classNameHash, keyframesHash));
      } else {
        if (plain) {
          return plain;
        }

        const element = insertStyleElement(createStyleElement(media, identifier), initialMediaSheet);

        return (plain = new InjectorClient(element, classNameHash, keyframesHash));
      }
    };

    this.injectStyle = createInjectStyle(getInjector, options.transformer);

    const hydrate = (this.hydrate = createHydrate(getInjector));

    const preRenderedStyleElements = document.head.querySelectorAll<HTMLStyleElement>(`style[data-${identifier}]`);

    if (preRenderedStyleElements) {
      for (const element of preRenderedStyleElements) {
        // Injector for style elements without `media` is stored with an empty key. So if there's any reason to have
        // more than one of these in the future we need to change that part.
        const media = element.media;
        let injector: InjectorClient;

        if (media) {
          if (!initialMediaSheet) {
            initialMediaSheet = element;
          }
          mediaSheets[media] = element;
          injector = mediaInjectors[media] = new InjectorClient(element, classNameHash, keyframesHash);
        } else {
          injector = plain = new InjectorClient(element, classNameHash, keyframesHash);
        }

        hydrate(element.textContent!, injector);
      }

      if (process.env.NODE_ENV !== 'production') {
        if (mediaOrderOption) {
          // Verify hydrated style element order
          const medias = Object.keys(mediaSheets);
          const orderedMedias = medias.sort(mediaOrderOption);
          for (const index in medias) {
            if (medias[index] !== orderedMedias[index]) {
              console.warn(
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

    const streamedStyleElements = document.body.querySelectorAll<HTMLStyleElement>(`style[data-${identifier}]`);

    if (streamedStyleElements) {
      for (const element of streamedStyleElements) {
        hydrate(element.textContent!, undefined, (injector, rule) => injector.injectRaw(rule));
        element.parentNode!.removeChild(element);
      }
    }
  }
}
