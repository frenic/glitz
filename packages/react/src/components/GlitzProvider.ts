import * as React from 'react';
import { GlitzContext, GlitzContextProvider } from './context';

export default class GlitzProvider extends React.Component<GlitzContext> {
  public render() {
    return React.createElement(GlitzContextProvider, { value: this.props }, this.props.children);
  }
}
