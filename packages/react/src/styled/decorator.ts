import { Style, StyleArray } from '@glitz/type';
import { StyledElementLike } from './apply-class-name';
import { SECRET_DECORATOR } from './constants';
import create from './create';
import { isStyle } from './custom';
import { StyledComponent, StyledComponentWithRef, StyledElementProps, StyledProps } from './types';

export interface StyledDecorator {
  [SECRET_DECORATOR]: true;
  <TProps, TInstance>(component: StyledComponentWithRef<TProps, TInstance>, style?: Style): StyledComponentWithRef<
    TProps,
    TInstance
  >;
  <TProps>(component: StyledComponent<TProps>, style?: Style): StyledComponent<TProps>;
  <TProps extends StyledElementProps>(
    component: StyledElementLike<React.FunctionComponent<TProps>>,
    style?: Style,
  ): StyledComponent<TProps>;
  <TProps extends StyledElementProps, TInstance extends React.Component<TProps, React.ComponentState>>(
    component: StyledElementLike<React.ClassType<TProps, TInstance, React.ComponentClass<TProps>>>,
    style?: Style,
  ): StyledComponentWithRef<TProps, TInstance>;
  <TProps extends StyledProps>(component: React.FunctionComponent<TProps>, style?: Style): StyledComponent<TProps>;
  <TProps extends StyledProps, TInstance extends React.Component<TProps, React.ComponentState>>(
    component: React.ClassType<TProps, TInstance, React.ComponentClass<TProps>>,
    style?: Style,
  ): StyledComponentWithRef<TProps, TInstance>;
  (style: StyledDecorator | Style): StyledDecorator;
  (): StyleArray;
}

export default function decorator(preStyle: StyleArray): StyledDecorator {
  const fn = (<TProps>(
    arg1?:
      | StyledElementLike<React.ComponentType<TProps>>
      | StyledComponent<TProps>
      | React.ComponentType<TProps>
      | StyledDecorator
      | Style,
    arg2?: Style,
  ) => {
    if (arg1) {
      if (isStyle(arg1)) {
        return decorator(preStyle.concat(arg1));
      }

      if (isDecorator(arg1)) {
        return decorator(preStyle.concat(arg1()));
      }

      return create<TProps>(arg1, arg2 ? preStyle.concat(arg2) : preStyle);
    }

    return preStyle;
  }) as StyledDecorator;

  fn[SECRET_DECORATOR] = true;

  return fn;
}

function isDecorator(
  value:
    | StyledElementLike<React.ComponentType<any>>
    | StyledComponent<any>
    | React.ComponentType<any>
    | StyledDecorator,
): value is StyledDecorator {
  return SECRET_DECORATOR in value;
}
