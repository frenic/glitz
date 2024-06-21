import {
  ComponentType,
  createElement,
  Fragment,
  PropsWithChildren,
  useCallback,
  useContext,
  RefAttributes,
  PropsWithoutRef,
  NamedExoticComponent,
} from 'react';
import { isElementLikeType, StyledElementLike } from './apply-class-name';
import { SECRET_GLITZ_PROPERTY } from './constants';
import { isElementType, StyledElement, StyledElementProps } from './predefined';
import useGlitz, { DirtyStyle, sanitizeStyle } from './use-glitz';
import { ComposeContext, emptyComposeContext, GlitzContext, StreamContext } from '../components/context';
import { isForwardStyleType, StyledForwardStyle, WithoutCompose } from './forward-style';

export interface StyledComponent<TProps> extends NamedExoticComponent<ExternalProps<TProps>> {
  [SECRET_GLITZ_PROPERTY](style?: DirtyStyle): StyledComponent<TProps>;
}

export interface StyledComponentWithRef<TProps, TInstance>
  extends NamedExoticComponent<WithRefProp<ExternalProps<TProps>, TInstance>> {
  [SECRET_GLITZ_PROPERTY](style?: DirtyStyle): StyledComponentWithRef<TProps, TInstance>;
}

export type WithRefProp<TProps, TInstance> = PropsWithoutRef<TProps> & RefAttributes<TInstance>;

export type ExternalProps<TProps> = PropsWithChildren<
  TProps & {
    css?: DirtyStyle;
  }
>;

export default function createComponent<TProps>(
  type:
    | StyledElement
    | StyledElementLike<ComponentType<TProps & StyledElementProps>>
    | StyledForwardStyle<ComponentType<TProps>>
    | StyledComponent<TProps>
    | ComponentType<TProps>,
  statics: DirtyStyle,
): StyledComponent<TProps> {
  return isStyledComponent<TProps>(type) ? type[SECRET_GLITZ_PROPERTY](statics) : factory(type, statics);
}

export function factory<TProps>(
  type:
    | StyledElement
    | StyledElementLike<ComponentType<TProps>>
    | StyledForwardStyle<ComponentType<TProps>>
    | ComponentType<TProps>,
  statics: DirtyStyle,
): StyledComponent<TProps> {
  const Component =
    isElementType(type) || isElementLikeType<TProps>(type)
      ? ({ css: dynamic, ...restProps }: ExternalProps<TProps>) => {
          const composed = useContext(ComposeContext);
          const className = combineClassNames((restProps as any).className, useGlitz([statics, dynamic, composed]));

          let node = createElement<any>(type.value, {
            ...restProps,
            className,
          });

          if (composed && restProps.children) {
            // Reset ComposeContext
            node = createElement(ComposeContext.Provider, emptyComposeContext, node);
          }

          const stream = useContext(StreamContext);
          const glitz = useContext(GlitzContext);

          if (stream && glitz && 'getStyle' in glitz) {
            // React stream rendering
            const style = glitz.getStyle(false, true);

            if (style) {
              node = createElement(
                Fragment,
                null,
                createElement('style', {
                  [`data-${glitz.identifier}`]: '',
                  dangerouslySetInnerHTML: { __html: style },
                }),
                node,
              );
            }
          }

          return node;
        }
      : isForwardStyleType<TProps>(type)
        ? ({ css: dynamic, ...restProps }: ExternalProps<WithoutCompose<TProps>>) => {
            const composed = useContext(ComposeContext);
            const compose = useCallback(
              (additional: DirtyStyle) => sanitizeStyle([additional, statics, dynamic, composed]),
              [composed, dynamic],
            );

            let node = createElement<any>(type.value, { ...restProps, compose });

            if (composed && restProps.children) {
              // Reset ComposeContext
              node = createElement(ComposeContext.Provider, emptyComposeContext, node);
            }

            return node;
          }
        : ({ css: dynamic, ...restProps }: ExternalProps<TProps>) => {
            const composed = useContext(ComposeContext);
            const style = sanitizeStyle([statics, dynamic, composed]);
            let node = createElement<any>(type, { ...restProps });

            if (style.length > 0) {
              node = createElement(ComposeContext.Provider, { value: style }, node);
            }

            return node;
          };

  const Styled: StyledComponent<TProps> = Object.assign(Component, {
    [SECRET_GLITZ_PROPERTY](additional?: DirtyStyle) {
      const NewStyled = factory(type, [statics, additional]);

      // TODO: remove any. It's strange why Component doesn't have displayName since StyledComponent extends NamedExoticComponent
      if (process.env.NODE_ENV !== 'production') {
        NewStyled.displayName = (Component as any).displayName;
      }

      return NewStyled;
    },
  }) as any;

  if (process.env.NODE_ENV !== 'production') {
    if (!isForwardStyleType<TProps>(type)) {
      const inner = isElementType(type) || isElementLikeType<TProps>(type) ? type.value : type;
      Styled.displayName = `Styled(${
        typeof inner === 'string' ? inner : inner.displayName || inner.name || 'Unknown'
      })`;
    }
  }

  return Styled;
}

function combineClassNames(a: string | undefined, b: string | undefined) {
  return a && b ? `${a} ${b}` : a ? a : b;
}

export function isStyledComponent<TProps>(type: any): type is StyledComponent<TProps> {
  return typeof type[SECRET_GLITZ_PROPERTY] === 'function';
}
