import { StyleArray, StyleOrStyleArray } from '@glitz/type';
import * as React from 'react';
import { Consumer, Context } from '../components/context';
import { CSSProp, StyledComponent, StyledElementProps, StyledProps } from './types';

export const STYLED_IDENTIFIER = '__a$glitz';
export const APPLY_CLASS_NAME_IDENTIFIER = '__b$glitz';

export type ExternalProps<TProps> = Pick<TProps, Exclude<keyof TProps, keyof StyledProps>>;

type ApplyFunction = () => string | undefined;

export default function create<TProps>(
  Inner: string | StyledComponent<TProps> | React.ComponentType<TProps>,
  originalStaticStyle: StyleArray,
): StyledComponent<TProps> {
  return isStyledComponent(Inner) ? Inner.compose(originalStaticStyle) : factory(Inner, originalStaticStyle);
}

export function factory<TProps>(
  inner: string | React.ComponentType<TProps>,
  staticStyle: StyleArray,
): StyledComponent<TProps> {
  type Props = ExternalProps<TProps> & CSSProp;

  class GlitzStyled extends React.Component<Props> {
    public static displayName: string;
    public static compose(assigningStyle?: StyleArray) {
      return factory(inner, assigningStyle ? staticStyle.concat(assigningStyle) : staticStyle);
    }
    protected static [STYLED_IDENTIFIER] = 1;
    constructor(props: Props) {
      super(props);

      let lastContext: Context | undefined;
      let lastApplier: ApplyFunction | undefined;

      const createApplier = (context: Context): ApplyFunction => {
        if (lastContext === context && lastApplier) {
          return lastApplier;
        }

        let cache: string | null = null;

        lastContext = context;

        return (lastApplier = () => {
          const styles: StyleOrStyleArray = compose();

          if (!styles) {
            return;
          }

          const isPure = styles === staticStyle;

          if (isPure && cache) {
            return cache;
          }

          const classNames = context.glitz.injectStyle(styles);

          cache = isPure ? classNames : null;

          return classNames;
        });
      };

      const compose = (additionalStyle?: StyleOrStyleArray): StyleOrStyleArray => {
        const dynamicStyle: StyleOrStyleArray | undefined = this.props.css;

        if (!dynamicStyle && !additionalStyle) {
          return staticStyle;
        }

        const styles = ([] as StyleArray).concat(additionalStyle || [], staticStyle, dynamicStyle || []);

        return styles;
      };

      const renderer =
        typeof inner === 'string' || (inner as any)[APPLY_CLASS_NAME_IDENTIFIER]
          ? (apply: ApplyFunction) => {
              const className = (this.props as any).className ? (this.props as any).className + ' ' + apply() : apply();
              const passProps = passingProps<TProps & StyledElementProps>({ className }, this.props);
              return React.createElement(inner, passProps);
            }
          : (apply: ApplyFunction) => {
              const passProps = passingProps<TProps & StyledProps>({ apply, compose }, this.props);
              return React.createElement(inner, passProps);
            };

      this.render = () => {
        return React.createElement(Consumer, null, (context: Context) => {
          if (process.env.NODE_ENV !== 'production') {
            if (!(context && context.glitz && context.glitz)) {
              throw new Error(
                "The `<GlitzProvider>` doesn't seem to be used correctly because the core instance couldn't be found",
              );
            }
          }

          return renderer(createApplier(context));
        });
      };
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    GlitzStyled.displayName = `Styled(${
      typeof inner === 'string' ? inner : inner.displayName || inner.name || 'Unknown'
    })`;
  }

  return GlitzStyled;
}

function passingProps<T>(destination: any, props: any): T {
  for (let name in props) {
    const value = props[name];
    if (name !== 'css') {
      if (name === 'innerRef') {
        name = 'ref';
      }
      // Don't override preexisting props
      destination[name] = destination[name] || value;
    }
  }
  return destination;
}

function isStyledComponent<TProps>(
  inner: string | StyledComponent<TProps> | React.ComponentType<TProps>,
): inner is StyledComponent<TProps> {
  return typeof inner === 'function' && !!(inner as any)[STYLED_IDENTIFIER];
}
