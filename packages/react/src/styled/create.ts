import { Style } from '@glitz/core';
import * as React from 'react';
import { Context } from '../GlitzProvider';

export interface StyledComponent<TProps> extends React.ComponentClass<TProps & CSSProp & InnerRefProp> {}

export type StyledProps = {
  apply: () => string;
  compose: (style?: Style) => Style | undefined;
};

export type StyledElementProps = {
  className?: string;
};

export type CSSProp = {
  css?: Style;
};

export type InnerRefProp = {
  innerRef?: React.Ref<any>;
};

function passingProps(props: any) {
  const newProps = { ...props };

  delete newProps.css;

  if (newProps.innerRef) {
    newProps.ref = newProps.innerRef;
    delete newProps.innerRef;
  }

  return newProps;
}

export function create<TProps>(
  inner: React.ComponentType<TProps & StyledProps> | string,
  staticStyle?: Style,
): StyledComponent<TProps> {
  class Component extends React.Component<TProps & CSSProp & InnerRefProp> {
    public static contextTypes = {
      glitz: () => null, //  Just pass the damn thing
    };
    public static displayName: string;
    protected apply: () => string;
    protected compose: (additionalStyle?: Style) => Style | undefined;
    constructor(props: TProps, context: Context) {
      super(props, context);

      this.apply = () => {
        const composedStyle = this.compose();
        return composedStyle ? context.glitz.injectStyle(composedStyle) : '';
      };

      this.compose = additionalStyle => {
        const dynamicStyle: Style | undefined = this.props.css;

        if (!dynamicStyle && !additionalStyle) {
          return staticStyle;
        }

        return { ...staticStyle, ...dynamicStyle, ...additionalStyle };
      };

      this.render =
        typeof inner === 'function'
          ? () => {
              const passProps: TProps & StyledProps = passingProps(this.props);

              passProps.apply = this.apply;
              passProps.compose = this.compose;

              return React.createElement(inner, passProps);
            }
          : () => {
              const passProps: TProps & StyledElementProps = passingProps(this.props);

              passProps.className = this.apply();

              return React.createElement(inner, passProps);
            };
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    Component.displayName = `Styled(${
      typeof inner === 'string' ? inner : inner.displayName || inner.name || 'Unknown'
    })`;
  }

  return Component;
}
