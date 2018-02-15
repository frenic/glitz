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
    let isEmpty = true;
    for (const x in list) {
      isEmpty = false;
      // tslint:disable no-unused-expression
      x;
      break;
    }
    if (isEmpty) {
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
    result +=
      value === true
        ? `(${hyphenateProperty(feature)})`
        : `(${hyphenateProperty(feature)}: ${
            typeof value === 'string'
              ? value
              : // Convert number for the width and height features to `px`
                endsWith(feature, 'h') || endsWith(feature, 't')
                ? value + 'px'
                : // Convert number for the resolution feature to `px`
                  endsWith(feature, 'n')
                  ? value + 'dpi'
                  : // Other
                    value
          })`;
  }

  return result;
}

function endsWith(full: string, end: string) {
  return full.indexOf(end) === full.length - 1;
}
