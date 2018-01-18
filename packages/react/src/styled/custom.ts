import { Style } from '@glitz/core';
import * as React from 'react';
import { create, StyledComponent, StyledProps } from './create';

export type InnerCustomComponent<TProps> = React.ComponentType<TProps & StyledProps> | StyledComponent<TProps>;

export type StyledFunction = <TProps>(
  component: InnerCustomComponent<TProps>,
  style?: Style,
) => StyledComponent<TProps>;

function isStyle<TProps>(arg: InnerCustomComponent<TProps> | Style): arg is Style {
  return typeof arg === 'object';
}

export function customStyled(style: Style): StyledFunction;

export function customStyled<TProps>(component: InnerCustomComponent<TProps>, style?: Style): StyledComponent<TProps>;

export function customStyled<TProps>(
  arg1: InnerCustomComponent<TProps> | Style,
  arg2?: Style,
): StyledComponent<TProps> | StyledFunction {
  if (isStyle(arg1)) {
    return <TInnerProps>(innerComponent: InnerCustomComponent<TInnerProps>, style?: Style) =>
      customStyled<TInnerProps>(innerComponent, style ? { ...arg1, ...style } : arg1);
  }

  return create<TProps>(arg1, arg2);
}
