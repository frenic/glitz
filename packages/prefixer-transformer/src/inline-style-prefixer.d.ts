declare module 'inline-style-prefixer/static' {
  import { Style } from '@glitz/core';
  const prefixAll: (style: Style) => Style;
  export = prefixAll;
}
