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
const SUPPORTS_SELECTOR = /@supports[\s]?(.+)/;

export function createHydrate<TInjector extends InjectorClient | InjectorServer>(
  getInjector: (media?: string | undefined) => TInjector,
) {
  function matchDepth(initialDepth: number, media: string, condition: string) {
    if (media) {
      initialDepth++;
    }
    if (condition) {
      initialDepth++;
    }
    return initialDepth;
  }

  return function hydrate(css: string, forceMedia?: string, callback?: (injector: TInjector, rule: string) => void) {
    const length = css.length;
    let comment = false;
    let string: false | number = false;
    let depth = 0;
    let rule = '';
    let media = '';
    let condition = '';
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

            if (matchDepth(1, media, condition) === depth) {
              let match = MEDIA_SELECTOR.exec(selector);
              if (match) {
                media = match[1];
                rule = '';
                selector = '';
              }

              match = SUPPORTS_SELECTOR.exec(selector);
              if (match) {
                condition = match[1];
                rule = '';
                selector = '';
              }

              continue;
            }
          } else if (code === BLOCK_END_CODE) {
            depth--;

            if (media && condition && depth === 1) {
              condition = '';
              continue;
            }

            if (condition && depth === 0) {
              condition = '';
              continue;
            }

            if (media && depth === 0) {
              media = '';
              continue;
            }

            if (matchDepth(0, media, condition) === depth) {
              const injector = getInjector(forceMedia || media || void 0);

              let match: RegExpExecArray | null;
              if ((match = PLAIN_SELECTOR.exec(selector))) {
                injector.hydrateClassName(body, match[1], match[2], condition || void 0);
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

      if (matchDepth(0, media, condition) < depth) {
        body += character;
      } else if (comment === false && wasComment === false) {
        selector += character;
      }
    }
  };
}
