import { ResolvedDeclarations } from '@glitz/core';
import prefixer from '../..';

const a: ResolvedDeclarations = {};
const b: ResolvedDeclarations = prefixer(a);

// Avoid unread variables type error
b;
