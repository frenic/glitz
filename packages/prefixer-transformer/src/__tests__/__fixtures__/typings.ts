import { ResolvedDeclarations } from '@glitz/type';
import prefixer from '../..';

const a: ResolvedDeclarations = {};
const b: ResolvedDeclarations = prefixer(a);

// Avoid unread variables type error
b;
