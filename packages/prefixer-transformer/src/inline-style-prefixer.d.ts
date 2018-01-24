declare module 'inline-style-prefixer/static' {
  import { Style } from '@glitz/type';
  const prefixAll: (style: Style) => Style;
  export = prefixAll;
}
