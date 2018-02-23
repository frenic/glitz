import { Style } from '@glitz/type';
import * as React from 'react';
import { create, StyledComponent, StyledProps } from './create';

export function customStyled<TProps extends StyledProps>(
  component: React.ComponentType<TProps>,
  style?: Style,
): StyledComponentWithProps<TProps>;

export function customStyled<TProps>(component: StyledComponent<TProps>, style?: Style): StyledComponent<TProps>;

export function customStyled(style: Style): StyledDecorator;

export function customStyled<TProps>(
  arg1: React.ComponentType<TProps & StyledProps> | StyledComponent<TProps> | Style,
  arg2?: Style,
): StyledComponent<any> | StyledDecorator {
  if (isStyle(arg1)) {
    return (innerComponent: React.ComponentType<any>, style?: Style) =>
      create(innerComponent, style ? [arg1, style] : [arg1]);
  }

  return create(arg1, arg2 ? [arg2] : []);
}

function isStyle(arg: React.ComponentType<any> | Style): arg is Style {
  return typeof arg === 'object';
}

export interface StyledDecorator {
  <TProps extends StyledProps>(component: React.ComponentType<TProps>, style?: Style): StyledComponentWithProps<TProps>;
  <TProps>(component: StyledComponent<TProps>, style?: Style): StyledComponent<TProps>;
}

// TODO: Use conditional types when TypeScript 2.8 arrives
export type StyledComponentWithProps<TProps extends StyledProps> = StyledComponent<
  Cleanup<Omit<TProps, keyof StyledProps>>
>;

// Clean up types
export type Cleanup<T> = { [P in keyof T]: T[P] };
export type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];
export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;
