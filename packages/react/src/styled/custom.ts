import { Style } from '@glitz/core';
import * as React from 'react';
import { create, StyledComponent, StyledProps } from './create';

// const STATIC_STYLE_KEY = 'GLITZ_STATIC';
// const STATIC_COMPONENT_KEY = 'GLITZ_COMPONENT';

export type StyledFunction = <TProps>(component: React.ComponentType<TProps & StyledProps>) => StyledComponent<TProps>;

export function customStyled(style: Style): StyledFunction;

export function customStyled<TProps>(
  component: React.ComponentType<TProps & StyledProps>,
  style?: Style,
): StyledComponent<TProps>;

export function customStyled<TProps>(
  arg1: React.ComponentType<TProps & StyledProps> | Style,
  arg2?: Style,
): StyledComponent<TProps> | StyledFunction {
  if (typeof arg1 === 'object') {
    return <TInnerProps>(innerComponent: React.ComponentType<TInnerProps & StyledProps>) =>
      create<TInnerProps>(innerComponent, arg1);
  }

  return create<TProps>(arg1, arg2);
}
