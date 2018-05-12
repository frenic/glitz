import { Style } from '@glitz/type';
import * as React from 'react';
import create from './create';
import { StyledComponent, StyledProps } from './types';

export interface StyledDecorator {
  <TProps>(component: StyledComponent<TProps>, style?: Style): StyledComponent<TProps>;
  <TProps extends StyledProps>(component: React.ComponentType<TProps>, style?: Style): StyledComponent<TProps>;
}

export function customStyled<TProps>(component: StyledComponent<TProps>, style?: Style): StyledComponent<TProps>;

export function customStyled<TProps extends StyledProps>(
  component: React.ComponentType<TProps>,
  style?: Style,
): StyledComponent<TProps>;

export function customStyled(style: Style): StyledDecorator;

export function customStyled<TProps>(
  arg1: StyledComponent<TProps> | React.ComponentType<TProps> | Style,
  arg2?: Style,
): StyledComponent<TProps> | StyledDecorator {
  return isStyle(arg1) ? decorator(arg1) : create(arg1, arg2 ? [arg2] : []);
}

function decorator<TProps>(style: Style): StyledDecorator {
  return (innerComponent: StyledComponent<TProps> | React.ComponentType<TProps>, additionalStyle?: Style) =>
    create(innerComponent, additionalStyle ? [style, additionalStyle] : [style]);
}

function isStyle(arg: StyledComponent<any> | React.ComponentType<any> | Style): arg is Style {
  return typeof arg === 'object';
}
