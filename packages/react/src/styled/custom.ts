import { Style } from '@glitz/type';
import * as React from 'react';
import { isForwardRef, isMemo } from 'react-is';
import { StyledElementLike } from './apply-class-name';
import create, { isStyledComponent } from './create';
import decorator, { StyledDecorator } from './decorator';
import { isType } from './predefined';
import { StyledComponent, StyledComponentWithRef, StyledElementProps, StyledProps } from './types';

export function customStyled<TProps, TInstance>(
  component: StyledComponentWithRef<TProps, TInstance>,
  style?: Style,
): StyledComponentWithRef<TProps, TInstance>;

export function customStyled<TProps>(component: StyledComponent<TProps>, style?: Style): StyledComponent<TProps>;

export function customStyled<TProps extends StyledElementProps>(
  component: StyledElementLike<React.FunctionComponent<TProps>>,
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
  component: React.FunctionComponent<TProps>,
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

export function isStyle(arg: any): arg is Style {
  return typeof arg === 'object' && !isType(arg) && !isStyledComponent(arg) && !isMemo(arg) && !isForwardRef(arg);
}
