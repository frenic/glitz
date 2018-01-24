import { Properties } from '@glitz/type';

export type Transformer = (style: Properties) => Properties;

export type Options = {
  transformer?: Transformer;
  mediaOrder?: (a: string, b: string) => number;
  prefix?: string;
};
