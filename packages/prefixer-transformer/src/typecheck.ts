// tslint:disable

import { Properties, UntransformedProperties } from '@glitz/type';
import prefixer from './';

const a: UntransformedProperties = {};
const b: Properties = prefixer(a);

// Avoid unread variables type error
b;
