import { Style } from '@glitz/core';
import { ClassType, Component, ComponentClass, ComponentState, ComponentType, FunctionComponent } from 'react';
import { FORWARD_STYLE_TYPE, SECRET_GLITZ_PROPERTY } from './constants';
import { WithRefProp } from './create';
import { Styles } from './custom';
import { StyledType } from './predefined';

export type StyledProps = {
  compose(style?: Styles): readonly Style[];
};

export type WithoutCompose<TProps> = TProps extends StyledProps ? Omit<TProps, 'compose'> : TProps;

export interface StyledForwardStyle<TComponent> extends StyledType {
  [SECRET_GLITZ_PROPERTY]: typeof FORWARD_STYLE_TYPE;
  value: TComponent;
}

export function forwardStyle<TProps extends StyledProps>(
  component: FunctionComponent<TProps>,
): StyledForwardStyle<FunctionComponent<TProps>>;

export function forwardStyle<TProps extends StyledProps, TComponent extends ComponentClass<TProps>>(
  component: ClassType<TProps, Component<TProps, ComponentState>, TComponent>,
): StyledForwardStyle<TComponent>;

export function forwardStyle<TProps extends StyledProps>(
  component: ComponentType<TProps>,
): StyledForwardStyle<ComponentType<TProps>> {
  return {
    [SECRET_GLITZ_PROPERTY]: FORWARD_STYLE_TYPE,
    value: component,
  };
}

export function isForwardStyleType<TProps, TInstance>(
  type: any,
): type is StyledForwardStyle<ComponentType<WithRefProp<TProps, TInstance>>> {
  return type[SECRET_GLITZ_PROPERTY] === FORWARD_STYLE_TYPE;
}
