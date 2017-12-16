import { Properties } from './style';

export type Transformer = (style: Properties) => Properties;

export type Options = {
  transformer?: Transformer;
  prefix?: string;
};
