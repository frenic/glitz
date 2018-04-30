import { Style } from '@glitz/type';
import * as React from 'react';
import { Context } from '../GlitzProvider';

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
  inner: string | StyledComponent<TProps> | React.ComponentType<TProps>,
  originalStaticStyle: Style[],
): StyledComponent<TProps> {
  return isStyledComponent(inner)
    ? inner[STYLED_ASSIGN_METHOD](originalStaticStyle)
    : factory(inner, originalStaticStyle);
}

function factory<TProps>(
  inner: string | React.ComponentType<TProps>,
  originalStaticStyle: Style[],
): StyledComponent<TProps> {
  type InnerProps = ExternalProps<TProps>;

  class GlitzStyled extends React.Component<InnerProps & CSSProp & InnerRefProp> {
    public static contextTypes = {
      glitz: () => null, // Just pass the damn thing
    };
    public static displayName: string;
    public static [STYLED_ASSIGN_METHOD](assigningStyle?: Style[]) {
      return factory(inner, assigningStyle ? originalStaticStyle.concat(assigningStyle) : originalStaticStyle);
    }
    constructor(props: InnerProps, context: Context) {
      super(props, context);

      if (process.env.NODE_ENV !== 'production') {
        if (!(context && context.glitz && context.glitz.glitz)) {
          throw new Error(
            "The `<GlitzProvider>` doesn't seem to be used correctly because the core instance couldn't be found",
          );
        }
      }

      const staticStyle: Style | Style[] = context.glitz.options.enableDeepComposition
        ? originalStaticStyle
        : flatten(originalStaticStyle);

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

        const classNames = context.glitz.glitz.injectStyle(styles);

        cache = isPure ? classNames : null;

        return classNames;
      };

      const compose = (additionalStyle?: Style | Style[]): Style | Style[] => {
        const dynamicStyle: Style | Style[] | undefined = this.props.css;

        if (!dynamicStyle && !additionalStyle) {
          return staticStyle;
        }

        const styles = ([] as Style[]).concat(additionalStyle || [], staticStyle, dynamicStyle || []);

        if (context.glitz.options.enableDeepComposition) {
          return styles;
        } else {
          return flatten(styles);
        }
      };

      this.render =
        typeof inner === 'string'
          ? () => {
              const className = (this.props as any).className ? (this.props as any).className + ' ' + apply() : apply();
              const passProps = passingProps<TProps & StyledElementProps>({ className }, this.props);
              return React.createElement(inner, passProps);
            }
          : () => {
              const passProps = passingProps<TProps & StyledProps>({ apply, compose }, this.props);
              return React.createElement(inner, passProps);
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

function flatten(styles: Style[]) {
  const result: Style = {};
  for (const chunk of styles) {
    let property: keyof Style;
    for (property in chunk) {
      result[property] = chunk[property];
    }
  }

  return result;
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
