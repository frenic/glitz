import { Style } from '@glitz/type';
import Base from '../core/Base';
import { DEFAULT_HYDRATION_IDENTIFIER, Options } from '../types/options';
import { createStyleElement, insertStyleElement } from '../utils/dom';
import { createHashCounter } from '../utils/hash';
import InjectorClient from './InjectorClient';

export default class GlitzClient<TStyle = Style> extends Base<TStyle> {
  constructor(options: Options = {}) {
    const prefix = options.prefix;
    const classHasher = createHashCounter(prefix);
    const keyframesHasher = createHashCounter(prefix);
    const fontFaceHasher = createHashCounter(prefix);

    const mediaOrderOption = options.mediaOrder;
    const mediaSheets: { [media: string]: HTMLStyleElement } = {};
    let initialMediaSheet: HTMLStyleElement | null = null;

    let plain: InjectorClient;
    const mediaIndex: {
      [media: string]: InjectorClient;
    } = {};

    const identifier = options.identifier || DEFAULT_HYDRATION_IDENTIFIER;

    const injector = (media?: string) => {
      if (media) {
        if (mediaIndex[media]) {
          return mediaIndex[media];
        }

        const element = (mediaSheets[media] = createStyleElement(media, identifier));

        let insertBefore: HTMLStyleElement | null = null;
        if (mediaOrderOption) {
          const orderedMediaKeys = Object.keys(mediaSheets).sort(mediaOrderOption);
          initialMediaSheet = mediaSheets[orderedMediaKeys[0]];
          insertBefore = mediaSheets[orderedMediaKeys[orderedMediaKeys.indexOf(media) + 1]] || null;
        }

        insertStyleElement(element, insertBefore);

        return (mediaIndex[media] = new InjectorClient(element, classHasher, keyframesHasher, fontFaceHasher));
      } else {
        if (plain) {
          return plain;
        }

        const element = insertStyleElement(createStyleElement(media, identifier), initialMediaSheet);

        return (plain = new InjectorClient(element, classHasher, keyframesHasher, fontFaceHasher));
      }
    };

    super(injector, options.transformer, options.atomic);

    const preRenderStyles = (document.head as HTMLHeadElement).querySelectorAll(`[data-${identifier}]`) as NodeListOf<
      HTMLStyleElement
    >;

    if (preRenderStyles) {
      for (const element of preRenderStyles) {
        // Injector for style elements without `media` is stored with an empty key. So if there's any reason to have
        // more than one of these in the future we need to change that part.
        const media = element.media;

        if (media) {
          if (!initialMediaSheet) {
            initialMediaSheet = element;
          }
          mediaSheets[media] = element;
          mediaIndex[media] = new InjectorClient(element, classHasher, keyframesHasher, fontFaceHasher);
        } else {
          plain = new InjectorClient(element, classHasher, keyframesHasher, fontFaceHasher);
        }
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
  }
}
