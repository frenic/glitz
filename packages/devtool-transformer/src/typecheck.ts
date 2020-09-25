// tslint:disable

import { Properties } from '@glitz/type';
import devToolTransformer, { createDevToolTransformer } from './';

const a: Properties = {};
const b: Properties = devToolTransformer(a);
const c: Properties = createDevToolTransformer({ ignoreProperties: /foo/ })(a);
const d: Properties = createDevToolTransformer({ ignoreProperties: [/foo/] })(a);
const e: Properties = createDevToolTransformer({ ignoreProperties: 'foo' })(a);
const f: Properties = createDevToolTransformer({ ignoreProperties: ['foo'] })(a);

// Avoid unread variables type error
b;
c;
d;
e;
f;
