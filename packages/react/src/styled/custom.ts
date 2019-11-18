import { Style } from '@glitz/type';
import * as React from 'react';
import { isValidElementType } from 'react-is';
import { StyledElementLike } from './apply-class-name';
import create, { isStyledComponent } from './create';
import decorator, { StyledDecorator } from './decorator';
import { isType } from './predefined';
import { StyledComponent, StyledComponentWithRef, StyledElementProps, StyledProps } from './types';

export interface StyledCustom {
  <TProps, TInstance>(component: StyledComponentWithRef<TProps, TInstance>, style?: Style): StyledComponentWithRef<
    TProps,
    TInstance
  >;
  <TProps>(component: StyledComponent<TProps>, style?: Style): StyledComponent<TProps>;
  <TProps extends StyledElementProps>(
    component: StyledElementLike<React.FunctionComponent<TProps>>,
    style?: Style,
  ): StyledComponent<TProps>;
  <TProps extends StyledElementProps, TInstance extends React.Component<TProps, React.ComponentState>>(
    component: StyledElementLike<React.ClassType<TProps, TInstance, React.ComponentClass<TProps>>>,
    style?: Style,
  ): StyledComponentWithRef<TProps, TInstance>;
  <TProps extends StyledProps, TInstance>(
    component: React.ForwardRefExoticComponent<TProps & React.RefAttributes<TInstance>>,
    style?: Style,
  ): StyledComponentWithRef<TProps, TInstance>;
  <TProps extends StyledProps>(component: React.FunctionComponent<TProps>, style?: Style): StyledComponent<TProps>;
  <TProps extends StyledProps, TInstance extends React.Component<TProps, React.ComponentState>>(
    component: React.ClassType<TProps, TInstance, React.ComponentClass<TProps>>,
    style?: Style,
  ): StyledComponentWithRef<TProps, TInstance>;
  (style: Style): StyledDecorator;

  // This overload prevents errors on `component` when `style` is incorrect
  // and enables usage of generic parameter to provide prop type
  (
    component:
      | StyledElementLike<React.ComponentType<StyledElementProps>>
      | React.ForwardRefExoticComponent<StyledProps>
      | StyledComponentWithRef<any, any>
      | StyledComponent<any>
      | React.ComponentType<StyledProps>,
    style?: Style,
  ): StyledComponent<any>;
}

function custom<TProps>(
  arg1:
    | StyledElementLike<React.ComponentType<StyledElementProps>>
    | StyledComponentWithRef<any, any>
    | StyledComponent<any>
    | React.ComponentType<StyledProps>,
  arg2?: Style,
): StyledComponent<TProps>;

function custom<TProps>(arg1: Style): StyledDecorator;

function custom<TProps>(
  arg1:
    | StyledElementLike<React.ComponentType<TProps & StyledElementProps>>
    | StyledComponentWithRef<TProps, any>
    | StyledComponent<TProps>
    | React.ComponentType<TProps & StyledProps>
    | Style,
  arg2?: Style,
): StyledComponent<TProps> | StyledDecorator {
  return isStyle(arg1) ? decorator([arg1]) : create<TProps>(arg1, arg2 ? [arg2] : []);
}

export const styledCustom: StyledCustom = custom;

export function isStyle(arg: any): arg is Style {
  return typeof arg === 'object' && !isType(arg) && !isStyledComponent(arg) && !isValidElementType(arg);
}
