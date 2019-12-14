import { Style } from '@glitz/type';
import * as React from 'react';
import { StyleContext } from '../components/context';
import { isElementLikeType, StyledElementLike } from './apply-class-name';
import { SECRET_COMPOSE } from './constants';
import { StyledDecorator } from './decorator';
import { isElementType, StyledElement } from './predefined';
import { StyledComponent, StyledComponentWithRef, StyledElementProps, StyledProps } from './types';
import useGlitz, { styleToArray } from './use-glitz';

export type WithRefProp<TProps, TInstance> = React.PropsWithoutRef<TProps> & React.RefAttributes<TInstance>;

// Conditionally omit `StyledProps` enables support for union props
export type ExternalProps<TProps> = (TProps extends StyledProps ? Omit<TProps, keyof StyledProps> : TProps) &
  React.PropsWithChildren<{
    css?: StyledDecorator | Style[] | Style;
  }>;

export default function create<TProps>(
  type:
    | StyledElement
    | StyledElementLike<React.ComponentType<TProps & StyledElementProps>>
    | StyledComponent<TProps>
    | StyledComponentWithRef<TProps, any>
    | React.ComponentType<TProps & StyledProps>,
  statics: Style[],
): StyledComponent<TProps>;

export default function create<TProps, TInstance>(
  type:
    | StyledElement
    | StyledElementLike<React.ComponentType<WithRefProp<TProps, TInstance>>>
    | StyledComponentWithRef<TProps, TInstance>
    | React.ComponentType<WithRefProp<TProps, TInstance>>,
  statics: Style[],
): StyledComponentWithRef<TProps, TInstance> {
  return isStyledComponent<TProps, TInstance>(type) ? type[SECRET_COMPOSE](statics) : factory(type, statics);
}

export function factory<TProps, TInstance>(
  type:
    | StyledElement
    | StyledElementLike<React.ComponentType<WithRefProp<TProps, TInstance>>>
    | React.ComponentType<WithRefProp<TProps, TInstance>>,
  statics: Style[],
): StyledComponentWithRef<TProps, TInstance> {
  const Component = isElementType(type)
    ? React.forwardRef((props: ExternalProps<TProps>, ref: React.Ref<TInstance>) => {
        const { css: dynamics, ...restProps } = props;
        const { universal, [type.value]: pre } = React.useContext(StyleContext) ?? {};
        const [apply] = useGlitz(styleToArray(universal, pre, statics, dynamics));

        return React.createElement<any>(type.value, {
          ...restProps,
          className: combineClassNames((props as any).className, apply()),
          ref,
        });
      })
    : isElementLikeType<TProps, TInstance>(type)
    ? React.forwardRef((props: ExternalProps<TProps>, ref: React.Ref<TInstance>) => {
        const { css: dynamics, ...restProps } = props;
        const [apply] = useGlitz(styleToArray(statics, dynamics));

        return React.createElement<any>(type.value, {
          ...restProps,
          className: combineClassNames((props as any).className, apply()),
          ref,
        });
      })
    : isStyledComponent(type)
    ? React.forwardRef((props: ExternalProps<TProps>, ref: React.Ref<TInstance>) => {
        const { css: dynamics, ...restProps } = props;
        const [, compose] = useGlitz(styleToArray(statics, dynamics));
        return React.createElement<any>(type, { ...restProps, css: compose(), ref });
      })
    : React.forwardRef((props: ExternalProps<TProps>, ref: React.Ref<TInstance>) => {
        const { css: dynamics, ...restProps } = props;
        const [, compose] = useGlitz(styleToArray(statics, dynamics));

        return React.createElement<any>(type, { ...restProps, compose, ref });
      });

  const Styled: StyledComponentWithRef<TProps, TInstance> = Object.assign(Component, {
    [SECRET_COMPOSE](additionals?: Style[]) {
      return factory(type, additionals ? statics.concat(additionals) : statics);
    },
  });

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
