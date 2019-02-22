import { Style, StyleArray } from '@glitz/type';
import * as React from 'react';
import { StyledElementLike } from './apply-class-name';
import create from './create';
import { isType } from './internals';
import { StyledComponent, StyledDecorator, StyledElementProps, StyledProps, WithInnerRefProp } from './Super';

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

export function customStyled(style: Style): StyledDecorator;

// This overload prevents errors on `component` when `style` is incorrect
// and enables usage of generic parameter to provide prop type
export function customStyled(
  // tslint:disable-next-line unified-signatures
  component:
    | StyledElementLike<React.ComponentType<StyledElementProps>>
    | StyledComponent<any>
    | React.ComponentType<StyledProps>,
  style?: Style,
): StyledComponent<any>;

export function customStyled<TProps>(
  arg1: StyledElementLike<React.ComponentType<TProps>> | StyledComponent<TProps> | React.ComponentType<TProps> | Style,
  arg2?: Style,
): StyledComponent<TProps> | StyledDecorator {
  return isStyle(arg1) ? decorator([arg1]) : create<TProps>(arg1, arg2 ? [arg2] : []);
}

function decorator(preStyle: StyleArray): StyledDecorator {
  return (<TProps>(
    arg1?:
      | StyledElementLike<React.ComponentType<TProps>>
      | StyledComponent<TProps>
      | React.ComponentType<TProps>
      | Style,
    arg2?: Style,
  ) => {
    if (arg1) {
      return isStyle(arg1)
        ? decorator(preStyle.concat(arg1))
        : create<TProps>(arg1, arg2 ? preStyle.concat(arg2) : preStyle);
    }

    return preStyle;
  }) as StyledDecorator;
}

function isStyle(arg: any): arg is Style {
  return typeof arg === 'object' && !isType(arg);
}
