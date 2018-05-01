// tslint:disable max-classes-per-file

import { Style } from '@glitz/type';
import * as React from 'react';
import { Consumer, Context } from '../components/context';

export const STYLED_ASSIGN_METHOD = '__GLITZ_ASSIGN';

export type ExternalProps<TProps> = Pick<TProps, Exclude<keyof TProps, keyof StyledProps>>;

export interface StyledComponent<TProps> extends React.ComponentClass<ExternalProps<TProps> & CSSProp & InnerRefProp> {
  [STYLED_ASSIGN_METHOD]: (assigningStyle?: Style[]) => StyledComponent<TProps>;
}

export type StyledProps = {
  apply: () => string | undefined;
  compose: (style?: Style | Style[]) => Style | Style[];
};

export type StyledElementProps = {
  className?: string;
};

export type CSSProp = {
  // `any[]` details type error details on `Style`, should be `Style[]` when conditional types are released
  css?: Style | any[];
};

export type InnerRefProp = {
  innerRef?: React.Ref<any>;
};

export default function create<TProps>(
  Inner: string | StyledComponent<TProps> | React.ComponentType<TProps>,
  originalStaticStyle: Style[],
): StyledComponent<TProps> {
  return isStyledComponent(Inner)
    ? Inner[STYLED_ASSIGN_METHOD](originalStaticStyle)
    : factory(Inner, originalStaticStyle);
}

export function factory<TProps>(
  Inner: string | React.ComponentType<TProps>,
  staticStyle: Style[],
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
        const styles: Style | Style[] = compose();

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

      const compose = (additionalStyle?: Style | Style[]): Style | Style[] => {
        const dynamicStyle: Style | Style[] | undefined = this.props.props.css;

        if (!dynamicStyle && !additionalStyle) {
          return staticStyle;
        }

        const styles = ([] as Style[]).concat(additionalStyle || [], staticStyle, dynamicStyle || []);

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
    public static [STYLED_ASSIGN_METHOD](assigningStyle?: Style[]) {
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
