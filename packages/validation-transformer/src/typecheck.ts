// tslint:disable

import { Properties } from '@glitz/type';
import clientValidationTransformer from './';

const a: Properties = {};
const b: Properties = clientValidationTransformer(a);

// Avoid unread variables type error
b;
