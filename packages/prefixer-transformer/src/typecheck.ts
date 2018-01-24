// tslint:disable

import { Style } from '@glitz/type';
import prefixer from './prefixer';

const a: Style = {};
const b: Style = prefixer(a);

// Avoid unread variables type error
b;
