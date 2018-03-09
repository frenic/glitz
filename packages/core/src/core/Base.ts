import { FontFace, PropertiesList, Style, UntransformedPropertiesList } from '@glitz/type';
import InjectorClient from '../client/InjectorClient';
import InjectorServer from '../server/InjectorServer';
import { Transformer } from '../types/options';
import { validateMixingShorthandLonghand } from '../utils/mixing-shorthand-longhand';
import { ANIMATION_NAME, FONT_FAMILY } from './Injector';

type StyleValue = Style[keyof Style] | Style;

type CacheValue = {
  [value: string]: string;
};

type Declarations<TValue = StyleValue> = { [property: string]: TValue };

interface Index<TValue = StyleValue> extends Declarations<TValue | Index<TValue>> {}

export const DEFAULT_HYDRATE_CLASS_NAME = '__glitz__';
const NON_ATOMIC_KEY = '$';
const MEDIA_IDENTIFIER = '@';
const PSEUDO_IDENTIFIER = ':';

export default class Base<TStyle extends Style> {
  public injectStyle: (styles: TStyle | TStyle[]) => string;
  constructor(
    injector: (media?: string) => InjectorClient | InjectorServer,
    transformer: Transformer | undefined,
    atomic: boolean | undefined,
  ) {
    const resolve = (style: Style, result: Index = {}, media?: string, pseudo?: string) => {
      const properties = Object.keys(style) as Array<keyof Style>;

      for (let i = properties.length - 1; i >= 0; i--) {
        let property = properties[i];
        let value = style[property];

        if (process.env.NODE_ENV !== 'production') {
          if (value === null || !(value === undefined || isPrimitive(value) || typeof value === 'object')) {
            console.error('The style property `%s` was has to be a string, number or object, was %O', property, value);
          }
          if (typeof value === 'object' && Object.keys(value).length === 0) {
            console.error(
              'The style property `%s` was an empty %s and should be removed because it can cause unexpected behavior',
              property,
              Array.isArray(value) ? 'array' : 'object',
            );
          }
        }

        if (property === '@keyframes') {
          property = ANIMATION_NAME;
        }

        if (property === '@font-face') {
          property = FONT_FAMILY;
        }

        if (
          value === undefined ||
          isPrimitive(value) ||
          Array.isArray(value) ||
          property === ANIMATION_NAME ||
          property === FONT_FAMILY
        ) {
          const declarations = getIndex(result, media, pseudo);

          if (!(property in declarations)) {
            if (typeof value === 'object') {
              if (property === ANIMATION_NAME) {
                if (transformer) {
                  const list: PropertiesList = {};
                  for (const identifier in value as UntransformedPropertiesList) {
                    list[identifier] = transformer((value as UntransformedPropertiesList)[identifier]);
                  }
                  value = list;
                }

                value = injector().injectKeyframes(value as PropertiesList);
              }

              if (property === FONT_FAMILY) {
                const families = ([] as Array<string | FontFace>).concat(value as
                  | string
                  | FontFace
                  | Array<string | FontFace>);
                let names = '';
                for (const family of families) {
                  if (names) {
                    names += ',';
                  }
                  names += isPrimitive(family) ? family : injector().injectFontFace(family);
                }
                value = names;
              }
            }

            declarations[property] = value;
          }
          continue;
        }

        // Media or pseudo
        if (property[0] === MEDIA_IDENTIFIER || property[0] === PSEUDO_IDENTIFIER) {
          resolve(
            value as Style,
            result,
            property[0] === MEDIA_IDENTIFIER ? property : media,
            property[0] === PSEUDO_IDENTIFIER ? (pseudo || '') + property : pseudo,
          );
          continue;
        }

        // Shorthand objects
        let isValid = true;
        const longhandDeclarations: Index = {};

        let extension: keyof Index;
        for (extension in value) {
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

          const longhandValue = (value as Index)[extension];

          if (
            longhandValue === undefined ||
            isPrimitive(longhandValue) ||
            Array.isArray(longhandValue) ||
            // Objects are only valid for `animation.name` and `font.family`
            (property === 'animation' && extension === 'name') ||
            (property === 'font' && extension === 'family')
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
            console.error('The style property `%s` does not support the value %O', property, value);
          }

          isValid = false;
          break;
        }

        if (isValid) {
          resolve(longhandDeclarations, result, media, pseudo);
        }
      }

      return result;
    };

    const injectClassName = (declarations: Declarations, media: string | undefined, pseudo: string | undefined) =>
      injector(media).injectClassName(transformer ? transformer(declarations) : declarations, pseudo);

    const cache: Index<CacheValue> = {};

    const inject =
      atomic === false
        ? // Non-atomic style
          (style: Index, media?: string, pseudo?: string) => {
            let classNames = '';
            const keys = Object.keys(style);
            const blocks: { [property: string]: Index } = {};

            for (let i = keys.length - 1; i >= 0; i--) {
              const key = keys[i];

              if (style[key] === undefined) {
                continue;
              }

              const object =
                key[0] === MEDIA_IDENTIFIER || key[0] === PSEUDO_IDENTIFIER
                  ? // Media or pseudo
                    blocks
                  : // Group declarations
                    (blocks[NON_ATOMIC_KEY] = blocks[NON_ATOMIC_KEY] || {});

              object[key] = style[key];
            }

            for (const rule in blocks) {
              if (rule === NON_ATOMIC_KEY) {
                classNames += ' ' + injectClassName(blocks[rule], media, pseudo);
              } else {
                classNames += inject(
                  blocks[rule],
                  rule[0] === MEDIA_IDENTIFIER ? rule.slice(7) : media,
                  rule[0] === PSEUDO_IDENTIFIER ? rule : pseudo,
                );
              }
            }

            return classNames;
          }
        : // Atomic style
          (style: Index, media?: string, pseudo?: string) => {
            let classNames = '';
            const properties = Object.keys(style);
            const index = getIndex(cache, media, pseudo);

            for (let i = properties.length - 1; i >= 0; i--) {
              const property = properties[i];
              const value = style[property];

              if (value === undefined) {
                continue;
              }

              // Media or pseudo
              if (property[0] === MEDIA_IDENTIFIER || property[0] === PSEUDO_IDENTIFIER) {
                classNames += inject(
                  value as Index,
                  property[0] === MEDIA_IDENTIFIER ? property.slice(7) : media,
                  property[0] === PSEUDO_IDENTIFIER ? property : pseudo,
                );
                continue;
              }

              const declaration = { [property]: value };

              if (isPrimitive(value)) {
                // Only supports caching of primitive values
                const cachedValues = (index[property] = index[property] || {});

                if (value in cachedValues) {
                  classNames += ' ' + cachedValues[value];
                  continue;
                }

                const className = injectClassName(declaration, media, pseudo);
                classNames += ' ' + (cachedValues[value] = className);

                continue;
              }

              // Array
              classNames += ' ' + injectClassName(declaration, media, pseudo);
            }

            return classNames;
          };

    this.injectStyle = (styles: TStyle | TStyle[]) => {
      const result: Index = {};

      if (Array.isArray(styles)) {
        for (let i = styles.length - 1; i >= 0; i--) {
          resolve(styles[i], result);
        }
      } else {
        resolve(styles, result);
      }

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
  let index: Index<TValue> = indexes;

  if (media) {
    index = (index[media] = index[media] || {}) as Index<TValue>;
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
