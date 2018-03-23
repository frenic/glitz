// tslint:disable

import { Properties } from '@glitz/type';
import devToolTransformer from './';

const a: Properties = {};
const b: Properties = devToolTransformer(a);

// Avoid unread variables type error
b;
