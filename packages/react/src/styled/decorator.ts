import { ComponentType } from 'react';
import { isValidElementType } from 'react-is';
import type { Style } from '@glitz/core';
import { isElementLikeType, StyledElementLike } from './apply-class-name';
import createComponent, { StyledComponent } from './create';
import { Styles } from './custom';
import { sanitizeStyle, DirtyStyle } from './use-glitz';
import { isElementType, StyledElementProps } from './predefined';
import { DECORATOR_TYPE, SECRET_GLITZ_PROPERTY } from './constants';
import { isForwardStyleType } from './forward-style';

export interface StyledDecorator {
  [SECRET_GLITZ_PROPERTY]: typeof DECORATOR_TYPE;

  /** Apply decorator style */
  (): readonly Style[];
}

export default function createDecorator(dirtyStyle?: DirtyStyle): StyledDecorator {
  const style = sanitizeStyle(dirtyStyle);

  function decorator<TProps>(
    arg1: StyledElementLike<ComponentType<StyledElementProps>> | StyledComponent<any> | ComponentType,
    ...arg2: Styles[]
  ): StyledComponent<TProps>;

  function decorator(...styles: Styles[]): StyledDecorator;

  function decorator(): Style[];

  function decorator<TProps>(
    arg1?:
      | StyledElementLike<ComponentType<TProps & StyledElementProps>>
      | StyledComponent<TProps>
      | ComponentType<TProps>
      | Styles,
    ...arg2: Styles[]
  ) {
    if (arguments.length === 0) {
      return style;
    }

    if (isStyle(arg1)) {
      return createDecorator([style, arg1, arg2]);
    }

    return createComponent<TProps>(arg1, [style, arg2]);
  }

  return Object.assign(decorator, { [SECRET_GLITZ_PROPERTY]: DECORATOR_TYPE });
}

export function isStyle(arg: unknown): arg is Styles {
  return (
    arg === false ||
    typeof arg === 'undefined' ||
    (typeof arg === 'function' && (arg as StyledDecorator)[SECRET_GLITZ_PROPERTY] === DECORATOR_TYPE) ||
    (typeof arg === 'object' &&
      !isElementType(arg) &&
      !isElementLikeType(arg) &&
      !isForwardStyleType(arg) &&
      !isValidElementType(arg))
  );
}
