import { Style } from '@glitz/core';
import * as React from 'react';
import { create, StyledComponent, StyledProps } from './create';

export type InnerComponent<TProps> = React.ComponentType<TProps & StyledProps> | StyledComponent<TProps>;

export interface StyledDecorator {
  // Needed due to: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/17181
  (component: InnerComponent<{}>, style?: Style): StyledComponent<{}>;
  <TProps>(component: InnerComponent<TProps>, style?: Style): StyledComponent<TProps>;
}

function isStyle<TProps>(arg: InnerComponent<TProps> | Style): arg is Style {
  return typeof arg === 'object';
}

export function customStyled(component: InnerComponent<{}>, style?: Style): StyledComponent<{}>;

export function customStyled<TProps>(component: InnerComponent<TProps>, style?: Style): StyledComponent<TProps>;

export function customStyled(style: Style): StyledDecorator;

export function customStyled<TProps>(
  arg1: InnerComponent<TProps> | Style,
  arg2?: Style,
): StyledComponent<TProps> | StyledDecorator {
  if (isStyle(arg1)) {
    return <TInnerProps>(innerComponent: InnerComponent<TInnerProps>, style?: Style) =>
      customStyled<TInnerProps>(innerComponent, style ? { ...arg1, ...style } : arg1);
  }

  return create<TProps>(arg1, arg2);
}
