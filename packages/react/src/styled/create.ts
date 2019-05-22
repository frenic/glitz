import { StyleArray, StyleOrStyleArray } from '@glitz/type';
import * as React from 'react';
import { isElementLikeType, StyledElementLike } from './apply-class-name';
import { StyledDecorator } from './decorator';
import { SECRET_COMPOSE } from './internals';
import { isElementType, StyledElement } from './predefined';
import { StyledComponent, StyledComponentWithRef, StyledProps } from './types';
import useStyle, { styleToArray } from './use-style';

export type WithRefProp<TProps, TInstance> = React.PropsWithoutRef<TProps> & React.RefAttributes<TInstance>;

export type ExternalProps<TProps> = React.PropsWithChildren<
  Pick<TProps, Exclude<keyof TProps, keyof StyledProps>> & {
    css?: StyleOrStyleArray | StyledDecorator;
  }
>;

export default function create<TProps>(
  type:
    | StyledElement
    | StyledElementLike<React.ComponentType<TProps>>
    | StyledComponent<TProps>
    | React.ComponentType<TProps>,
  statics: StyleArray,
): StyledComponent<TProps>;

export default function create<TProps, TInstance>(
  type:
    | StyledElement
    | StyledElementLike<React.ComponentType<WithRefProp<TProps, TInstance>>>
    | StyledComponentWithRef<TProps, TInstance>
    | React.ComponentType<WithRefProp<TProps, TInstance>>,
  statics: StyleArray,
): StyledComponentWithRef<TProps, TInstance> {
  return isStyledComponent<TProps, TInstance>(type) ? type[SECRET_COMPOSE](statics) : factory(type, statics);
}

export function factory<TProps, TInstance>(
  type:
    | StyledElement
    | StyledElementLike<React.ComponentType<WithRefProp<TProps, TInstance>>>
    | React.ComponentType<WithRefProp<TProps, TInstance>>,
  statics: StyleArray,
): StyledComponentWithRef<TProps, TInstance> {
  const Styled: StyledComponentWithRef<TProps, TInstance> = Object.assign(
    React.forwardRef<TInstance, ExternalProps<TProps>>((props, ref) => {
      const { css: dynamics, ...restProps } = props;
      const [apply, compose] = useStyle(styleToArray(statics, dynamics));

      if (isElementType(type) || isElementLikeType<TProps, TInstance>(type)) {
        return React.createElement<any>(type.value, {
          ...restProps,
          className: combineClassNames((props as any).className, apply()),
          ref,
        });
      }

      if (isStyledComponent(type)) {
        return React.createElement<any>(type, { ...restProps, css: compose(), ref });
      }

      return React.createElement<any>(type, { ...restProps, compose, ref });
    }),
    {
      [SECRET_COMPOSE](additionals?: StyleArray) {
        return factory(type, additionals ? statics.concat(additionals) : statics);
      },
    },
  );

  if (process.env.NODE_ENV !== 'production') {
    const inner = isElementType(type) || isElementLikeType<TProps, TInstance>(type) ? type.value : type;
    Styled.displayName = `Styled(${typeof inner === 'string' ? inner : inner.displayName || inner.name || 'Unknown'})`;
  }

  return Styled;
}

function combineClassNames(a: string | undefined, b: string | undefined) {
  return a && b ? `${a} ${b}` : a ? a : b;
}

export function isStyledComponent<TProps, TInstance>(
  type: any,
): type is StyledComponent<TProps> | StyledComponentWithRef<TProps, TInstance> {
  return SECRET_COMPOSE in type;
}
