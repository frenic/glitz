import { FontFace, Style } from '@glitz/type';
import InjectorClient from '../client/InjectorClient';
import InjectorServer from '../server/InjectorServer';
import { Transformer } from '../types/options';
import { validateMixingShorthandLonghand } from '../utils/mixing-shorthand-longhand';

type StyleValue = string | number | Array<string | number>;

type Declarations<TValue = StyleValue> = { [property: string]: TValue };

type MediaIndex<TValue = StyleValue> =
  | Declarations<TValue>
  | {
      [pseudo: string]: Declarations<TValue>;
    };

type Index<TValue = StyleValue> =
  | Declarations<TValue>
  | {
      [selector: string]: Declarations<TValue> | MediaIndex<TValue>;
    };

type CacheValue = {
  [value: string]: string;
};

export const DEFAULT_HYDRATE_CLASS_NAME = '__glitz__';
const ANIMATION_NAME = 'animationName';
const FONT_FAMILY = 'fontFamily';
const NON_ATOMIC_KEY = '$';

export default class Base<TStyle extends Style> {
  public injectStyle: (styles: TStyle | TStyle[]) => string;
  constructor(
    injector: (media?: string) => InjectorClient | InjectorServer,
    transformer: Transformer | undefined,
    atomic: boolean | undefined,
  ) {
    const resolve = (style: TStyle | Declarations, result: Index = {}, media?: string, pseudo?: string) => {
      const properties = Object.keys(style);

      for (let i = properties.length - 1; i >= 0; i--) {
        const property = properties[i];
        const value = (style as any)[property];

        if (isPrimitive(value)) {
          const declarations = getIndex(result, media, pseudo);
          if (!(property in declarations)) {
            declarations[property] = value;
            continue;
          }
          continue;
        }

        if (process.env.NODE_ENV !== 'production') {
          if (typeof value !== 'object') {
            console.error('The style property `%s` was has to be a string, number or object, was %O', property, value);
          } else if (Object.keys(value).length === 0) {
            console.error(
              'The style property `%s` was an empty %s and should be removed because it can cause unexpected behavior',
              property,
              Array.isArray(value) ? 'array' : 'object',
            );
          }
        }

        if (property === '@keyframes' || property === ANIMATION_NAME) {
          const declarations = getIndex(result, media, pseudo);
          if (!(ANIMATION_NAME in declarations)) {
            const name = injector().injectKeyframesRule(value);
            declarations[ANIMATION_NAME] = name;
          }
          continue;
        }

        if (property === '@font-face' || property === FONT_FAMILY) {
          const declarations = getIndex(result, media, pseudo);
          if (!(FONT_FAMILY in declarations)) {
            let names = '';
            const families: Array<string | FontFace> = Array.isArray(value) ? value : [value];
            for (const family of families) {
              if (names) {
                names += ',';
              }
              names += typeof family === 'string' ? family : injector().injectFontFaceRule(family);
            }
            declarations[FONT_FAMILY] = names;
          }
          continue;
        }

        // Pseudo
        if (property[0] === ':') {
          const combinedPseudo = (pseudo || '') + property;
          resolve(value, result, media, combinedPseudo);
          continue;
        }

        // Media
        if (property[0] === '@') {
          resolve(value, result, property, pseudo);
          continue;
        }

        if (Array.isArray(value)) {
          const declarations = getIndex(result, media, pseudo);
          if (!(property in declarations)) {
            declarations[property] = value;
          }
          continue;
        }

        // Shorthand objects
        let isValid = true;
        const longhandDeclarations: Declarations = {};

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

          if (
            isPrimitive(longhandValue) ||
            Array.isArray(longhandValue) ||
            // Objects are only valid for `animation.name` and `font.family`
            ((typeof longhandValue === 'object' && (property === 'animation' && extension === 'name')) ||
              (property === 'font' && extension === 'family'))
          ) {
            if (extension === 'x') {
              longhandDeclarations[property + 'Left'] = longhandValue;
              longhandDeclarations[property + 'Right'] = longhandValue;
              continue;
            }

            if (extension === 'y') {
              longhandDeclarations[property + 'Top'] = longhandValue;
              longhandDeclarations[property + 'Bottom'] = longhandValue;
              continue;
            }

            // Convert to camel cased CSS property due to cache
            longhandDeclarations[property + extension[0].toUpperCase() + extension.slice(1)] = longhandValue;
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
          resolve(longhandDeclarations, result, media, pseudo);
          continue;
        }

        if (process.env.NODE_ENV !== 'production') {
          console.error('The style property `%s` does not support the value %O', property, value);
        }
      }

      return result;
    };

    const injectClassName = (declarations: Declarations, media: string | undefined, pseudo: string | undefined) =>
      injector(media).injectClassRule(transformer ? transformer(declarations) : declarations, pseudo);

    const cache: Index<CacheValue> = {};

    const inject =
      // Atomic as default
      atomic === false
        ? (style: Index | MediaIndex, media?: string, pseudo?: string) => {
            let classNames = '';
            const properties = Object.keys(style);
            const blocks: Index = {};

            for (let i = properties.length - 1; i >= 0; i--) {
              const property = properties[i];
              const value = style[property];

              if (property[0] === ':' || property[0] === '@') {
                blocks[property] = value;
                continue;
              }

              const block = (blocks[NON_ATOMIC_KEY] = blocks[NON_ATOMIC_KEY] || {}) as Declarations;

              block[property] = value as StyleValue;
            }

            for (const rule in blocks) {
              if (rule === NON_ATOMIC_KEY) {
                classNames += ' ' + injectClassName(blocks[rule] as Declarations, media, pseudo);
              } else {
                classNames += inject(
                  blocks[rule] as Declarations | MediaIndex,
                  rule[0] === '@' ? rule.slice(7) : media,
                  rule[0] === ':' ? rule : pseudo,
                );
              }
            }

            return classNames;
          }
        : (style: Index | MediaIndex, media?: string, pseudo?: string) => {
            let classNames = '';
            const properties = Object.keys(style);
            const index = getIndex(cache, media, pseudo);

            for (let i = properties.length - 1; i >= 0; i--) {
              const property = properties[i];
              const value = style[property];

              // Pseudo
              if (property[0] === ':') {
                classNames += inject(value as Declarations, media, property);
                continue;
              }

              // Media
              if (property[0] === '@') {
                classNames += inject(value as MediaIndex, property.slice(7), pseudo);
                continue;
              }

              const declaration = { [property]: value as StyleValue };

              if (isPrimitive(value)) {
                // Only supports caching of primitive values
                const cachedValues = (index[property] = index[property] || {});

                if (value in cachedValues) {
                  classNames += ' ' + cachedValues[value];
                  continue;
                }

                const className = injectClassName(declaration, media, pseudo);

                if (className) {
                  cachedValues[value] = className;
                }

                classNames += ' ' + className;
                continue;
              }

              // Array
              classNames += ' ' + injectClassName(declaration, media, pseudo);
            }

            return classNames;
          };

    const reducer = (result: Index, style: TStyle) => resolve(style, result);

    this.injectStyle = (styles: TStyle | TStyle[]) => {
      const result = Array.isArray(styles)
        ? styles.length > 1 ? styles.reduceRight(reducer, {}) : resolve(styles[0] || {})
        : resolve(styles);

      const classNames = inject(result);

      if (process.env.NODE_ENV !== 'production') {
        validateMixingShorthandLonghand(result, classNames);
      }

      return classNames.slice(1);
    };
  }
}

function getIndex<TValue>(
  indexes: Index<TValue>,
  media: string | undefined,
  pseudo: string | undefined,
): Declarations<TValue> {
  let index = indexes as Index<TValue>;

  if (media) {
    index = (index[media] = index[media] || {}) as MediaIndex<TValue>;
  }

  if (pseudo) {
    return (index[pseudo] = index[pseudo] || {}) as Declarations<TValue>;
  } else {
    return index as Declarations<TValue>;
  }
}

function isPrimitive(value: any): value is string | number {
  return typeof value === 'string' || typeof value === 'number';
}
