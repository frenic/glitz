import { ResolvedDeclarations } from './style';

export const DEFAULT_HYDRATION_IDENTIFIER = 'glitz';

export type Transformer = (declarations: ResolvedDeclarations) => ResolvedDeclarations;

export type Options = {
  identifier?: string;
  transformer?: Transformer;
  mediaOrder?: (a: string, b: string) => number;
  prefix?: string;
  classNameSkipList?: string[];
};
