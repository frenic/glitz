// tslint:disable

import { Properties } from '@glitz/type';
import transformers from './';

const a: Properties = {};
const b: Properties = transformers({
  devToolOptions: { ignoreProperties: '' },
  numberToLengthOptions: { defaultUnit: 'rem' },
})(a);

// Avoid unread variables type error
b;
