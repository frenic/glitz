import { compose } from '@glitz/core';
import { createDevToolTransformer, Options as DevToolOptions } from '@glitz/devtool-transformer';
import { createNumberToLengthTransformer, Options as NumberToLengthOptions } from '@glitz/length-transformer';
import prefixer from '@glitz/prefixer-transformer';
// @ts-ignore
import { Properties, UntransformedProperties } from '@glitz/type';

export type Options = {
  numberToLengthOptions?: NumberToLengthOptions;
  devToolOptions?: DevToolOptions;
};

export default function transformers(options: Options = {}) {
  return compose(
    prefixer,
    createDevToolTransformer(options.devToolOptions),
    createNumberToLengthTransformer(options.numberToLengthOptions),
  );
}
