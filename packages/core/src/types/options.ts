import { Properties, UntransformedProperties} from '@glitz/type';

export const DEFAULT_HYDRATION_IDENTIFIER = 'glitz';

export type Transformer = (declarations: UntransformedProperties) => Properties;

export type Options = {
  identifier?: string,
  atomic?: boolean;
  transformer?: Transformer;
  mediaOrder?: (a: string, b: string) => number;
  prefix?: string;
};
