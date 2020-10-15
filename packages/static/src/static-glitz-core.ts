import { Style, Query } from './shared';

export function media(list: Query | string, style: Style): Style {
  return { [`@media ${typeof list === 'string' ? list : query(list)}`]: style };
}

export function query(list: Query): string {
  const results = Object.keys(list).map(feature => {
    const value = list[feature];
    return value === true ? `(${hyphenateProperty(feature)})` : `(${hyphenateProperty(feature)}: ${value})`;
  });

  return results.join(' and ');
}

// Accept both camel cased and capitalized vendor properties
const hyphenateRegex = /(?:^(ms|moz|webkit))|[A-Z]/g;

export function hyphenateProperty(property: string) {
  return property.replace(hyphenateRegex, '-$&').toLowerCase();
}
