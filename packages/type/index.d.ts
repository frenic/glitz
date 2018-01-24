import * as CSS from 'csstype';

export declare interface Properties extends CSS.PropertiesFallback<string | number> { }

export declare type PseudoRule = {[P in CSS.Pseudos]?: Properties | PseudoRule };

export declare interface Rule extends Properties, PseudoRule { }

export declare interface PropertiesList {
  [identifier: string]: Properties;
}

export declare type KeyframesRule = { '@keyframes'?: PropertiesList };

export declare interface Style extends Rule, KeyframesRule { }

export declare type PrimitiveValue = string | number;
