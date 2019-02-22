import { Style, StyleArray, StyleOrStyleArray } from '@glitz/type';
import * as React from 'react';
import { StyledElementLike } from './apply-class-name';

export interface StyledDecorator {
  <TProps>(component: StyledComponent<TProps>, style?: Style): StyledComponent<TProps>;
  <TProps extends StyledElementProps>(
    component: StyledElementLike<React.StatelessComponent<TProps>>,
    style?: Style,
  ): StyledComponent<TProps>;
  <TProps extends StyledElementProps, TInstance extends React.Component<TProps, React.ComponentState>>(
    component: StyledElementLike<React.ClassType<TProps, TInstance, React.ComponentClass<TProps>>>,
    style?: Style,
  ): StyledComponent<WithInnerRefProp<TProps, TInstance>>;
  <TProps extends StyledProps>(component: React.StatelessComponent<TProps>, style?: Style): StyledComponent<TProps>;
  <TProps extends StyledProps, TInstance extends React.Component<TProps, React.ComponentState>>(
    component: React.ClassType<TProps, TInstance, React.ComponentClass<TProps>>,
    style?: Style,
  ): StyledComponent<WithInnerRefProp<TProps, TInstance>>;
  (style: Style): StyledDecorator;
  (): StyleArray;
}

export type CSSProp = {
  css?: StyleOrStyleArray | StyledDecorator;
};

export type StyledProps = {
  compose: (style?: StyleOrStyleArray | StyledDecorator) => StyleOrStyleArray;
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
