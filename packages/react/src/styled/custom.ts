import { Style } from '@glitz/type';
import * as React from 'react';
import { StyledElementLike } from './apply-class-name';
import create from './create';
import decorator, { StyledDecorator } from './decorator';
import { isType } from './predefined';
import { StyledComponent, StyledComponentWithRef, StyledElementProps, StyledProps } from './types';

export function customStyled<TProps, TInstance>(
  component: StyledComponentWithRef<TProps, TInstance>,
  style?: Style,
): StyledComponentWithRef<TProps, TInstance>;
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
): StyledComponentWithRef<TProps, TInstance>;

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
): StyledComponentWithRef<TProps, TInstance>;

export function customStyled(style: Style): StyledDecorator;

// This overload prevents errors on `component` when `style` is incorrect
// and enables usage of generic parameter to provide prop type
export function customStyled(
  // tslint:disable-next-line unified-signatures
  component:
    | StyledElementLike<React.ComponentType<StyledElementProps>>
    | StyledComponentWithRef<any, any>
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

const REACT_TYPEOF_PROPERTY = '$$typeof';

if (process.env.NODE_ENV !== 'production') {
  const error = 'Your using an unsupported version of React. Please use React@^16.8.0.';

  if (typeof React.useState !== 'function') {
    throw new Error(error);
  }

  const checks = [React.memo(() => null), React.forwardRef(() => null)];
  for (const check of checks) {
    if (!(REACT_TYPEOF_PROPERTY in check)) {
      throw new Error(error);
    }
  }
}

export function isStyle(arg: any): arg is Style {
  return (
    typeof arg === 'object' &&
    !isType(arg) &&
    // Make sure it isn't a `React.memo` or `React.forwardRef` component
    !(REACT_TYPEOF_PROPERTY in arg)
  );
}
