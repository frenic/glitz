// tslint:disable no-unused-expression

import { ResolvedDeclarations } from '@glitz/type';
import transformers from '../..';

const a: ResolvedDeclarations = {};
const b: ResolvedDeclarations = transformers({
  devToolOptions: { ignoreProperties: '' },
  numberToLengthOptions: { defaultUnit: 'rem' },
})(a);

// Avoid unread variables type error
b;
