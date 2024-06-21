import { Style } from '@glitz/core';
import { FunctionComponent, Component, ComponentState, ComponentClass, ClassType, ComponentType } from 'react';
import { StyledElementLike } from './apply-class-name';
import createComponent, { StyledComponent, StyledComponentWithRef } from './create';
import createDecorator, { StyledDecorator, isStyle } from './decorator';
import { WithoutCompose, StyledForwardStyle } from './forward-style';
import { StyledElementProps } from './predefined';

export type Styles = Style | readonly Style[] | StyledDecorator | false | undefined;

export interface Styled {
  <TProps = {}>(component: FunctionComponent<TProps>, ...styles: Styles[]): StyledComponent<TProps>;

  <TProps>(component: StyledComponent<TProps>, ...styles: Styles[]): StyledComponent<TProps>;

  <TProps>(
    component: StyledForwardStyle<FunctionComponent<TProps>>,
    ...styles: Styles[]
  ): StyledComponent<WithoutCompose<TProps>>;

  <TProps, TInstance extends Component<TProps, ComponentState>>(
    component: StyledForwardStyle<ClassType<TProps, TInstance, ComponentClass<TProps>>>,
    ...styles: Styles[]
  ): StyledComponent<WithoutCompose<TProps>>;

  <TProps extends StyledElementProps>(
    component: StyledElementLike<FunctionComponent<TProps>>,
    ...styles: Styles[]
  ): StyledComponent<TProps>;

  <TProps extends StyledElementProps, TInstance extends Component<TProps, ComponentState>>(
    component: StyledElementLike<ClassType<TProps, TInstance, ComponentClass<TProps>>>,
    ...styles: Styles[]
  ): StyledComponentWithRef<TProps, TInstance>;

  <TProps, TInstance extends Component<TProps, ComponentState>>(
    component: ClassType<TProps, TInstance, ComponentClass<TProps>>,
    ...styles: Styles[]
  ): StyledComponentWithRef<TProps, TInstance>;

  (...styles: Styles[]): StyledDecorator;

  (): StyledDecorator;

  // These last overloads prevents errors on `component` when `style` is
  // incorrect and enables usage of generic parameter to provide prop type
  (
    component: StyledElementLike<ComponentType<StyledElementProps>> | ComponentType,
    ...styles: Styles[]
  ): StyledComponent<any>;
  (style: Styles): StyledDecorator;
}

function creator<TProps>(
  arg1:
    | StyledForwardStyle<ComponentType<TProps>>
    | StyledElementLike<ComponentType<StyledElementProps>>
    | StyledComponent<any>
    | ComponentType,
  ...arg2: Styles[]
): StyledComponent<TProps>;

function creator(...styles: Styles[]): StyledDecorator;

function creator(): StyledDecorator;

function creator<TProps>(
  arg1?:
    | StyledForwardStyle<ComponentType<TProps>>
    | StyledElementLike<ComponentType<TProps & StyledElementProps>>
    | StyledComponent<TProps>
    | ComponentType<TProps>
    | Styles,
  ...arg2: Styles[]
): StyledComponent<TProps> | StyledDecorator {
  return isStyle(arg1) ? createDecorator([arg1, arg2]) : createComponent<TProps>(arg1, arg2);
}

export const createStyled: Styled = creator;
