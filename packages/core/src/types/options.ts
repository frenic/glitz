import { Properties, UntransformedProperties } from '@glitz/type';

export type Transformer = (declarations: UntransformedProperties) => Properties;

export type Options = {
  atomic?: boolean;
  transformer?: Transformer;
  mediaOrder?: (a: string, b: string) => number;
  prefix?: string;
};
