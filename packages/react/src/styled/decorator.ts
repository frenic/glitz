import { ComponentType } from 'react';
import { isValidElementType } from 'react-is';
import { Style } from '@glitz/type';
import { StyledElementLike } from './apply-class-name';
import { DECORATOR_TYPE, SECRET_GLITZ_PROPERTY } from './constants';
import createComponent from './create';
import { Styled, Styles } from './custom';
import { StyledComponent, StyledComponentWithRef, StyledElementProps } from './types';
import { flattenStyle, DirtyStyle } from './use-glitz';

export interface StyledDecorator extends Styled {
  [SECRET_GLITZ_PROPERTY]: typeof DECORATOR_TYPE;
  (): Style[];
}

export default function createDecorator(style?: DirtyStyle): StyledDecorator {
  function decorator<TProps>(
    arg1:
      | StyledElementLike<ComponentType<StyledElementProps>>
      | StyledComponentWithRef<any, any>
      | StyledComponent<any>
      | ComponentType,
    arg2?: Styles,
  ): StyledComponent<TProps>;

  function decorator<TProps>(arg1?: Styles): StyledDecorator;

  function decorator<TProps>(): Style[];

  function decorator<TProps>(
    arg1?:
      | StyledElementLike<ComponentType<TProps & StyledElementProps>>
      | StyledComponentWithRef<TProps, any>
      | StyledComponent<TProps>
      | ComponentType<TProps>
      | Styles,
    arg2?: Styles,
  ) {
    if (arg1) {
      if (isStyle(arg1)) {
        return createDecorator([style, arg1]);
      }

      return createComponent<TProps>(arg1, [style, arg2]);
    }

    return flattenStyle([style]);
  }

  return Object.assign(decorator, { [SECRET_GLITZ_PROPERTY]: DECORATOR_TYPE } as const);
}

export function isStyle(arg: any): arg is Styles {
  return typeof arg === 'object' && !isValidElementType(arg) && !(SECRET_GLITZ_PROPERTY in arg);
}
