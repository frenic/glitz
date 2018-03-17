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
          if (value === null || ['undefined', 'string', 'number', 'object'].indexOf(typeof value) === -1) {
            console.error(
              'The style value %O of property `%s` has to be a string, number, plain object or array',
              value,
              property,
            );
          } else if ((typeof value === 'object' && Object.keys(value).length === 0) || String(value).trim() === '') {
            console.error(
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
            if (property === ANIMATION_NAME && typeof value === 'object' && !Array.isArray(value)) {
              // Resolve `animationName` objects
              const list = value as PropertiesList;
              if (transformer) {
                for (const identifier in value) {
                  list[identifier] = transformer((value as UntransformedPropertiesList)[identifier]);
                }
              }

              value = injector().injectKeyframes(list);
            }

            if (property === FONT_FAMILY && typeof value === 'object') {
              // Resolve `fontFace` object
              const families = ([] as Array<string | FontFace>).concat(value as
                | string
                | FontFace
                | Array<string | FontFace>);
              let names = '';
              for (const family of families) {
                if (names) {
                  names += ',';
                }
                names += typeof family === 'object' ? injector().injectFontFace(family) : family;
              }

              value = names;
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
        const longhandDeclarations: Index = {};
        let extension: keyof Index;

        for (extension in value) {
          const longhandValue = (value as Index)[extension];

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

          longhandDeclarations[property + extension[0].toUpperCase() + extension.slice(1)] = longhandValue;
        }

        resolve(longhandDeclarations, result, media, pseudo);
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

              if (typeof value === 'string' || typeof value === 'number') {
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
