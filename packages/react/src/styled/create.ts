// tslint:disable max-classes-per-file

import { Style } from '@glitz/type';
import * as React from 'react';
import { Consumer, Context } from '../components/context';

export const STYLED_ASSIGN_METHOD = '__GLITZ_ASSIGN';

export type ExternalProps<TProps> = Pick<TProps, Exclude<keyof TProps, keyof StyledProps>>;

// To provide proper type errors for `Style` we create an interface of `Style[]`
// and makes sure it's first in order
export interface ArrayStyle extends Array<Style> {}
export type Styles = ArrayStyle | Style;

export interface StyledComponent<TProps> extends React.ComponentClass<ExternalProps<TProps> & CSSProp & InnerRefProp> {
  [STYLED_ASSIGN_METHOD]: (assigningStyle?: ArrayStyle) => StyledComponent<TProps>;
}

export type StyledProps = {
  apply: () => string | undefined;
  compose: (style?: Styles) => Styles;
};

export type StyledElementProps = {
  className?: string;
};

export type CSSProp = {
  css?: Styles;
};

export type InnerRefProp = {
  innerRef?: React.Ref<any>;
};

export default function create<TProps>(
  Inner: string | StyledComponent<TProps> | React.ComponentType<TProps>,
  originalStaticStyle: ArrayStyle,
): StyledComponent<TProps> {
  return isStyledComponent(Inner)
    ? Inner[STYLED_ASSIGN_METHOD](originalStaticStyle)
    : factory(Inner, originalStaticStyle);
}

export function factory<TProps>(
  Inner: string | React.ComponentType<TProps>,
  staticStyle: ArrayStyle,
): StyledComponent<TProps> {
  type Props = ExternalProps<TProps> & CSSProp & InnerRefProp;
  type InternalProps = {
    props: Readonly<Props>;
    context: Context;
  };

  class GlitzStyled extends React.Component<InternalProps> {
    public static displayName: string;
    constructor(props: InternalProps) {
      super(props);

      if (process.env.NODE_ENV !== 'production') {
        if (!(props.context && props.context.glitz && props.context.glitz)) {
          throw new Error(
            "The `<GlitzProvider>` doesn't seem to be used correctly because the core instance couldn't be found",
          );
        }
      }

      let cache: string | null = null;

      const apply = (): string | undefined => {
        const styles: Styles = compose();

        if (!styles) {
          return;
        }

        const isPure = styles === staticStyle;

        if (isPure && cache) {
          return cache;
        }

        const classNames = this.props.context.glitz.injectStyle(styles);

        cache = isPure ? classNames : null;

        return classNames;
      };

      const compose = (additionalStyle?: Styles): Styles => {
        const dynamicStyle: Styles | undefined = this.props.props.css;

        if (!dynamicStyle && !additionalStyle) {
          return staticStyle;
        }

        const styles = ([] as ArrayStyle).concat(additionalStyle || [], staticStyle, dynamicStyle || []);

        return styles;
      };

      this.render =
        typeof Inner === 'string'
          ? () => {
              const className = (this.props.props as any).className
                ? (this.props.props as any).className + ' ' + apply()
                : apply();
              const passProps = passingProps<TProps & StyledElementProps>({ className }, this.props.props);
              return React.createElement(Inner, passProps);
            }
          : () => {
              const passProps = passingProps<TProps & StyledProps>({ apply, compose }, this.props.props);
              return React.createElement(Inner, passProps);
            };
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    GlitzStyled.displayName = `Styled(${
      typeof Inner === 'string' ? Inner : Inner.displayName || Inner.name || 'Unknown'
    })`;
  }

  class GlitzContext extends React.Component<Props> {
    public static [STYLED_ASSIGN_METHOD](assigningStyle?: ArrayStyle) {
      return factory(Inner, assigningStyle ? staticStyle.concat(assigningStyle) : staticStyle);
    }
    public render() {
      return React.createElement(Consumer, null, (context: Context) =>
        React.createElement(GlitzStyled, {
          props: this.props,
          context,
        }),
      );
    }
  }

  return GlitzContext;
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
  return typeof inner === 'function' && STYLED_ASSIGN_METHOD in inner;
}
