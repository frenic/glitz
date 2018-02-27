import { Properties } from '@glitz/type';

export type Transformer = (style: Properties) => Properties;

export type Options = {
  atomic?: boolean;
  transformer?: Transformer;
  mediaOrder?: (a: string, b: string) => number;
  prefix?: string;
};
