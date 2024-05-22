import { Style } from '@glitz/core';
import { ClassType, Component, ComponentClass, ComponentState, ComponentType, FunctionComponent } from 'react';
import { FORWARD_STYLE_TYPE, SECRET_GLITZ_PROPERTY } from './constants';
import { Styles } from './custom';
import { StyledType } from './predefined';

export type ForwardStyleProps = {
  compose(style?: Styles): readonly Style[];
};

export type WithoutCompose<TProps> = TProps extends ForwardStyleProps ? Omit<TProps, 'compose'> : TProps;

export interface StyledForwardStyle<TComponent> extends StyledType {
  [SECRET_GLITZ_PROPERTY]: typeof FORWARD_STYLE_TYPE;
  value: TComponent;
}

export function forwardStyle<TProps extends ForwardStyleProps>(
  component: FunctionComponent<TProps>,
): StyledForwardStyle<FunctionComponent<TProps>>;

export function forwardStyle<TProps extends ForwardStyleProps, TComponent extends ComponentClass<TProps>>(
  component: ClassType<TProps, Component<TProps, ComponentState>, TComponent>,
): StyledForwardStyle<TComponent>;

export function forwardStyle<TProps extends ForwardStyleProps>(
  component: ComponentType<TProps>,
): StyledForwardStyle<ComponentType<TProps>> {
  return {
    [SECRET_GLITZ_PROPERTY]: FORWARD_STYLE_TYPE,
    value: component,
  };
}

export function isForwardStyleType<TProps>(type: any): type is StyledForwardStyle<ComponentType<TProps>> {
  return type[SECRET_GLITZ_PROPERTY] === FORWARD_STYLE_TYPE;
}
