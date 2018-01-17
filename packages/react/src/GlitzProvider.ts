import GlitzClient from '@glitz/core';
import GlitzServer from '@glitz/core/server';
import * as React from 'react';

export type ProviderProps = {
  glitz: GlitzClient | GlitzServer;
};

export type Context = {
  glitz: GlitzClient | GlitzServer;
};

export default class Provider extends React.Component<ProviderProps> {
  public static childContextTypes = {
    glitz: () => null, //  Just pass the damn thing
  };
  private childContext: Context;
  constructor(props: ProviderProps, context: Context) {
    super(props, context);
    this.childContext = { glitz: props.glitz };
  }
  public getChildContext() {
    return this.childContext;
  }
  public render() {
    return this.props.children;
  }
}
