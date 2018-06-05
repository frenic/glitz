import * as React from 'react';
import { isType, STYLED_TYPE_PROPERTY, StyledType, Type } from './internals';
import { StyledElementProps } from './Super';

export interface StyledElementLike<TComponent> extends StyledType {
  [STYLED_TYPE_PROPERTY]: Type.ElementLike;
  value: TComponent;
}

export function applyClassName<TProps extends StyledElementProps = StyledElementProps>(
  component: React.StatelessComponent<TProps>,
): StyledElementLike<React.StatelessComponent<TProps>>;

export function applyClassName<TProps extends StyledElementProps, TComponent extends React.ComponentClass<TProps>>(
  component: React.ClassType<TProps, React.Component<TProps, React.ComponentState>, TComponent>,
): StyledElementLike<TComponent>;

export function applyClassName<TProps extends StyledElementProps>(
  component: React.ComponentType<TProps>,
): StyledElementLike<React.ComponentType<TProps>> {
  return {
    [STYLED_TYPE_PROPERTY]: Type.ElementLike,
    value: component,
  };
}

export function isElementLikeType<TProps extends StyledElementProps>(
  type: any,
): type is StyledElementLike<React.ComponentType<TProps>> {
  return isType(type) && type[STYLED_TYPE_PROPERTY] === Type.ElementLike;
}
