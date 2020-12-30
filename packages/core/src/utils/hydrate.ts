import InjectorClient from '../client/InjectorClient';
import InjectorServer from '../server/InjectorServer';

const BLOCK_START_CODE = '{'.charCodeAt(0);
const BLOCK_END_CODE = '}'.charCodeAt(0);
const SINGLE_QUOTE_CODE = "'".charCodeAt(0);
const DOUBLE_QUOTE_CODE = '"'.charCodeAt(0);
const SLASH_CODE = '/'.charCodeAt(0);
const ASTERISK_CODE = '*'.charCodeAt(0);
const PLAIN_SELECTOR = /\.([\w]+)((?::.+)|(\[.+\]))?/;
const KEYFRAMES_SELECTOR = /@keyframes (.+)/;
const MEDIA_SELECTOR = /@media[\s]?(.+)/;

export function createHydrate<TInjector extends InjectorClient | InjectorServer>(
  getInjector: (media?: string | undefined) => TInjector,
) {
  return function hydrate(css: string, forceMedia?: string, callback?: (injector: TInjector, rule: string) => void) {
    const length = css.length;
    let comment = false;
    let string: false | number = false;
    let depth = 0;
    let rule = '';
    let media = '';
    let selector = '';
    let body = '';

    for (let i = 0; i < length; i++) {
      const character = css[i];
      const code = character.charCodeAt(0);
      let wasComment = false;

      rule += character;

      if (string === false) {
        if (comment === false) {
          if (code === SLASH_CODE && length > i + 1 && css.charCodeAt(i + 1) === ASTERISK_CODE) {
            comment = true;
          } else if (code === SINGLE_QUOTE_CODE || code === DOUBLE_QUOTE_CODE) {
            string = code;
          } else if (code === BLOCK_START_CODE) {
            depth++;

            if (media ? depth === 2 : depth === 1) {
              const match = MEDIA_SELECTOR.exec(selector);
              if (match) {
                media = match[1];
                rule = '';
                selector = '';
              }

              continue;
            }
          } else if (code === BLOCK_END_CODE) {
            depth--;

            if (media && depth === 0) {
              media = '';
              continue;
            }

            if (media ? depth === 1 : depth === 0) {
              const injector = getInjector(forceMedia || media);

              let match: RegExpExecArray | null;
              if ((match = PLAIN_SELECTOR.exec(selector))) {
                injector.hydrateClassName(body, match[1], match[2]);
              } else if ((match = KEYFRAMES_SELECTOR.exec(selector))) {
                injector.hydrateKeyframes(body, match[1]);
              } else if (selector === '@font-face') {
                injector.hydrateFontFace(body);
              }

              if (callback) {
                callback(injector, rule);
              }

              rule = '';
              selector = '';
              body = '';

              continue;
            }
          }
        } else if (code === SLASH_CODE && css.charCodeAt(i - 1) === ASTERISK_CODE) {
          comment = false;
          wasComment = true;
        }
      } else if (code === string) {
        string = false;
      }

      if (media ? depth > 1 : depth > 0) {
        body += character;
      } else if (comment === false && wasComment === false) {
        selector += character;
      }
    }
  };
}
