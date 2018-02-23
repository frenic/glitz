import { Style } from '@glitz/type';
import * as React from 'react';
import { Context } from '../GlitzProvider';

export interface StyledComponent<TProps> extends React.ComponentClass<TProps & CSSProp & InnerRefProp> {}

export type StyledProps = {
  apply: () => string | undefined;
  compose: (style?: Style) => Style[];
};

export type StyledElementProps = {
  className?: string;
};

export type CSSProp = {
  css?: Style | Style[];
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
  staticStyle: Style[] = [],
): StyledComponent<TProps> {
  if (isStyledComponent(inner)) {
    // @ts-ignore
    return inner[ASSIGN_METHOD](staticStyle);
  }

  let cached: string | null = null;

  class GlitzStyled extends React.Component<TProps & CSSProp & InnerRefProp> {
    public static contextTypes = {
      glitz: () => null, // Just pass the damn thing
    };
    public static displayName: string;
    public static [ASSIGN_METHOD](assigningStyle?: Style) {
      return create(inner, assigningStyle ? staticStyle.concat(assigningStyle) : staticStyle);
    }
    protected apply: () => string | undefined;
    protected compose: (additionalStyle?: Style) => Style[];
    constructor(props: TProps, context: Context) {
      super(props, context);

      this.apply = () => {
        const style = this.compose();

        if (!style) {
          return;
        }

        const isPure = style === staticStyle;

        if (isPure && cached) {
          return cached;
        }

        const classNames = context.glitz.injectStyle(style);

        cached = isPure ? classNames : null;

        return classNames;
      };

      this.compose = additionalStyle => {
        const dynamicStyle: Style | Style[] | undefined = this.props.css;

        if (!dynamicStyle && !additionalStyle) {
          return staticStyle;
        }

        return staticStyle.concat(dynamicStyle || [], additionalStyle || []);
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

            passProps.className = passProps.className ? passProps.className + ' ' + this.apply() : this.apply();

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
