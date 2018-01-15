import * as CSS from 'csstype';

export interface Rule extends Properties, PseudoRule {}

export interface Style extends Rule, KeyframesRule {}

export interface PropertiesList {
  [identifier: string]: Properties;
}

export type Properties = CSS.PropertiesFallback<string | number>;

export type PrimitiveValue = string | number;

export type PseudoRule = { [P in CSS.Pseudos]?: Properties | PseudoRule };

export type KeyframesRule = { '@keyframes'?: PropertiesList };
