// tslint:disable

import { Properties } from '@glitz/type';
import prefixer from './';

const a: Properties = {};
const b: Properties = prefixer(a);

// Avoid unread variables type error
b;
