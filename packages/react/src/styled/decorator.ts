import { ComponentType } from 'react';
import { Style } from '@glitz/type';
import { StyledElementLike } from './apply-class-name';
import { SECRET_DECORATOR } from './constants';
import create from './create';
import { isStyle, StyledCustom } from './custom';
import { StyledComponent, StyledComponentWithRef, StyledElementProps } from './types';

export interface StyledDecorator extends StyledCustom {
  [SECRET_DECORATOR]: true;
  (decorator: StyledDecorator): StyledDecorator;
  (): Style[];
}

export default function decorator(style: Style[]): StyledDecorator {
  const fn = (<TProps>(
    arg1?:
      | StyledElementLike<ComponentType<TProps & StyledElementProps>>
      | StyledComponentWithRef<TProps, any>
      | StyledComponent<TProps>
      | ComponentType<TProps>
      | StyledDecorator
      | Style,
    arg2?: Style,
  ) => {
    if (arg1) {
      if (isStyle(arg1)) {
        return decorator(style.concat(arg1));
      }

      if (isDecorator(arg1)) {
        return decorator(style.concat(arg1()));
      }

      return create<TProps>(arg1, arg2 ? style.concat(arg2) : style);
    }

    return style;
  }) as StyledDecorator;

  fn[SECRET_DECORATOR] = true;

  return fn;
}

function isDecorator(
  value: StyledElementLike<ComponentType<any>> | StyledComponent<any> | ComponentType<any> | StyledDecorator,
): value is StyledDecorator {
  return SECRET_DECORATOR in value;
}
