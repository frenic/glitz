import * as CSS from 'csstype';

export declare interface Style extends Properties, PseudoMap {
  '@keyframes'?: PropertiesList;
  animationName?: PropertiesList | Properties['animationName'];
}

export declare interface Properties extends CSS.PropertiesFallback {}

export declare interface PropertiesList {
  [identifier: string]: Properties;
}

// Need this due to https://github.com/Microsoft/TypeScript/issues/13573
type PseudoMap = { [P in CSS.SimplePseudos]?: Style };
