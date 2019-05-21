import * as React from 'react';
import { WithRefProp } from './create';
import { isType, SECRET_TYPE, StyledType, Type } from './internals';
import { StyledElementProps } from './types';

export interface StyledElementLike<TComponent> extends StyledType {
  [SECRET_TYPE]: Type.ElementLike;
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
    [SECRET_TYPE]: Type.ElementLike,
    value: component,
  };
}

export function isElementLikeType<TProps extends StyledElementProps, TInstance>(
  type: any,
): type is StyledElementLike<React.ComponentType<WithRefProp<TProps, TInstance>>> {
  return isType(type) && type[SECRET_TYPE] === Type.ElementLike;
}
