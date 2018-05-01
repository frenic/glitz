import * as React from 'react';
import { Context, Provider } from './context';

export default class GlitzProvider extends React.Component<Context> {
  public render() {
    return React.createElement(Provider, { value: this.props }, this.props.children);
  }
}
