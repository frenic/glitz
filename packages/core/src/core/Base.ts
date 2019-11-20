import { FontFace, PropertiesList, Style, StyleOrStyleArray, Theme } from '@glitz/type';
import InjectorClient from '../client/InjectorClient';
import InjectorServer from '../server/InjectorServer';
import { Transformer } from '../types/options';
import { issueFormatter } from '../utils/debugging';
import { validateMixingShorthandLonghand } from '../utils/mixing-shorthand-longhand';
import { reverse } from '../utils/reverse';
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
          const issueTransformer = (object: any) => {
            if (pseudo) {
              object = { [pseudo]: object };
            }

            if (media) {
              object = { [media]: object };
            }

            return object;
          };

          if (['undefined', 'string', 'number', 'object'].indexOf(typeof value) === -1) {
            console.error(
              ...issueFormatter(
                `Value from property \`${property}\` has to be a string, number, plain object or array in:`,
                style,
                { [property]: value },
                null,
                issueTransformer,
              ),
            );
          }
          if (value === '') {
            console.error(
              ...issueFormatter(
                `Value from property \`${property}\` is an empty string and may cause some unexpected behavior in:`,
                style,
                { [property]: value },
                null,
                issueTransformer,
              ),
            );
          }
          if (typeof value === 'number' && Number.isNaN(value)) {
            console.error(
              ...issueFormatter(
                `Value from property \`${property}\` is a NaN and may cause some unexpected behavior in:`,
                style,
                { [property]: value },
                null,
                issueTransformer,
              ),
            );
          }
          if (typeof value === 'number' && !Number.isFinite(value)) {
            console.error(
              ...issueFormatter(
                `Value from property \`${property}\` is an infinite number and may cause some unexpected behavior in:`,
                style,
                { [property]: value },
                null,
                issueTransformer,
              ),
            );
          }
          if (typeof value === 'object' && Object.keys(value).length === 0) {
            console.warn(
              ...issueFormatter(
                `Value from property \`${property}\` is an empty object and can be removed in:`,
                style,
                { [property]: value },
                null,
                issueTransformer,
              ),
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
                const fonts = ([] as any[]).concat(value);
                const names = [];

                for (const font of fonts) {
                  if (typeof font === 'object') {
                    const fontFace = reverse(resolve(font, theme));
                    const name = injector().injectFontFace(
                      (transformer ? transformer(fontFace) : fontFace) as FontFace,
                    );
                    if (names.indexOf(name) === -1) {
                      names.push(name);
                    }
                  } else {
                    names.push(font);
                  }
                }

                value = names.join(',');
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

        const extensions = Object.keys(value);

        for (let j = extensions.length; j > 0; j--) {
          const extension = extensions[j - 1];
          const longhandValue = value[extension];

          let alias = false;

          if (extension === 'y' || extension === 'xy') {
            alias = true;

            // Make sure to resolve plain object directly otherwise combinations
            // of `xy` extension alias with `y` or `x` will conflict
            resolve(
              { [property + 'Top']: longhandValue, [property + 'Bottom']: longhandValue },
              theme,
              result,
              media,
              pseudo,
            );
          }

          if (extension === 'x' || extension === 'xy') {
            alias = true;

            resolve(
              { [property + 'Left']: longhandValue, [property + 'Right']: longhandValue },
              theme,
              result,
              media,
              pseudo,
            );
          }

          if (!alias) {
            resolve(
              { [property + extension[0].toUpperCase() + extension.slice(1)]: longhandValue },
              theme,
              result,
              media,
              pseudo,
            );
          }
        }
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
        validateMixingShorthandLonghand(result);
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
