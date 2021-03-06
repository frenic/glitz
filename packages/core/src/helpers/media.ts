import { Style } from '../style';
import { Query } from '../query';
import { hyphenateProperty } from '../utils/parse';

// NOTE! A very similar implementation of this exists in packages/static/src/static-glitz-core.ts
// Changes here should be reflected in that file

// Unfortunately we need this until there's a way to have index signatures for
// other types like: https://github.com/Microsoft/TypeScript/issues/7765.
// This is a work around that works thanks to dynamic properties.
export default function media(list: Query | string, style: Style): Style {
  return { [`@media ${typeof list === 'string' ? list : query(list)}`]: style };
}

export function query(list: Query): string {
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
