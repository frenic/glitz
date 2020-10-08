import { ResolvedDeclarations } from '@glitz/type';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { prefix } from 'inline-style-prefixer';

export default prefix as (style: ResolvedDeclarations) => ResolvedDeclarations;
