import { FunctionComponent, ComponentClass, ClassType, Component, ComponentState, ComponentType } from 'react';
import { SECRET_GLITZ_PROPERTY, ELEMENT_LIKE_TYPE } from './constants';
import { WithRefProp } from './create';
import { StyledType } from './predefined';
import { StyledElementProps } from './types';

export interface StyledElementLike<TComponent> extends StyledType {
  [SECRET_GLITZ_PROPERTY]: typeof ELEMENT_LIKE_TYPE;
  value: TComponent;
}

export function applyClassName<TProps extends StyledElementProps = StyledElementProps>(
  component: FunctionComponent<TProps>,
): StyledElementLike<FunctionComponent<TProps>>;

export function applyClassName<TProps extends StyledElementProps, TComponent extends ComponentClass<TProps>>(
  component: ClassType<TProps, Component<TProps, ComponentState>, TComponent>,
): StyledElementLike<TComponent>;

export function applyClassName<TProps extends StyledElementProps>(
  component: ComponentType<TProps>,
): StyledElementLike<ComponentType<TProps>> {
  return {
    [SECRET_GLITZ_PROPERTY]: ELEMENT_LIKE_TYPE,
    value: component,
  };
}

export function isElementLikeType<TProps extends StyledElementProps, TInstance>(
  type: any,
): type is StyledElementLike<ComponentType<WithRefProp<TProps, TInstance>>> {
  return SECRET_GLITZ_PROPERTY in type && type[SECRET_GLITZ_PROPERTY] === ELEMENT_LIKE_TYPE;
}
