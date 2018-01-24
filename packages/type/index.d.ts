import * as CSS from 'csstype';

export declare interface Rule extends Properties, PseudoRule {}

export declare interface Style extends Rule, KeyframesRule {}

export declare interface PropertiesList {
  [identifier: string]: Properties;
}

export declare type Properties = CSS.PropertiesFallback<string | number>;

export declare type PrimitiveValue = string | number;

export declare type PseudoRule = { [P in CSS.Pseudos]?: Properties | PseudoRule };

export declare type KeyframesRule = { '@keyframes'?: PropertiesList };
