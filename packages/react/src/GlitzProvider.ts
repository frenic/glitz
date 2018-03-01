import GlitzClient from '@glitz/core';
import GlitzServer from '@glitz/core/server';
import * as React from 'react';

export type ProviderOptions = {
  enableDeepComposition?: boolean;
};

export type ProviderProps = {
  glitz: GlitzClient | GlitzServer;
  options?: ProviderOptions;
};

export type Context = {
  glitz: {
    glitz: GlitzClient | GlitzServer;
    options: ProviderOptions;
  };
};

export default class GlitzProvider extends React.Component<ProviderProps> {
  public static childContextTypes = {
    glitz: () => null, //  Just pass the damn thing
  };
  private childContext: Context;
  constructor(props: ProviderProps, context: Context) {
    super(props, context);
    this.childContext = {
      glitz: {
        glitz: props.glitz,
        options: props.options || {},
      },
    };
  }
  public getChildContext() {
    return this.childContext;
  }
  public render() {
    return this.props.children;
  }
}
