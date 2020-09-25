import { Style } from '@glitz/type';
import {
  PropsWithoutRef,
  RefAttributes,
  PropsWithChildren,
  ComponentType,
  forwardRef,
  createElement,
  Ref,
  PropsWithRef,
} from 'react';
import { isElementLikeType, StyledElementLike } from './apply-class-name';
import { SECRET_COMPOSE } from './constants';
import { isElementType, StyledElement } from './predefined';
import { StyledComponent, StyledComponentWithRef, StyledElementProps } from './types';
import useGlitz, { DirtyStyle } from './use-glitz';
import { useAbsorb, useForward } from './compose';
import { useStream } from './stream';

export type WithRefProp<TProps, TInstance> = PropsWithoutRef<TProps> & RefAttributes<TInstance>;
export type WithoutRefProp<TProps> = TProps extends PropsWithRef<TProps> ? PropsWithoutRef<TProps> : TProps;

// Conditionally omit `StyledProps` enables support for union props
export type ExternalProps<TProps> = PropsWithChildren<
  TProps & {
    css?: Style[] | Style | false;
  }
>;

export default function createComponent<TProps>(
  type:
    | StyledElement
    | StyledElementLike<ComponentType<TProps & StyledElementProps>>
    | StyledComponent<TProps>
    | StyledComponentWithRef<TProps, any>
    | ComponentType<TProps>,
  statics: DirtyStyle,
): StyledComponent<TProps>;

export default function createComponent<TProps, TInstance>(
  type:
    | StyledElement
    | StyledElementLike<ComponentType<WithRefProp<TProps, TInstance>>>
    | StyledComponentWithRef<TProps, TInstance>
    | ComponentType<WithRefProp<TProps, TInstance>>,
  statics: DirtyStyle,
): StyledComponentWithRef<TProps, TInstance> {
  return isStyledComponent<TProps, TInstance>(type) ? type[SECRET_COMPOSE](statics) : factory(type, statics);
}

export function factory<TProps, TInstance>(
  type:
    | StyledElement
    | StyledElementLike<ComponentType<WithRefProp<TProps, TInstance>>>
    | ComponentType<WithRefProp<TProps, TInstance>>,
  statics: DirtyStyle,
): StyledComponentWithRef<TProps, TInstance> {
  const Component =
    isElementType(type) || isElementLikeType<TProps, TInstance>(type)
      ? forwardRef(({ css: dynamic, ...restProps }: ExternalProps<TProps>, ref: Ref<TInstance>) =>
          useAbsorb(absorbed => {
            const className = combineClassNames((restProps as any).className, useGlitz([statics, dynamic, absorbed]));

            return useStream(
              createElement<any>(type.value, {
                ...restProps,
                className,
                ref,
              }),
            );
          }),
        )
      : forwardRef(({ css: dynamic, ...restProps }: ExternalProps<TProps>, ref: Ref<TInstance>) =>
          useForward(
            statics,
            dynamic,
            createElement<any>(type, { ...restProps, ref }),
          ),
        );

  const Styled: StyledComponentWithRef<TProps, TInstance> = Object.assign(Component, {
    [SECRET_COMPOSE](additionals?: DirtyStyle) {
      const NewStyled = factory(type, [statics, additionals]);

      if (Component.defaultProps) {
        NewStyled.defaultProps = {};

        for (const name in Component.defaultProps) {
          (NewStyled.defaultProps as any)[name] = (Component.defaultProps as any)[name];
        }
      }

      if (process.env.NODE_ENV !== 'production') {
        NewStyled.displayName = Component.displayName;
      }

      return NewStyled;
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
