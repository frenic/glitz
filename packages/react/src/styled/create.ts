import {
  ComponentType,
  createElement,
  forwardRef,
  ForwardRefExoticComponent,
  Fragment,
  PropsWithChildren,
  PropsWithoutRef,
  PropsWithRef,
  Ref,
  RefAttributes,
  useContext,
  useMemo,
} from 'react';
import { GlitzServer } from '@glitz/core';
import { isElementLikeType, StyledElementLike } from './apply-class-name';
import { SECRET_GLITZ_PROPERTY } from './constants';
import { isElementType, StyledElement, StyledElementProps } from './predefined';
import useGlitz, { DirtyStyle } from './use-glitz';
import { ComposeContext, emptyComposeContext, GlitzContext, StreamContext } from '../components/context';

export interface StyledComponent<TProps> extends ForwardRefExoticComponent<ExternalProps<TProps>> {
  [SECRET_GLITZ_PROPERTY](style?: DirtyStyle): StyledComponent<TProps>;
}

export interface StyledComponentWithRef<TProps, TInstance>
  extends ForwardRefExoticComponent<WithRefProp<ExternalProps<TProps>, TInstance>> {
  [SECRET_GLITZ_PROPERTY](style?: DirtyStyle): StyledComponentWithRef<TProps, TInstance>;
}

export type WithRefProp<TProps, TInstance> = PropsWithoutRef<TProps> & RefAttributes<TInstance>;
export type WithoutRefProp<TProps> = TProps extends PropsWithRef<TProps> ? PropsWithoutRef<TProps> : TProps;

export type ExternalProps<TProps> = PropsWithChildren<
  TProps & {
    css?: DirtyStyle;
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
  return isStyledComponent<TProps, TInstance>(type) ? type[SECRET_GLITZ_PROPERTY](statics) : factory(type, statics);
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
      ? forwardRef(({ css: dynamic, ...restProps }: ExternalProps<TProps>, ref: Ref<TInstance>) => {
          const composed = useContext(ComposeContext);
          const className = combineClassNames((restProps as any).className, useGlitz([statics, dynamic, composed]));

          let node = createElement<any>(type.value, {
            ...restProps,
            className,
            ref,
          });

          if (composed) {
            // Reset ComposeContext
            node = createElement(ComposeContext.Provider, emptyComposeContext, node);
          }

          const stream = useContext(StreamContext);
          const glitz = useContext(GlitzContext);

          if (stream && glitz instanceof GlitzServer) {
            // React stream rendering
            const style = glitz.getStyleStream();

            if (style) {
              // tslint:disable-next-line: variable-name
              const [tag, props, __html] = style;
              node = createElement(
                Fragment,
                null,
                createElement(tag, {
                  ...props,
                  dangerouslySetInnerHTML: { __html },
                }),
                node,
              );
            }
          }

          return node;
        })
      : forwardRef(({ css: dynamic, ...restProps }: ExternalProps<TProps>, ref: Ref<TInstance>) => {
          const forwarded = useContext(ComposeContext);
          const context = useMemo(() => ({ value: [statics, forwarded, dynamic] }), [statics, forwarded, dynamic]);
          return createElement(
            ComposeContext.Provider,
            context,
            createElement<any>(type, { ...restProps, ref }),
          );
        });

  const Styled: StyledComponentWithRef<TProps, TInstance> = Object.assign(Component, {
    [SECRET_GLITZ_PROPERTY](additionals?: DirtyStyle) {
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
  return typeof type[SECRET_GLITZ_PROPERTY] === 'function';
}
