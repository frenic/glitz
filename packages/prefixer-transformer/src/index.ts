import { Properties, UntransformedProperties } from '@glitz/type';
// @ts-ignore
import { prefix } from 'inline-style-prefixer';

export default prefix as (style: UntransformedProperties) => Properties;
