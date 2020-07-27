import { ComponentType } from 'react';
import { Style } from '@glitz/type';
import { StyledElementLike } from './apply-class-name';
import { SECRET_DECORATOR } from './constants';
import createComponent, { isStyledComponent } from './create';
import { Styled } from './custom';
import { StyledComponent, StyledComponentWithRef, StyledElementProps } from './types';
import { flattenStyle, DirtyStyle } from './use-glitz';
import { isType } from './predefined';
import { isValidElementType } from 'react-is';

export interface StyledDecorator extends Styled {
  [SECRET_DECORATOR]: true;
  (decorator: StyledDecorator): StyledDecorator;
  (): Style[];
}

export default function createDecorator(style?: DirtyStyle): StyledDecorator {
  function decorator<TProps>(
    arg1:
      | StyledElementLike<ComponentType<StyledElementProps>>
      | StyledComponentWithRef<any, any>
      | StyledComponent<any>
      | ComponentType,
    arg2?: Style,
  ): StyledComponent<TProps>;

  function decorator<TProps>(arg1?: Style | StyledDecorator): StyledDecorator;

  function decorator<TProps>(): Style[];

  function decorator<TProps>(
    arg1?:
      | StyledElementLike<ComponentType<TProps & StyledElementProps>>
      | StyledComponentWithRef<TProps, any>
      | StyledComponent<TProps>
      | ComponentType<TProps>
      | Style
      | StyledDecorator,
    arg2?: Style,
  ) {
    if (arg1) {
      if (isStyle(arg1) || isDecorator(arg1)) {
        return createDecorator([style, arg1]);
      }

      return createComponent<TProps>(arg1, [style, arg2]);
    }

    return flattenStyle([style]);
  }

  return Object.assign(decorator, { [SECRET_DECORATOR]: true } as const);
}

function isDecorator(
  value: StyledElementLike<ComponentType<any>> | StyledComponent<any> | ComponentType<any> | DirtyStyle,
): value is StyledDecorator {
  return typeof value === 'function' && SECRET_DECORATOR in value;
}

export function isStyle(arg: any): arg is Style {
  return typeof arg === 'object' && !isType(arg) && !isStyledComponent(arg) && !isValidElementType(arg);
}
