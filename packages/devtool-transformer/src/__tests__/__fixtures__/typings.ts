import { ResolvedDeclarations } from '@glitz/core';
import devToolTransformer, { createDevToolTransformer } from '../..';

const a: ResolvedDeclarations = {};
const b: ResolvedDeclarations = devToolTransformer(a);
const c: ResolvedDeclarations = createDevToolTransformer({ ignoreProperties: /foo/ })(a);
const d: ResolvedDeclarations = createDevToolTransformer({ ignoreProperties: [/foo/] })(a);
const e: ResolvedDeclarations = createDevToolTransformer({ ignoreProperties: 'foo' })(a);
const f: ResolvedDeclarations = createDevToolTransformer({ ignoreProperties: ['foo'] })(a);

// Avoid unread variables type error
b;
c;
d;
e;
f;
