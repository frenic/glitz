import * as CSS from 'csstype';

export interface Style extends FeaturedProperties, PseudoMap {
  '@keyframes'?: PropertiesList;
}

export interface Properties extends CSS.PropertiesFallback {}

interface PropertiesList {
  [identifier: string]: Properties;
}

type FeaturedProperties = { [P in Diff<keyof Properties, 'animationName'>]?: Properties[P] } & {
  animationName?: PropertiesList | Properties['animationName'];
};

// Need this due to https://github.com/Microsoft/TypeScript/issues/13573
type PseudoMap = { [P in CSS.SimplePseudos]?: Style };

type Diff<T extends string, U extends string> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
