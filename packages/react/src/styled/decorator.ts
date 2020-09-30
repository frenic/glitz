/* tslint:disable unified-signatures */
import {
  FunctionComponent,
  Component,
  ComponentState,
  ComponentClass,
  ClassType,
  ForwardRefExoticComponent,
  RefAttributes,
  ComponentType,
} from 'react';
import { isValidElementType } from 'react-is';
import { Style } from '@glitz/type';
import { isElementLikeType, StyledElementLike } from './apply-class-name';
import createComponent, { WithoutRefProp } from './create';
import { Styles } from './custom';
import { StyledComponent, StyledComponentWithRef, StyledElementProps } from './types';
import { flattenStyle, DirtyStyle } from './use-glitz';
import { isElementType } from './predefined';

export interface Decorator {
  /**
   * @deprecated
   * **Components** as argument to a decorator is deprecated and will be removed in next major version, use your decorator with `styled()` instead
   *
   * ```
   * // Example
   * styled(
   *   Component,
   *   yourDecorator(),
   *   { color: 'red' },
   * );
   * ```
   */
  <TProps = {}>(component: FunctionComponent<TProps>, ...styles: Styles[]): StyledComponent<WithoutRefProp<TProps>>;

  /**
   * @deprecated
   * **Components** as argument to a decorator is deprecated and will be removed in next major version, use your decorator with `styled()` instead
   *
   * ```
   * // Example
   * styled(
   *   Component,
   *   yourDecorator(),
   *   { color: 'red' },
   * );
   * ```
   */
  <TProps, TInstance>(
    component: StyledComponentWithRef<TProps, TInstance>,
    ...styles: Styles[]
  ): StyledComponentWithRef<TProps, TInstance>;

  /**
   * @deprecated
   * **Components** as argument to a decorator is deprecated and will be removed in next major version, use your decorator with `styled()` instead
   *
   * ```
   * // Example
   * styled(
   *   Component,
   *   yourDecorator(),
   *   { color: 'red' },
   * );
   * ```
   */
  <TProps>(component: StyledComponent<TProps>, ...styles: Styles[]): StyledComponent<TProps>;

  /**
   * @deprecated
   * **Components** as argument to a decorator is deprecated and will be removed in next major version, use your decorator with `styled()` instead
   *
   * ```
   * // Example
   * styled(
   *   Component,
   *   yourDecorator(),
   *   { color: 'red' },
   * );
   * ```
   */
  <TProps extends StyledElementProps>(
    component: StyledElementLike<FunctionComponent<TProps>>,
    ...styles: Styles[]
  ): StyledComponent<WithoutRefProp<TProps>>;

  /**
   * @deprecated
   * **Components** as argument to a decorator is deprecated and will be removed in next major version, use your decorator with `styled()` instead
   *
   * ```
   * // Example
   * styled(
   *   Component,
   *   yourDecorator(),
   *   { color: 'red' },
   * );
   * ```
   */
  <TProps extends StyledElementProps, TInstance extends Component<TProps, ComponentState>>(
    component: StyledElementLike<ClassType<TProps, TInstance, ComponentClass<TProps>>>,
    ...styles: Styles[]
  ): StyledComponentWithRef<TProps, TInstance>;

  /**
   * @deprecated
   * **Components** as argument to a decorator is deprecated and will be removed in next major version, use your decorator with `styled()` instead
   *
   * ```
   * // Example
   * styled(
   *   Component,
   *   yourDecorator(),
   *   { color: 'red' },
   * );
   * ```
   */
  <TProps, TInstance>(
    component: ForwardRefExoticComponent<TProps & RefAttributes<TInstance>>,
    ...styles: Styles[]
  ): StyledComponentWithRef<TProps, TInstance>;

  /**
   * @deprecated
   * **Components** as argument to a decorator is deprecated and will be removed in next major version, use your decorator with `styled()` instead
   *
   * ```
   * // Example
   * styled(
   *   Component,
   *   yourDecorator(),
   *   { color: 'red' },
   * );
   * ```
   */
  <TProps, TInstance extends Component<TProps, ComponentState>>(
    component: ClassType<TProps, TInstance, ComponentClass<TProps>>,
    ...styles: Styles[]
  ): StyledComponentWithRef<TProps, TInstance>;

  /**
   * @deprecated
   * **Styles** as argument to a decorator is deprecated and will be removed in next major version, use your decorator with `styled()` instead
   *
   * ```
   * // Example
   * styled(
   *   yourDecorator(),
   *   { color: 'red' },
   * );
   * ```
   */
  (style: Styles, ...styles: Styles[]): Decorator;

  /** Apply decorator style */
  (): Style[];

  // These last overloads prevents errors on `component` when `style` is
  // incorrect and enables usage of generic parameter to provide prop type

  /**
   * @deprecated
   * **Components** as argument to a decorator is deprecated and will be removed in next major version, use your decorator with `styled()` instead
   *
   * ```
   * // Example
   * styled(
   *   Component,
   *   yourDecorator(),
   *   { color: 'red' },
   * );
   * ```
   */
  (
    component: StyledElementLike<ComponentType<StyledElementProps>> | ComponentType,
    ...styles: Styles[]
  ): StyledComponent<any>;

  /**
   * @deprecated
   * **Styles** as argument to a decorator is deprecated and will be removed in next major version, use your decorator with `styled()` instead
   *
   * ```
   * // Example
   * styled(
   *   yourDecorator(),
   *   { color: 'red' },
   * );
   * ```
   */
  (style: Styles): Decorator;
}

export default function createDecorator(dirtyStyle?: DirtyStyle): Decorator {
  const style = flattenStyle([dirtyStyle]);

  function decorator<TProps>(
    arg1:
      | StyledElementLike<ComponentType<StyledElementProps>>
      | StyledComponentWithRef<any, any>
      | StyledComponent<any>
      | ComponentType,
    ...arg2: Styles[]
  ): StyledComponent<TProps>;

  function decorator<TProps>(...styles: Styles[]): Decorator;

  function decorator<TProps>(): Style[];

  function decorator<TProps>(
    arg1?:
      | StyledElementLike<ComponentType<TProps & StyledElementProps>>
      | StyledComponentWithRef<TProps, any>
      | StyledComponent<TProps>
      | ComponentType<TProps>
      | Styles,
    ...arg2: Styles[]
  ) {
    if (!arg1) {
      return style;
    }

    if (isStyle(arg1)) {
      return createDecorator([style, arg1, arg2]);
    }

    return createComponent<TProps>(arg1, [style, arg2]);
  }

  return decorator;
}

export function isStyle(arg: any): arg is Styles {
  return typeof arg === 'object' && !isElementType(arg) && !isElementLikeType(arg) && !isValidElementType(arg);
}
