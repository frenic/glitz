import { FontFace, PropertiesList, Style, StyleOrStyleArray, Theme } from '@glitz/type';
import InjectorClient from '../client/InjectorClient';
import InjectorServer from '../server/InjectorServer';
import { Transformer } from '../types/options';
import { validateMixingShorthandLonghand } from '../utils/mixing-shorthand-longhand';
import { ANIMATION_NAME, FONT_FAMILY } from './Injector';

type Declarations<TValue = string | number | Array<string | number>> = { [property: string]: TValue };

interface Index<TValue = string | number | Array<string | number>> extends Declarations<TValue | Index<TValue>> {}

const NON_ATOMIC_KEY = '$';
const MEDIA_IDENTIFIER = '@';
const PSEUDO_IDENTIFIER = ':';

export default class Base<TStyle extends Style> {
  public injectStyle: (styles: StyleOrStyleArray<TStyle>, theme?: Theme) => string;
  constructor(
    injector: (media?: string) => InjectorClient | InjectorServer,
    transformer: Transformer | undefined,
    atomic: boolean | undefined,
  ) {
    const resolve = (style: any, theme: Theme | undefined, result: Index = {}, media?: string, pseudo?: string) => {
      const properties = Object.keys(style);

      for (let i = properties.length; i > 0; i--) {
        let property = properties[i - 1];
        let value = style[property];

        if (typeof value === 'function') {
          value = value(theme);
        }

        // Treat null as undefined
        if (value === null) {
          value = undefined;
        }

        if (process.env.NODE_ENV !== 'production') {
          if (['undefined', 'string', 'number', 'object'].indexOf(typeof value) === -1) {
            console.error(
              'The style value %O of property `%s` has to be a string, number, plain object or array',
              value,
              property,
            );
          } else if ((typeof value === 'object' && Object.keys(value).length === 0) || String(value).trim() === '') {
            console.warn(
              'The style property `%s` in %O was an empty %s and should be removed because it can cause unexpected behavior',
              property,
              style,
              Array.isArray(value) ? 'array' : typeof value,
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
          property === ANIMATION_NAME ||
          property === FONT_FAMILY ||
          // String, number or undefined
          typeof value !== 'object' ||
          Array.isArray(value)
        ) {
          const declarations = getIndex(result, media, pseudo);

          if (!(property in declarations)) {
            if (typeof value === 'object') {
              if (property === ANIMATION_NAME) {
                // Resolve `animationName` objects
                const animations = ([] as any[]).concat(value);

                for (let j = 0; j < animations.length; j++) {
                  if (typeof animations[j] === 'object') {
                    const list: PropertiesList = {};
                    for (const identifier in animations[j]) {
                      const block = reverse(resolve(value[identifier], theme));
                      list[identifier] = transformer ? transformer(block) : block;
                    }

                    animations[j] = injector().injectKeyframes(list);
                  }
                }

                value = animations.length === 1 ? animations[0] : animations;
              }

              if (property === FONT_FAMILY) {
                // Resolve `fontFace` object
                const families = ([] as any[]).concat(value);

                let names = '';
                for (const family of families) {
                  if (names) {
                    names += ',';
                  }
                  if (typeof family === 'object') {
                    const fontFace = reverse(resolve(family, theme));
                    names += injector().injectFontFace((transformer ? transformer(fontFace) : fontFace) as FontFace);
                  } else {
                    names += family;
                  }
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
            value,
            theme,
            result,
            property[0] === MEDIA_IDENTIFIER ? property : media,
            property[0] === PSEUDO_IDENTIFIER ? (pseudo || '') + property : pseudo,
          );
          continue;
        }

        // Shorthand objects
        const longhandDeclarations: any = {};

        for (const extension in value) {
          const longhandValue = value[extension];
          let alias = false;

          if (extension === 'x' || extension === 'xy') {
            alias = true;
            longhandDeclarations[property + 'Left'] = longhandValue;
            longhandDeclarations[property + 'Right'] = longhandValue;
          }

          if (extension === 'y' || extension === 'xy') {
            alias = true;
            longhandDeclarations[property + 'Top'] = longhandValue;
            longhandDeclarations[property + 'Bottom'] = longhandValue;
          }

          if (!alias) {
            longhandDeclarations[property + extension[0].toUpperCase() + extension.slice(1)] = longhandValue;
          }
        }

        resolve(longhandDeclarations, theme, result, media, pseudo);
      }

      return result;
    };

    const injectClassName = (declarations: Declarations, media: string | undefined, pseudo: string | undefined) =>
      injector(media).injectClassName(transformer ? transformer(declarations) : declarations, pseudo);

    const cache: Index<{
      [value: string]: string;
    }> = {};

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
                classNames += ' ' + injectClassName(blocks[rule] as Declarations, media, pseudo);
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
          (result: Index, media?: string, pseudo?: string) => {
            let classNames = '';
            const properties = Object.keys(result);
            const index = getIndex(cache, media, pseudo);

            for (let i = properties.length - 1; i >= 0; i--) {
              const property = properties[i];
              const value = result[property];

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

              if (typeof value === 'string' || typeof value === 'number') {
                // Only supports caching of primitive values
                const cachedValues = (index[property] = index[property] || {});

                if (value in cachedValues) {
                  classNames += ' ' + cachedValues[value];
                  continue;
                }

                const className = injectClassName(declaration as Declarations, media, pseudo);
                classNames += ' ' + (cachedValues[value] = className);

                continue;
              }

              // Array
              classNames += ' ' + injectClassName(declaration as Declarations, media, pseudo);
            }

            return classNames;
          };

    this.injectStyle = (styles, theme) => {
      const result: Index = {};

      if (Array.isArray(styles)) {
        for (let i = styles.length - 1; i >= 0; i--) {
          resolve(styles[i], theme, result);
        }
      } else {
        resolve(styles, theme, result);
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

function reverse(object: any) {
  const reversed: any = {};
  const properties = Object.keys(object);
  for (let i = properties.length; i > 0; i--) {
    reversed[properties[i - 1]] = object[properties[i - 1]];
  }
  return reversed;
}
