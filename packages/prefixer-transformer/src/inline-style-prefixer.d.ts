declare module 'inline-style-prefixer/static' {
  import { Properties, UntransformedProperties } from '@glitz/type';
  const prefixAll: (style: UntransformedProperties) => Properties;
  export = prefixAll;
}
