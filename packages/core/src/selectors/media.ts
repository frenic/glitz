import { Query } from '../types/query';
import { hyphenateProperty } from '../utils/parse';

export default function media(query: Query | string, onlyList = false): string {
  let list = '';

  if (typeof query === 'string') {
    list = query;
  } else {
    if (process.env.NODE_ENV !== 'production') {
      let isEmpty = true;
      for (const x in query) {
        isEmpty = false;
        // tslint:disable no-unused-expression
        x;
        break;
      }
      if (isEmpty) {
        console.warn('The media query is empty and will therefor be ignored. Prefer not having empty media queries.');
      }
    }

    let feature: keyof Query;
    for (feature in query) {
      if (list) {
        list += ' and ';
      }
      const value = query[feature];
      list +=
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
  }

  return onlyList ? list : `@media ${list}`;
}

function endsWith(full: string, end: string) {
  return full.indexOf(end) === full.length - 1;
}
