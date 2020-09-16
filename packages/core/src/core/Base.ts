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

export default class Base<TStyle extends Style> {
  public injectStyle: (styles: TStyle | TStyle[], theme?: Theme) => string;
  constructor(getInjector: (media?: string) => InjectorClient | InjectorServer, transformer: Transformer | undefined) {
    const primitiveValueCache: Cache = {};

    function createResolver(inject: true): Resolver<string>;

    function createResolver(inject: false): Resolver<ResolvedStyle>;

    function createResolver(inject: boolean) {
      const resolver: Resolver<string | ResolvedStyle> = (style, theme, index = {}, media, selector) => {
        let className = '';
        const properties = Object.keys(style);
        const cache = getIndex(primitiveValueCache, media, selector);

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
            const declarations = getIndex(index, media, selector);

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
                        const block = reverse(resolveStyle(keyframe[key] as CommonStyle, theme));
                        list[key] = transformer ? transformer(block) : block;
                      }

                      names[j] = getInjector().injectKeyframes(list);
                    }
                  }

                  value = names.length === 1 ? names[0] : names;
                }

                if (property === FONT_FAMILY) {
                  // Resolve `fontFace` object
                  const fonts = ([] as (string | FontFace)[]).concat(
                    value as string | FontFace | (string | FontFace)[],
                  );
                  const names = [];

                  for (const font of fonts) {
                    if (typeof font === 'object') {
                      const fontFace = reverse(resolveStyle(font as CommonStyle, theme));
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
                if (typeof value === 'string' || typeof value === 'number') {
                  // Only supports caching of primitive values
                  const cachedValues = (cache[property] = cache[property] || {}) as Cache;
                  if (value in cachedValues) {
                    className += ' ' + cachedValues[value];
                    continue;
                  }

                  className +=
                    ' ' +
                    (cachedValues[value] = getInjector(media).injectClassName(
                      transformer ? transformer(declaration) : declaration,
                      selector,
                    ));
                } else {
                  className +=
                    ' ' +
                    getInjector(media).injectClassName(transformer ? transformer(declaration) : declaration, selector);
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
              index,
              identifier === MEDIA_IDENTIFIER ? property.slice(7) : media,
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
                index,
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
                index,
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
                index,
                media,
                selector,
              );

              if (inject) {
                className += result as string;
              }
            }
          }
        }

        return inject ? className : index;
      };

      return resolver;
    }

    const resolveStyle = createResolver(false);
    const injectStyle = createResolver(true);

    this.injectStyle = (styles, theme = {}) => {
      styles = Array.isArray(styles) ? styles : [styles];
      const index: ResolvedStyle = {};
      let classNames = '';

      for (let i = styles.length - 1; i >= 0; i--) {
        classNames += injectStyle(styles[i] as CommonStyle, theme, index);
      }

      if (process.env.NODE_ENV !== 'production') {
        validateMixingShorthandLonghand(index);
      }

      return classNames.slice(1);
    };
  }
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
