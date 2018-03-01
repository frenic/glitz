import { FontFace, Properties, Style } from '@glitz/type';
import InjectorClient from '../client/InjectorClient';
import InjectorServer from '../server/InjectorServer';
import { Transformer } from '../types/options';
import { validateMixingShorthandLonghand } from '../utils/mixing-shorthand-longhand';

type Declarations<TValue = Properties[keyof Properties]> = { [property: string]: TValue };

type Rules<TValue = Properties[keyof Properties]> = {
  0: Declarations<TValue>;
  1: { [pseudo: string]: Declarations<TValue> };
  2: { [media: string]: Declarations<TValue> };
  3: { [media: string]: { [pseudo: string]: Declarations<TValue> } };
};

type CacheValue = {
  [value: string]: string;
};

export const DEFAULT_HYDRATE_CLASS_NAME = '__glitz__';
const ANIMATION_NAME = 'animationName';
const FONT_FAMILY = 'fontFamily';

export default class Base<TStyle extends Style> {
  public injectStyle: (styles: TStyle | TStyle[]) => string;
  constructor(
    injector: (media?: string) => InjectorClient | InjectorServer,
    transformer: Transformer | undefined,
    atomic: boolean | undefined,
  ) {
    const walk = (style: TStyle | Declarations, rules: Rules, media?: string, pseudo?: string) => {
      for (const property in style) {
        const value: any = style[property];

        if (typeof value === 'string' || typeof value === 'number') {
          const declarations = getIndex(rules, media, pseudo);
          if (!(property in declarations)) {
            declarations[property] = value;
          }
          continue;
        }

        if (typeof value === 'object') {
          if (process.env.NODE_ENV !== 'production') {
            let isEmpty = true;
            for (const x in value) {
              isEmpty = false;
              // tslint:disable-next-line no-unused-expression
              x;
              break;
            }
            if (isEmpty) {
              console.error(
                'The style property `%s` was an empty %s and should be removed because it can cause unexpected behavior',
                property,
                Array.isArray(value) ? 'array' : 'object',
              );
            }
          }

          // Pseudo
          if (property[0] === ':') {
            const combinedPseudo = (pseudo || '') + property;
            walk(value, rules, media, combinedPseudo);
            continue;
          }

          if (property.indexOf('@media') === 0) {
            const combinedMedia = (media ? `${media} and ` : '') + property.slice(7);
            walk(value, rules, combinedMedia, pseudo);
            continue;
          }

          if (property === '@keyframes' || property === ANIMATION_NAME) {
            const declarations = getIndex(rules, media, pseudo);
            if (ANIMATION_NAME in declarations) {
              continue;
            }
            const name = injector().injectKeyframesRule(value);
            declarations[ANIMATION_NAME] = name;
            continue;
          }

          if (property === '@font-face' || property === FONT_FAMILY) {
            const declarations = getIndex(rules, media, pseudo);
            if (FONT_FAMILY in declarations) {
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
            declarations[FONT_FAMILY] = names;
            continue;
          }

          if (Array.isArray(value)) {
            getIndex(rules, media, pseudo)[property] = value;
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
            walk(longhandDeclarations, rules, media, pseudo);
          }

          continue;
        }

        if (process.env.NODE_ENV !== 'production') {
          console.error('The style property `%s` does not support the value %O', property, value);
        }
      }

      return rules;
    };

    const declarator = (property: string, value: Properties[keyof Properties]) => {
      const declaration = { [property]: value };
      return transformer ? transformer(declaration) : declaration;
    };

    const cache: Rules<CacheValue> = createIndex();

    const inject =
      // Atomic as default
      atomic === false
        ? (declarations: Declarations, media?: string, pseudo?: string) => {
            return (
              ' ' + injector(media).injectClassRule(transformer ? transformer(declarations) : declarations, pseudo)
            );
          }
        : (declarations: Declarations, media?: string, pseudo?: string) => {
            let classNames = '';

            for (const property in declarations) {
              const value = declarations[property];

              if (typeof value === 'string' || typeof value === 'number') {
                // Only supports caching of primitive values
                const index = getIndex(cache, media, pseudo);
                const cachedValues = (index[property] = index[property] || {});

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

              if (Array.isArray(value)) {
                classNames += ' ' + injector(media).injectClassRule(declarator(property, value), pseudo);
                continue;
              }
            }

            return classNames;
          };

    this.injectStyle = (styles: TStyle | TStyle[]) => {
      const rules: Rules = createIndex();

      if (Array.isArray(styles)) {
        for (let i = styles.length; i >= 0; i--) {
          walk(styles[i], rules);
        }
      } else {
        walk(styles, rules);
      }

      let classNames = inject(rules[0]);
      for (const pseudo in rules[1]) {
        classNames += inject(rules[1][pseudo], undefined, pseudo);
      }
      for (const media in rules[2]) {
        classNames += inject(rules[2][media], media);
      }
      for (const media in rules[3]) {
        for (const pseudo in rules[3][media]) {
          classNames += inject(rules[3][media][pseudo], media, pseudo);
        }
      }

      if (process.env.NODE_ENV !== 'production') {
        validateMixingShorthandLonghand(rules, classNames);
      }

      return classNames.slice(1);
    };
  }
}

function createIndex<TValue>(): Rules<TValue> {
  return [{}, {}, {}, {}];
}

function getIndex<TValue>(
  rules: Rules<TValue>,
  media: string | undefined,
  pseudo: string | undefined,
): Declarations<TValue> {
  if (media && pseudo) {
    const pseudos = (rules[3][media] = rules[3][media] || {});
    return (pseudos[pseudo] = pseudos[pseudo] || {});
  } else if (media) {
    return (rules[2][media] = rules[2][media] || {});
  } else if (pseudo) {
    return (rules[1][pseudo] = rules[1][pseudo] || {});
  }
  return rules[0];
}
