import {
  CommonStyle,
  FontFace,
  Keyframes,
  ResolvedDeclarationList,
  ResolvedDeclarations,
  ResolvedValue,
  Style,
  Theme,
} from '@glitz/type';
import InjectorClient from '../client/InjectorClient';
import InjectorServer from '../server/InjectorServer';
import { Transformer } from '../types/options';
import { issueFormatter } from '../utils/debugging';
import { validateMixingShorthandLonghand } from '../utils/mixing-shorthand-longhand';
import { reverse } from '../utils/reverse';
import { ANIMATION_NAME, FONT_FAMILY } from './Injector';

type ResolvedStyle = { [key: string]: ResolvedValue | ResolvedDeclarations };

type Cache = { [key: string]: string | Cache };

const NON_ATOMIC_KEY = '$';
const MEDIA_IDENTIFIER = '@';
const PSEUDO_IDENTIFIER = ':';

export default class Base<TStyle extends Style> {
  public injectStyle: (styles: TStyle | TStyle[], theme?: Theme) => string;
  constructor(
    injector: (media?: string) => InjectorClient | InjectorServer,
    transformer: Transformer | undefined,
    atomic: boolean | undefined,
  ) {
    const resolve = (
      style: CommonStyle,
      theme: Theme | undefined,
      resolved: ResolvedStyle = {},
      media?: string,
      pseudo?: string,
    ) => {
      const properties = Object.keys(style);

      for (let i = properties.length; i > 0; i--) {
        let property = properties[i - 1];
        let value = style[property];

        if (typeof value === 'function') {
          value = value(theme);
        }

        // Treat null as undefined
        if (value === null) {
          value = void 0;
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
          const declarations = getIndex(resolved, media, pseudo);

          if (!(property in declarations)) {
            if (typeof value === 'object') {
              if (property === ANIMATION_NAME) {
                // Resolve `animationName` objects
                const keyframes = ([] as Keyframes[]).concat(value as Keyframes | Keyframes[]);
                const names: string[] = [];

                for (let j = 0; j < keyframes.length; j++) {
                  const keyframe = keyframes[j];
                  if (typeof keyframe === 'object') {
                    const list: ResolvedDeclarationList = {};
                    for (const identifier in keyframe) {
                      const block = reverse(resolve(keyframe[identifier], theme));
                      list[identifier] = transformer ? transformer(block) : block;
                    }

                    names[j] = injector().injectKeyframes(list);
                  }
                }

                value = names.length === 1 ? names[0] : names;
              }

              if (property === FONT_FAMILY) {
                // Resolve `fontFace` object
                const fonts = ([] as Array<string | FontFace>).concat(
                  value as string | FontFace | Array<string | FontFace>,
                );
                const names = [];

                for (const font of fonts) {
                  if (typeof font === 'object') {
                    const fontFace = reverse(resolve(font, theme));
                    const name = injector().injectFontFace(transformer ? transformer(fontFace) : fontFace);
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

            declarations[property] = value as ResolvedValue;
          }
          continue;
        }

        // Media or pseudo
        if (property[0] === MEDIA_IDENTIFIER || property[0] === PSEUDO_IDENTIFIER) {
          resolve(
            value,
            theme,
            resolved,
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
              resolved,
              media,
              pseudo,
            );
          }

          if (extension === 'x' || extension === 'xy') {
            alias = true;

            resolve(
              { [property + 'Left']: longhandValue, [property + 'Right']: longhandValue },
              theme,
              resolved,
              media,
              pseudo,
            );
          }

          if (!alias) {
            resolve(
              { [property + extension[0].toUpperCase() + extension.slice(1)]: longhandValue },
              theme,
              resolved,
              media,
              pseudo,
            );
          }
        }
      }

      return resolved;
    };

    const injectClassName = (
      declarations: ResolvedDeclarations,
      media: string | undefined,
      pseudo: string | undefined,
    ) => injector(media).injectClassName(transformer ? transformer(declarations) : declarations, pseudo);

    const cache: Cache = {};

    const inject =
      atomic === false
        ? // Non-atomic style
          (resolved: ResolvedStyle, media?: string, pseudo?: string) => {
            let classNames = '';
            const keys = Object.keys(resolved);
            const blocks: { [property: string]: ResolvedDeclarations } = {};

            for (let i = keys.length - 1; i >= 0; i--) {
              const key = keys[i];

              if (resolved[key] === void 0) {
                continue;
              }

              const object =
                key[0] === MEDIA_IDENTIFIER || key[0] === PSEUDO_IDENTIFIER
                  ? // Media or pseudo
                    blocks
                  : // Group declarations
                    (blocks[NON_ATOMIC_KEY] = blocks[NON_ATOMIC_KEY] || {});

              object[key] = resolved[key];
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
          (resolved: ResolvedStyle, media?: string, pseudo?: string) => {
            let classNames = '';
            const properties = Object.keys(resolved);
            const index = getIndex(cache, media, pseudo);

            for (let i = properties.length - 1; i >= 0; i--) {
              const property = properties[i];
              const value = resolved[property];

              if (value === void 0) {
                continue;
              }

              // Media or pseudo
              if (property[0] === MEDIA_IDENTIFIER || property[0] === PSEUDO_IDENTIFIER) {
                classNames += inject(
                  value as ResolvedDeclarations,
                  property[0] === MEDIA_IDENTIFIER ? property.slice(7) : media,
                  property[0] === PSEUDO_IDENTIFIER ? property : pseudo,
                );
                continue;
              }

              const declaration = { [property]: value } as ResolvedDeclarations;
              if (typeof value === 'string' || typeof value === 'number') {
                // Only supports caching of primitive values
                const cachedValues = (index[property] = index[property] || {}) as Cache;

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

    this.injectStyle = (styles, theme) => {
      const resolvedStyle: ResolvedStyle = {};

      if (Array.isArray(styles)) {
        for (let i = styles.length - 1; i >= 0; i--) {
          resolve(styles[i], theme, resolvedStyle);
        }
      } else {
        resolve(styles, theme, resolvedStyle);
      }

      const classNames = inject(resolvedStyle);

      if (process.env.NODE_ENV !== 'production') {
        validateMixingShorthandLonghand(resolvedStyle);
      }

      return classNames.slice(1);
    };
  }
}

function getIndex<TIndex extends any>(indexes: TIndex, media: string | undefined, pseudo: string | undefined): TIndex {
  let index = indexes;

  if (media) {
    index = index[media] = index[media] || ({} as TIndex);
  }

  if (pseudo) {
    return (index[pseudo] = index[pseudo] || ({} as TIndex));
  } else {
    return index;
  }
}
