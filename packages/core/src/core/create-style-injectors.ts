import {
  CommonStyle,
  FontFace,
  Globals,
  Keyframes,
  ResolvedDeclarationList,
  ResolvedDeclarations,
  ResolvedValue,
  Style,
  Theme,
} from '../style';
import InjectorClient from '../client/InjectorClient';
import InjectorServer from '../server/InjectorServer';
import { Transformer } from '../options';
import { issueFormatter } from '../utils/debugging';
import { ANIMATION_NAME, FONT_FAMILY } from './Injector';
import { combineMediaQueries } from '../utils/format';

type ResolvedStyle = { [key: string]: ResolvedValue | ResolvedDeclarations };

type Resolver<TReturn> = (
  style: CommonStyle,
  theme: Theme,
  resolved?: ResolvedStyle,
  media?: string,
  selector?: string,
) => TReturn;

type Cache = { [key: string]: string | Cache };

const MEDIA_IDENTIFIER = '@'.charCodeAt(0);
const PSEUDO_IDENTIFIER = ':'.charCodeAt(0);
const ATTRIBUTE_IDENTIFIER = '['.charCodeAt(0);

export interface Base<TStyle extends Style> {
  injectStyle: (styles: TStyle | readonly TStyle[], theme?: Theme) => string;
  injectGlobals: (styles: Globals, theme?: Theme) => void;
}

export function createStyleInjectors<TStyle extends Style>(
  getInjector: (media?: string) => InjectorClient | InjectorServer,
  transformer: Transformer | undefined,
) {
  const cache: Cache = {};
  const createResolver: {
    (inject: true): Resolver<string>;
    (inject: false): Resolver<ResolvedStyle>;
  } = (inject: boolean) => {
    const resolver: Resolver<string | ResolvedStyle> = (style, theme, styleIndex = {}, media, selector) => {
      let className = '';
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
            if (selector) {
              object = { [selector]: object };
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
          typeof value !== 'object' ||
          Array.isArray(value)
        ) {
          const declarations = getIndex(styleIndex, media, selector);

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
                    for (const key in keyframe) {
                      const block = resolveStyle(keyframe[key] as CommonStyle, theme) as ResolvedDeclarations;
                      list[key] = transformer ? transformer(block) : block;
                    }

                    names[j] = getInjector().injectKeyframes(list);
                  }
                }

                value = names.length === 1 ? names[0] : names;
              }

              if (property === FONT_FAMILY) {
                // Resolve `fontFace` object
                const fonts = ([] as (string | FontFace)[]).concat(value as string | FontFace | (string | FontFace)[]);
                const names = [];

                for (const font of fonts) {
                  if (typeof font === 'object') {
                    const fontFace = resolveStyle(font as CommonStyle, theme) as ResolvedDeclarations;
                    const name = getInjector().injectFontFace(transformer ? transformer(fontFace) : fontFace);
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

            const declaration: ResolvedDeclarations = {};
            declarations[property] = declaration[property] = value as ResolvedValue;

            if (typeof value !== 'undefined' && inject) {
              const query = media && media.slice(7);

              if (typeof value === 'string' || typeof value === 'number') {
                // Only supports caching of primitive values
                const cacheIndex = getIndex(cache, media, selector);
                const cachedValues = (cacheIndex[property] = cacheIndex[property] || {}) as Cache;
                if (value in cachedValues) {
                  className += ' ' + cachedValues[value];
                  continue;
                }

                className +=
                  ' ' +
                  (cachedValues[value] = getInjector(query).injectClassName(
                    transformer ? transformer(declaration) : declaration,
                    selector,
                  ));
              } else {
                className +=
                  ' ' +
                  getInjector(query).injectClassName(transformer ? transformer(declaration) : declaration, selector);
              }
            }
          }
          continue;
        }

        const identifier = property.charCodeAt(0);

        // Media or pseudo/attribute selector
        if (
          identifier === MEDIA_IDENTIFIER ||
          identifier === PSEUDO_IDENTIFIER ||
          identifier === ATTRIBUTE_IDENTIFIER
        ) {
          const result = resolver(
            value,
            theme,
            styleIndex,
            identifier === MEDIA_IDENTIFIER
              ? media
                ? combineMediaQueries(media, property.slice(7))
                : property
              : media,
            identifier === PSEUDO_IDENTIFIER || identifier === ATTRIBUTE_IDENTIFIER
              ? (selector ?? '') + property
              : selector,
          );

          if (inject) {
            className += result as string;
          }
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
            const result = resolver(
              { [property + 'Top']: longhandValue, [property + 'Bottom']: longhandValue },
              theme,
              styleIndex,
              media,
              selector,
            );

            if (inject) {
              className += result as string;
            }
          }

          if (extension === 'x' || extension === 'xy') {
            alias = true;

            const result = resolver(
              { [property + 'Left']: longhandValue, [property + 'Right']: longhandValue },
              theme,
              styleIndex,
              media,
              selector,
            );

            if (inject) {
              className += result as string;
            }
          }

          if (!alias) {
            const result = resolver(
              { [property + extension[0].toUpperCase() + extension.slice(1)]: longhandValue },
              theme,
              styleIndex,
              media,
              selector,
            );

            if (inject) {
              className += result as string;
            }
          }
        }
      }

      return inject ? className : styleIndex;
    };

    return resolver as any;
  };

  const resolveStyle = createResolver(false);
  const injectStyle = createResolver(true);

  function injectGlobals(selector: string, result: ResolvedStyle, media?: string) {
    const properties = Object.keys(result);
    const declarations: ResolvedDeclarations = {};
    let hasDeclarations = false;

    for (let i = properties.length - 1; i >= 0; i--) {
      const property = properties[i];
      const identifier = property.charCodeAt(0);
      if (identifier !== MEDIA_IDENTIFIER && identifier !== PSEUDO_IDENTIFIER && identifier !== ATTRIBUTE_IDENTIFIER) {
        declarations[property] = result[property] as ResolvedValue;
        hasDeclarations = true;
      }
    }

    if (hasDeclarations) {
      getInjector(media).injectGlobals(transformer ? transformer(declarations) : declarations, selector);
    }

    for (let i = properties.length - 1; i >= 0; i--) {
      const property = properties[i];
      const identifier = property.charCodeAt(0);
      if (identifier === MEDIA_IDENTIFIER) {
        injectGlobals(selector, result[property] as ResolvedStyle, property.slice(7));
      } else if (identifier === PSEUDO_IDENTIFIER || identifier === ATTRIBUTE_IDENTIFIER) {
        injectGlobals(selector + property, result[property] as ResolvedStyle, media);
      }
    }
  }

  return [
    (styles: TStyle | readonly TStyle[], theme: Theme = {}) => {
      styles = Array.isArray(styles) ? styles : [styles];
      const index: ResolvedStyle = {};
      let classNames = '';

      for (let i = styles.length - 1; i >= 0; i--) {
        classNames += injectStyle(styles[i] as unknown as CommonStyle, theme, index);
      }

      return classNames.slice(1);
    },
    (styles: Globals, theme: Theme = {}) => {
      for (const property in styles) {
        injectGlobals(property, resolveStyle(styles[property] as CommonStyle, theme));
      }
    },
  ] as const;
}

function getIndex<TIndex extends { [key: string]: any }>(
  indexes: TIndex,
  media: string | undefined,
  selector: string | undefined,
): TIndex {
  let index: TIndex = indexes;

  if (media) {
    index = (index[media] as TIndex) = index[media] || ({} as TIndex);
  }

  if (selector) {
    return ((index[selector] as TIndex) = index[selector] || ({} as TIndex));
  } else {
    return index;
  }
}
