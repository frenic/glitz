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
import createDecorator, { StyledDecorator, isStyle } from './decorator';
import { StyledComponent, StyledComponentWithRef, StyledElementProps } from './types';

export interface Styled {
  <TProps = {}>(component: FunctionComponent<TProps>, style?: Style): StyledComponent<WithoutRefProp<TProps>>;
  <TProps, TInstance>(component: StyledComponentWithRef<TProps, TInstance>, style?: Style): StyledComponentWithRef<
    TProps,
    TInstance
  >;
  <TProps>(component: StyledComponent<TProps>, style?: Style): StyledComponent<TProps>;
  <TProps extends StyledElementProps>(
    component: StyledElementLike<FunctionComponent<TProps>>,
    style?: Style,
  ): StyledComponent<WithoutRefProp<TProps>>;
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

  (style?: Style): StyledDecorator;
}

function creator<TProps>(
  arg1:
    | StyledElementLike<ComponentType<StyledElementProps>>
    | StyledComponentWithRef<any, any>
    | StyledComponent<any>
    | ComponentType,
  arg2?: Style,
): StyledComponent<TProps>;

function creator<TProps>(arg1?: Style): StyledDecorator;

function creator<TProps>(
  arg1?:
    | StyledElementLike<ComponentType<TProps & StyledElementProps>>
    | StyledComponentWithRef<TProps, any>
    | StyledComponent<TProps>
    | ComponentType<TProps>
    | Style,
  arg2?: Style,
): StyledComponent<TProps> | StyledDecorator {
  return typeof arg1 === 'undefined' || isStyle(arg1) ? createDecorator(arg1) : createComponent<TProps>(arg1, arg2);
}

export const createStyled: Styled = creator;
