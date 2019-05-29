import { Style, StyleArray } from '@glitz/type';
import { StyledElementLike } from './apply-class-name';
import create from './create';
import { isStyle } from './custom';
import { StyledComponent, StyledComponentWithRef, StyledElementProps, StyledProps } from './types';

export interface StyledDecorator {
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
  (style: Style): StyledDecorator;
  (): StyleArray;
}

export default function decorator(preStyle: StyleArray): StyledDecorator {
  return (<TProps>(
    arg1?:
      | StyledElementLike<React.ComponentType<TProps>>
      | StyledComponent<TProps>
      | React.ComponentType<TProps>
      | Style,
    arg2?: Style,
  ) => {
    if (arg1) {
      return isStyle(arg1)
        ? decorator(preStyle.concat(arg1))
        : create<TProps>(arg1, arg2 ? preStyle.concat(arg2) : preStyle);
    }

    return preStyle;
  }) as StyledDecorator;
}
