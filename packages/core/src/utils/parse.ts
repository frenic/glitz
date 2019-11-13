import { Declarations } from '@glitz/type';

export function parseDeclarationBlock(declarations: Declarations) {
  let block = '';
  let property: string;
  for (property in declarations) {
    const value = declarations[property];
    if (typeof value === 'object') {
      for (const fallback of value) {
        if (block) {
          block += ';';
        }
        block += parseDeclaration(property, fallback);
      }
    } else {
      if (block) {
        block += ';';
      }
      block += parseDeclaration(property, value);
    }
  }
  return block;
}

export function parseDeclaration(property: string, value?: string | number) {
  return `${hyphenateProperty(property)}:${value}`;
}

// Accept both camel cased and capitalized vendor properties
const hyphenateRegex = /(?:^(ms|moz|webkit))|[A-Z]/g;
const propertyCache: { [property: string]: string } = {};

export function hyphenateProperty(property: string) {
  return property in propertyCache
    ? propertyCache[property]
    : (propertyCache[property] = property.replace(hyphenateRegex, '-$&').toLowerCase());
}
