import { FontFace, Style } from '@glitz/type';
import InjectorClient from '../client/InjectorClient';
import InjectorServer from '../server/InjectorServer';
import { Transformer } from '../types/options';

type DeclarationCache = { [cssProperty: string]: { [value: string]: string; [value: number]: string } };
type PseudoInMediaDeclarationCache = { [pseudoInMediaProperty: string]: DeclarationCache };
type MediaOrPseudoDeclarationCache = {
  [mediaOrPseudoProperty: string]: DeclarationCache | PseudoInMediaDeclarationCache;
};

export const DEFAULT_HYDRATE_CLASS_NAME = '__glitz__';

export default class Base<TStyle extends Style> {
  private inject: (style: TStyle) => string;
  constructor(injector: (media?: string) => InjectorClient | InjectorServer, transformer: Transformer | undefined) {
    const declarator = transformer
      ? (property: string, value: (string | number) | Array<string | number>) =>
          transformer(declaration(property, value))
      : declaration;

    const declarationCache: DeclarationCache | MediaOrPseudoDeclarationCache = {};

    const inject = (this.inject = (style: TStyle, media?: string, pseudo?: string) => {
      let classNames = '';

      for (const property in style) {
        classNames += ' ';

        const value = (style as any)[property];

        if (typeof value === 'string' || typeof value === 'number') {
          // Only supports caching of primitive values
          let cache = declarationCache as DeclarationCache;
          if (media && pseudo) {
            const pseudoCache = (declarationCache[media] =
              declarationCache[media] || {}) as PseudoInMediaDeclarationCache;
            cache = pseudoCache[pseudo] = pseudoCache[pseudo] || {};
          } else if (media) {
            cache = (declarationCache[media] = declarationCache[media] || {}) as DeclarationCache;
          } else if (pseudo) {
            cache = (declarationCache[pseudo] = declarationCache[pseudo] || {}) as DeclarationCache;
          }

          const cachedValues = (cache[property] = cache[property] || {});

          if (cachedValues[value]) {
            classNames += cachedValues[value];
            continue;
          }

          const className = injector(media).injectClassRule(declarator(property, value), pseudo);

          if (className) {
            cachedValues[value] = className;
          }

          classNames += className;
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
            classNames += inject(value, media, combinedPseudo);
            continue;
          }

          if (property.indexOf('@media') === 0) {
            const combinedMedia = (media ? `${media} and ` : '') + property.slice(7);
            classNames += inject(value, combinedMedia, pseudo);
            continue;
          }

          if (property === '@keyframes' || property === 'animationName') {
            const animationName = injector().injectKeyframesRule(value);
            if (animationName) {
              classNames += inject({ animationName } as TStyle, media, pseudo);
              continue;
            }
          }

          if (property === '@font-face' || property === 'fontFamily') {
            let fontFamily = '';
            const families: Array<string | FontFace> = Array.isArray(value) ? value : [value];
            for (const family of families) {
              if (fontFamily) {
                fontFamily += ',';
              }
              fontFamily += typeof family === 'string' ? family : injector().injectFontFaceRule(family);
            }
            if (fontFamily) {
              classNames += inject({ fontFamily } as TStyle, media, pseudo);
              continue;
            }
          }

          if (Array.isArray(value)) {
            classNames += injector(media).injectClassRule(declarator(property, value), pseudo);
            continue;
          }

          let isValid = true;
          const longhand: any = {};

          for (const extension in value) {
            const longhandValue = value[extension];

            if (
              typeof longhandValue === 'string' ||
              typeof longhandValue === 'number' ||
              Array.isArray(longhandValue)
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

              longhand[property + extension[0].toUpperCase() + extension.slice(1)] = longhandValue;
              continue;
            }

            if (process.env.NODE_ENV !== 'production') {
              console.error(
                "The shorthand object `%s` will be ignored and be the cause of the error below because property `%s.%s` wasn't a string, number or array of values, was `%o`",
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
            classNames += inject(longhand, media, pseudo);
            continue;
          }
        }

        if (process.env.NODE_ENV !== 'production') {
          console.error('The style property `%s` does not support the value `%o`', property, value);
        }
      }

      return classNames.slice(1);
    });
  }
  public injectStyle(style: TStyle) {
    return this.inject(style);
  }
}

function declaration(property: string, value: (string | number) | Array<string | number>) {
  return { [property]: value };
}
