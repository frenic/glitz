import { StyleArray, StyleOrStyleArray } from '@glitz/type';
import * as React from 'react';

export type CSSProp = {
  css?: StyleOrStyleArray;
};

export type StyledProps = {
  compose: (style?: StyleOrStyleArray) => StyleOrStyleArray;
};

export type StyledElementProps = {
  className?: string;
};

export type ExternalProps<TProps> = Pick<TProps, Exclude<keyof TProps, keyof StyledProps>> & CSSProp;

export interface StyledComponent<TProps> extends React.ComponentClass<ExternalProps<TProps>> {
  compose(style?: StyleArray): StyledComponent<TProps>;
}

// The empty class helps us identify when it's a styled component in `isStyledComponent`
export default class StyledSuper<TProps> extends React.Component<ExternalProps<TProps>> {}

export type InnerRefProp<TInstance> = {
  innerRef?: React.Ref<TInstance>;
};

export type WithInnerRefProp<TProps, TInstance> = TProps & InnerRefProp<TInstance>;

export function isStyledComponent<TProps>(type: any): type is StyledComponent<TProps> {
  return typeof type === 'function' && type.prototype instanceof StyledSuper;
}
