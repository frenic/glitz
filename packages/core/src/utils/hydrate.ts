import InjectorClient from '../client/InjectorClient';
import InjectorServer from '../server/InjectorServer';

const BLOCK_START_CODE = '{'.charCodeAt(0);
const BLOCK_END_CODE = '}'.charCodeAt(0);
const PLAIN_SELECTOR = /\.([\w]+)((?::.+)|(\[.+\]))?/;
const KEYFRAMES_SELECTOR = /@keyframes (.+)/;
const MEDIA_SELECTOR = /@media (.+)/;

export function createHydrate<TInjector extends InjectorClient | InjectorServer>(
  getInjector: (media?: string | undefined) => TInjector,
) {
  return function hydrate(
    css: string,
    explicitInjector?: TInjector,
    callback?: (injector: TInjector, rule: string) => void,
  ) {
    let depth = 0;
    let rule = '';
    let media = '';
    let selector = '';
    let body = '';
    for (let i = 0; i < css.length; i++) {
      const character = css[i];
      const code = character.charCodeAt(0);

      rule += character;

      if (code === BLOCK_START_CODE) {
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
      }
      if (code === BLOCK_END_CODE) {
        depth--;

        if (media && depth === 0) {
          media = '';
          continue;
        }

        if (media ? depth === 1 : depth === 0) {
          const currentInjector = explicitInjector ?? getInjector(media);

          let match: RegExpExecArray | null;
          if ((match = PLAIN_SELECTOR.exec(selector))) {
            currentInjector.hydrateClassName(body, match[1], match[2]);
          } else if ((match = KEYFRAMES_SELECTOR.exec(selector))) {
            currentInjector.hydrateKeyframes(body, match[1]);
          } else if (selector === '@font-face') {
            currentInjector.hydrateFontFace(body);
          } else {
            throw new Error('Unsupported CSS selector when hydrating in Glitz');
          }

          if (callback) {
            callback(currentInjector, rule);
          }

          rule = '';
          selector = '';
          body = '';

          continue;
        }
      }
      if (media ? depth > 1 : depth > 0) {
        body += character;
      } else {
        selector += character;
      }
    }
  };
}
