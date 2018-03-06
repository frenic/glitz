import { Style } from '@glitz/type';
import { Query } from '../types/query';
import { hyphenateProperty } from '../utils/parse';

// Unfortunately we need this until there's a way to have index signatures for
// other types like: https://github.com/Microsoft/TypeScript/issues/7765.
// This is a work around that works thanks to dynamic properties.
export default function media(list: Query | string, style: Style): Style {
  return { [`@media ${typeof list === 'string' ? list : query(list)}`]: style };
}

export function query(list: Query): string {
  if (process.env.NODE_ENV !== 'production') {
    if (Object.keys(list).length === 0) {
      console.warn('The media query is empty and will therefor be ignored. Prefer not having empty media queries');
    }
  }

  let result = '';
  let feature: keyof Query;
  for (feature in list) {
    if (result) {
      result += ' and ';
    }
    const value = list[feature];
    result += value === true ? `(${hyphenateProperty(feature)})` : `(${hyphenateProperty(feature)}: ${value})`;
  }

  return result;
}
