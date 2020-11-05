import { ResolvedDeclarations } from '@glitz/core';
import transformers from '../..';

const a: ResolvedDeclarations = {};
const b: ResolvedDeclarations = transformers({
  devToolOptions: { ignoreProperties: '' },
  numberToLengthOptions: { defaultUnit: 'rem' },
})(a);

// Avoid unread variables type error
b;
