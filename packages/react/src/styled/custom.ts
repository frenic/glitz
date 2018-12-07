import { Style, StyleArray } from '@glitz/type';
import * as React from 'react';
import { StyledElementLike } from './apply-class-name';
import create from './create';
import { isType } from './internals';
import { StyledComponent, StyledElementProps, StyledProps, WithInnerRefProp } from './Super';

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
}

export function customStyled<TProps>(component: StyledComponent<TProps>, style?: Style): StyledComponent<TProps>;

export function customStyled<TProps extends StyledElementProps>(
  component: StyledElementLike<React.StatelessComponent<TProps>>,
  style?: Style,
): StyledComponent<TProps>;

export function customStyled<
  TProps extends StyledElementProps,
  TInstance extends React.Component<TProps, React.ComponentState>
>(
  component: StyledElementLike<React.ClassType<TProps, TInstance, React.ComponentClass<TProps>>>,
  style?: Style,
): StyledComponent<WithInnerRefProp<TProps, TInstance>>;

export function customStyled<TProps extends StyledProps>(
  component: React.StatelessComponent<TProps>,
  style?: Style,
): StyledComponent<TProps>;

export function customStyled<
  TProps extends StyledProps,
  TInstance extends React.Component<TProps, React.ComponentState>
>(
  component: React.ClassType<TProps, TInstance, React.ComponentClass<TProps>>,
  style?: Style,
): StyledComponent<WithInnerRefProp<TProps, TInstance>>;

// This overload prevents errors on `component` when `style` is incorrect
// and enables usage of generic parameter to provide prop type
export function customStyled<TProps>(
  // tslint:disable-next-line unified-signatures
  component:
    | StyledElementLike<React.ComponentType<TProps & StyledProps>>
    | StyledComponent<TProps>
    | React.ComponentType<TProps & StyledProps>,
  style?: Style,
): StyledComponent<TProps>;

export function customStyled(style: Style): StyledDecorator;

export function customStyled<TProps>(
  arg1: StyledElementLike<React.ComponentType<TProps>> | StyledComponent<TProps> | React.ComponentType<TProps> | Style,
  arg2?: Style,
): StyledComponent<TProps> | StyledDecorator {
  return isStyle(arg1) ? decorator([arg1]) : create<TProps>(arg1, arg2 ? [arg2] : []);
}

function decorator(preStyle: StyleArray): StyledDecorator {
  return (<TProps>(
    arg1:
      | StyledElementLike<React.ComponentType<TProps>>
      | StyledComponent<TProps>
      | React.ComponentType<TProps>
      | Style,
    arg2?: Style,
  ) =>
    isStyle(arg1)
      ? decorator(preStyle.concat(arg1))
      : create<TProps>(arg1, arg2 ? preStyle.concat(arg2) : preStyle)) as StyledDecorator;
}

function isStyle(arg: any): arg is Style {
  return typeof arg === 'object' && !isType(arg);
}
