import { PrimitiveValue, Style } from '@glitz/type';
import InjectorClient from '../client/InjectorClient';
import InjectorServer from '../server/InjectorServer';
import { Transformer } from '../types/options';

type DeclarationCache = { [cssProperty: string]: { [value: string]: string; [value: number]: string } };
type PseudoInMediaDeclarationCache = { [pseudoInMediaProperty: string]: DeclarationCache };
type MediaOrPseudoDeclarationCache = {
  [mediaOrPseudoProperty: string]: DeclarationCache | PseudoInMediaDeclarationCache;
};

export const DEFAULT_HYDRATE_CLASS_NAME = '__glitz__';

export default class Base {
  private inject: (style: Style) => string;
  constructor(injector: (media?: string) => InjectorClient | InjectorServer, transformer: Transformer | undefined) {
    const declarator = transformer
      ? (property: string, value: PrimitiveValue | PrimitiveValue[]) => transformer(declaration(property, value))
      : declaration;

    const declarationCache: DeclarationCache | MediaOrPseudoDeclarationCache = {};

    const inject = (this.inject = (style: Style, media?: string, pseudo?: string) => {
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

          if (property === '@keyframes') {
            const name = injector().injectKeyframesRule(value);
            if (name) {
              classNames += inject({ animationName: name });
              continue;
            }
          }

          if (Array.isArray(value)) {
            classNames += injector(media).injectClassRule(declarator(property, value), pseudo);
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
  public injectStyle(style: Style) {
    return this.inject(style);
  }
}

function declaration(property: string, value: PrimitiveValue | PrimitiveValue[]) {
  return { [property]: value };
}
