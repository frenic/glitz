import { Style } from '@glitz/core';
import * as React from 'react';
import { create, StyledComponent, StyledProps } from './create';

export type StyledFunction = <TProps>(
  component: React.ComponentType<TProps & StyledProps>,
  style?: Style,
) => StyledComponent<TProps>;

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
    return <TInnerProps>(innerComponent: React.ComponentType<TInnerProps & StyledProps>, style?: Style) =>
      customStyled<TInnerProps>(innerComponent, style ? { ...arg1, ...style } : arg1);
  }

  return create<TProps>(arg1, arg2);
}
