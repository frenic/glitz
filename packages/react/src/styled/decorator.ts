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
import type { Style } from '@glitz/core';
import { isElementLikeType, StyledElementLike } from './apply-class-name';
import createComponent, { StyledComponent, StyledComponentWithRef, WithoutRefProp } from './create';
import { Styles } from './custom';
import { sanitizeStyle, DirtyStyle } from './use-glitz';
import { isElementType, StyledElementProps } from './predefined';
import { DECORATOR_TYPE, SECRET_GLITZ_PROPERTY } from './constants';
import { isForwardStyleType } from './forward-style';

export interface StyledDecorator {
  [SECRET_GLITZ_PROPERTY]: typeof DECORATOR_TYPE;

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
  (style: Styles, ...styles: Styles[]): StyledDecorator;

  /** Apply decorator style */
  (): readonly Style[];

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
  (style: Styles): StyledDecorator;
}

export default function createDecorator(dirtyStyle?: DirtyStyle): StyledDecorator {
  const style = sanitizeStyle(dirtyStyle);

  function decorator<TProps>(
    arg1:
      | StyledElementLike<ComponentType<StyledElementProps>>
      | StyledComponentWithRef<any, any>
      | StyledComponent<any>
      | ComponentType,
    ...arg2: Styles[]
  ): StyledComponent<TProps>;

  function decorator(...styles: Styles[]): StyledDecorator;

  function decorator(): Style[];

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

  return Object.assign(decorator, { [SECRET_GLITZ_PROPERTY]: DECORATOR_TYPE });
}

export function isStyle(arg: any): arg is Styles {
  return (
    arg[SECRET_GLITZ_PROPERTY] === DECORATOR_TYPE ||
    (typeof arg === 'object' &&
      !isElementType(arg) &&
      !isElementLikeType(arg) &&
      !isForwardStyleType(arg) &&
      !isValidElementType(arg))
  );
}
