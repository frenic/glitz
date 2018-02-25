import { FontFace, Style } from '@glitz/type';
import InjectorClient from '../client/InjectorClient';
import InjectorServer from '../server/InjectorServer';
import { Transformer } from '../types/options';
import { validateMixingShorthandLonghand } from '../utils/mixing-shorthand-longhand';

type Dictionary<TValue> = { [cssProperty: string]: TValue };
type PseudoInMediaDictionary<TValue> = { [pseudoInMediaProperty: string]: Dictionary<TValue> };
type MediaOrPseudoDictionary<TValue> = {
  [mediaOrPseudoProperty: string]: Dictionary<TValue> | PseudoInMediaDictionary<TValue>;
};

type CacheValue = {
  [value: string]: string;
};

type SelectorsValue = 1;

export const DEFAULT_HYDRATE_CLASS_NAME = '__glitz__';
const ANIMATION_NAME = 'animationName';
const FONT_FAMILY = 'fontFamily';

export default class Base<TStyle extends Style> {
  public injectStyle: (styles: TStyle | TStyle[]) => string;
  constructor(injector: (media?: string) => InjectorClient | InjectorServer, transformer: Transformer | undefined) {
    const declarator = transformer
      ? (property: string, value: (string | number) | Array<string | number>) =>
          transformer(declaration(property, value))
      : declaration;

    const cache: Dictionary<CacheValue> | MediaOrPseudoDictionary<CacheValue> = {};

    const inject = (
      style: TStyle,
      selectors: Dictionary<SelectorsValue> | MediaOrPseudoDictionary<SelectorsValue>,
      media?: string,
      pseudo?: string,
    ) => {
      let classNames = '';

      for (const property in style) {
        const value = (style as any)[property];

        if (typeof value === 'string' || typeof value === 'number') {
          if (shouldSkip(selectors, property, media, pseudo, true)) {
            continue;
          }

          // Only supports caching of primitive values
          let dictionary = cache as Dictionary<CacheValue>;
          if (media && pseudo) {
            const pseudoCache = (cache[media] = cache[media] || {}) as PseudoInMediaDictionary<CacheValue>;
            dictionary = pseudoCache[pseudo] = pseudoCache[pseudo] || {};
          } else if (media) {
            dictionary = (cache[media] = cache[media] || {}) as Dictionary<CacheValue>;
          } else if (pseudo) {
            dictionary = (cache[pseudo] = cache[pseudo] || {}) as Dictionary<CacheValue>;
          }

          const cachedValues = (dictionary[property] = dictionary[property] || {});

          if (cachedValues[value]) {
            classNames += ' ' + cachedValues[value];
            continue;
          }

          const className = injector(media).injectClassRule(declarator(property, value), pseudo);

          if (className) {
            cachedValues[value] = className;
          }

          classNames += ' ' + className;
          continue;
        }

        if (typeof value === 'object') {
          if (process.env.NODE_ENV !== 'production') {
            let isEmpty = true;
            for (const x in value) {
              isEmpty = false;
              // tslint:disable no-unused-expression
              x;
              break;
            }
            if (isEmpty) {
              console.warn(
                'The style property `%s` was an empty %s and should be removed',
                property,
                Array.isArray(value) ? 'array' : 'object',
              );
            }
          }

          // Pseudo
          if (property[0] === ':') {
            const combinedPseudo = (pseudo || '') + property;
            classNames += inject(value, selectors, media, combinedPseudo);
            continue;
          }

          if (property.indexOf('@media') === 0) {
            const combinedMedia = (media ? `${media} and ` : '') + property.slice(7);
            classNames += inject(value, selectors, combinedMedia, pseudo);
            continue;
          }

          if (property === '@keyframes' || property === ANIMATION_NAME) {
            if (shouldSkip(selectors, ANIMATION_NAME, media, pseudo, false)) {
              continue;
            }
            const name = injector().injectKeyframesRule(value);
            if (name) {
              classNames += inject({ [ANIMATION_NAME]: name } as TStyle, selectors, media, pseudo);
              continue;
            }
          }

          if (property === '@font-face' || property === FONT_FAMILY) {
            if (shouldSkip(selectors, FONT_FAMILY, media, pseudo, false)) {
              continue;
            }
            let names = '';
            const families: Array<string | FontFace> = Array.isArray(value) ? value : [value];
            for (const family of families) {
              if (names) {
                names += ',';
              }
              names += typeof family === 'string' ? family : injector().injectFontFaceRule(family);
            }
            if (names) {
              classNames += inject({ [FONT_FAMILY]: names } as TStyle, selectors, media, pseudo);
              continue;
            }
          }

          if (Array.isArray(value)) {
            classNames += ' ' + injector(media).injectClassRule(declarator(property, value), pseudo);
            continue;
          }

          // Shorthand objects
          let isValid = true;
          const longhand: any = {};

          for (const extension in value) {
            if (process.env.NODE_ENV !== 'production') {
              if (!/^[a-z]+$/i.test(extension)) {
                console.error(
                  "The property `%s['%s']` in %O isn't a valid shorthand extension and will likely cause a failure",
                  property,
                  extension,
                  value,
                );
              }
            }

            const longhandValue = value[extension];
            const typeOfValue = typeof longhandValue;

            if (
              typeOfValue === 'string' ||
              typeOfValue === 'number' ||
              Array.isArray(longhandValue) ||
              // Objects are only valid for `animation.name` and `font.family`
              ((typeOfValue === 'object' && (property === 'animation' && extension === 'name')) ||
                (property === 'font' && extension === 'family'))
            ) {
              if (extension === 'x') {
                longhand[property + 'Left'] = longhandValue;
                longhand[property + 'Right'] = longhandValue;
                continue;
              }

              if (extension === 'y') {
                longhand[property + 'Top'] = longhandValue;
                longhand[property + 'Bottom'] = longhandValue;
                continue;
              }

              // Convert to camel cased CSS property due to cache
              longhand[property + extension[0].toUpperCase() + extension.slice(1)] = longhandValue;
              continue;
            }

            if (process.env.NODE_ENV !== 'production') {
              console.error(
                "The object of `%s` isn't a valid shorthand object and will be ignored because property `%s['%s']` wasn't a string, number or array of values, was %O",
                property,
                property,
                extension,
                value,
              );
            }

            isValid = false;
            break;
          }

          if (isValid) {
            classNames += inject(longhand, selectors, media, pseudo);
          }

          continue;
        }

        if (process.env.NODE_ENV !== 'production') {
          console.error('The style property `%s` does not support the value %O', property, value);
        }
      }

      return classNames;
    };

    this.injectStyle = (styles: TStyle | TStyle[]) => {
      const selectors = {};
      let classNames = '';

      if (Array.isArray(styles)) {
        for (let i = styles.length; i >= 0; i--) {
          classNames += inject(styles[i], selectors);
        }
      } else {
        classNames = inject(styles, selectors);
      }

      if (process.env.NODE_ENV !== 'production') {
        validateMixingShorthandLonghand(selectors, classNames);
      }

      return classNames.slice(1);
    };
  }
}

function declaration(property: string, value: (string | number) | Array<string | number>) {
  return { [property]: value };
}

function shouldSkip(
  selectors: Dictionary<SelectorsValue> | MediaOrPseudoDictionary<SelectorsValue>,
  property: string,
  media: string | undefined,
  pseudo: string | undefined,
  willBeIncluded: boolean,
) {
  let directory = selectors as Dictionary<SelectorsValue>;
  if (media && pseudo) {
    const pseudoSelectors = (selectors[media] = selectors[media] || {}) as PseudoInMediaDictionary<SelectorsValue>;
    directory = pseudoSelectors[pseudo] = pseudoSelectors[pseudo] || {};
  } else if (media) {
    directory = (selectors[media] = selectors[media] || {}) as Dictionary<SelectorsValue>;
  } else if (pseudo) {
    directory = (selectors[pseudo] = selectors[pseudo] || {}) as Dictionary<SelectorsValue>;
  }

  if (property in directory) {
    return true;
  }

  if (willBeIncluded) {
    directory[property] = 1;
  }

  return false;
}
