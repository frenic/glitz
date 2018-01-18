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

type InnerType<TProps> = React.ComponentType<TProps & StyledProps> | StyledComponent<TProps> | string;

function passingProps(props: any) {
  const newProps = { ...props };

  delete newProps.css;

  if (newProps.innerRef) {
    newProps.ref = newProps.innerRef;
    delete newProps.innerRef;
  }

  return newProps;
}

const ASSIGN_METHOD = '__GLITZ_ASSIGN';

function isStyledComponent<TProps>(inner: InnerType<TProps>): inner is StyledComponent<TProps> {
  return typeof inner === 'function' && ASSIGN_METHOD in inner;
}

function isCustomComponent<TProps>(inner: InnerType<TProps>): inner is React.ComponentType<TProps & StyledProps> {
  return typeof inner === 'function';
}

export function create<TProps>(
  inner: React.ComponentType<TProps & StyledProps> | StyledComponent<TProps> | string,
  staticStyle?: Style,
): StyledComponent<TProps> {
  if (isStyledComponent(inner)) {
    // @ts-ignore
    return inner[ASSIGN_METHOD](staticStyle);
  }

  class GlitzStyled extends React.Component<TProps & CSSProp & InnerRefProp> {
    public static contextTypes = {
      glitz: () => null, // Just pass the damn thing
    };
    public static displayName: string;
    public static [ASSIGN_METHOD](assigningStyle?: Style) {
      return create(inner, assigningStyle ? { ...staticStyle, ...assigningStyle } : staticStyle);
    }
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

      this.render = isCustomComponent(inner)
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
    GlitzStyled.displayName = `Styled(${
      typeof inner === 'string' ? inner : inner.displayName || inner.name || 'Unknown'
    })`;
  }

  return GlitzStyled;
}
