import { Style } from '@glitz/type';
import {
  FunctionComponent,
  Component,
  ComponentState,
  ComponentClass,
  ClassType,
  ForwardRefExoticComponent,
  RefAttributes,
  ComponentType,
} from 'react';
import { isValidElementType } from 'react-is';
import { StyledElementLike } from './apply-class-name';
import create, { isStyledComponent } from './create';
import decorator, { StyledDecorator } from './decorator';
import { isType } from './predefined';
import { StyledComponent, StyledComponentWithRef, StyledElementProps } from './types';

export interface StyledCustom {
  (component: FunctionComponent, style?: Style): StyledComponent<{}>;
  <TProps>(component: FunctionComponent<TProps>, style?: Style): StyledComponent<TProps>;
  // tslint:disable-next-line: unified-signatures
  <TProps>(component: StyledComponent<TProps>, style?: Style): StyledComponent<TProps>;
  <TProps, TInstance>(component: StyledComponentWithRef<TProps, TInstance>, style?: Style): StyledComponentWithRef<
    TProps,
    TInstance
  >;
  <TProps extends StyledElementProps>(
    component: StyledElementLike<FunctionComponent<TProps>>,
    style?: Style,
  ): StyledComponent<TProps>;
  <TProps extends StyledElementProps, TInstance extends Component<TProps, ComponentState>>(
    component: StyledElementLike<ClassType<TProps, TInstance, ComponentClass<TProps>>>,
    style?: Style,
  ): StyledComponentWithRef<TProps, TInstance>;
  <TProps, TInstance>(
    component: ForwardRefExoticComponent<TProps & RefAttributes<TInstance>>,
    style?: Style,
  ): StyledComponentWithRef<TProps, TInstance>;
  <TProps, TInstance extends Component<TProps, ComponentState>>(
    component: ClassType<TProps, TInstance, ComponentClass<TProps>>,
    style?: Style,
  ): StyledComponentWithRef<TProps, TInstance>;

  // This overload prevents errors on `component` when `style` is incorrect
  // and enables usage of generic parameter to provide prop type
  (component: StyledElementLike<ComponentType<StyledElementProps>> | ComponentType, style?: Style): StyledComponent<
    any
  >;

  (style: Style): StyledDecorator;
}

function custom<TProps>(
  arg1:
    | StyledElementLike<ComponentType<StyledElementProps>>
    | StyledComponentWithRef<any, any>
    | StyledComponent<any>
    | ComponentType,
  arg2?: Style,
): StyledComponent<TProps>;

function custom<TProps>(arg1: Style): StyledDecorator;

function custom<TProps>(
  arg1:
    | StyledElementLike<ComponentType<TProps & StyledElementProps>>
    | StyledComponentWithRef<TProps, any>
    | StyledComponent<TProps>
    | ComponentType<TProps>
    | Style,
  arg2?: Style,
): StyledComponent<TProps> | StyledDecorator {
  return isStyle(arg1) ? decorator([arg1]) : create<TProps>(arg1, arg2 ? [arg2] : []);
}

export const styledCustom: StyledCustom = custom;

export function isStyle(arg: any): arg is Style {
  return typeof arg === 'object' && !isType(arg) && !isStyledComponent(arg) && !isValidElementType(arg);
}
