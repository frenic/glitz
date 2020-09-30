/* tslint:disable unified-signatures */
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
import { StyledElementLike } from './apply-class-name';
import createComponent, { WithoutRefProp } from './create';
import createDecorator, { Decorator, isStyle } from './decorator';
import { StyledComponent, StyledComponentWithRef, StyledElementProps } from './types';

export type Styles = Style | readonly Style[];

export interface Styled {
  <TProps = {}>(component: FunctionComponent<TProps>, ...styles: Styles[]): StyledComponent<WithoutRefProp<TProps>>;
  <TProps, TInstance>(
    component: StyledComponentWithRef<TProps, TInstance>,
    ...styles: Styles[]
  ): StyledComponentWithRef<TProps, TInstance>;
  <TProps>(component: StyledComponent<TProps>, ...styles: Styles[]): StyledComponent<TProps>;
  <TProps extends StyledElementProps>(
    component: StyledElementLike<FunctionComponent<TProps>>,
    ...styles: Styles[]
  ): StyledComponent<WithoutRefProp<TProps>>;
  <TProps extends StyledElementProps, TInstance extends Component<TProps, ComponentState>>(
    component: StyledElementLike<ClassType<TProps, TInstance, ComponentClass<TProps>>>,
    ...styles: Styles[]
  ): StyledComponentWithRef<TProps, TInstance>;
  <TProps, TInstance>(
    component: ForwardRefExoticComponent<TProps & RefAttributes<TInstance>>,
    ...styles: Styles[]
  ): StyledComponentWithRef<TProps, TInstance>;
  <TProps, TInstance extends Component<TProps, ComponentState>>(
    component: ClassType<TProps, TInstance, ComponentClass<TProps>>,
    ...styles: Styles[]
  ): StyledComponentWithRef<TProps, TInstance>;
  (...styles: Styles[]): Decorator;
  (): Decorator;

  // These last overloads prevents errors on `component` when `style` is
  // incorrect and enables usage of generic parameter to provide prop type
  (
    component: StyledElementLike<ComponentType<StyledElementProps>> | ComponentType,
    ...styles: Styles[]
  ): StyledComponent<any>;
  (style: Styles): Decorator;
}

function creator<TProps>(
  arg1:
    | StyledElementLike<ComponentType<StyledElementProps>>
    | StyledComponentWithRef<any, any>
    | StyledComponent<any>
    | ComponentType,
  ...arg2: Styles[]
): StyledComponent<TProps>;

function creator<TProps>(...styles: Styles[]): Decorator;

function creator<TProps>(): Decorator;

function creator<TProps>(
  arg1?:
    | StyledElementLike<ComponentType<TProps & StyledElementProps>>
    | StyledComponentWithRef<TProps, any>
    | StyledComponent<TProps>
    | ComponentType<TProps>
    | Styles,
  ...arg2: Styles[]
): StyledComponent<TProps> | Decorator {
  return typeof arg1 === 'undefined' || isStyle(arg1)
    ? createDecorator([arg1, arg2])
    : createComponent<TProps>(arg1, arg2);
}

export const createStyled: Styled = creator;
