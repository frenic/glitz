declare module 'inline-style-prefixer/static' {
  import { Properties } from '@glitz/type';
  const prefixAll: (style: Properties) => Properties;
  export = prefixAll;
}
