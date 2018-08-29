import * as React from 'react';
import { ThemeContext, ThemeContextProvider } from './context';

export default class GlitzProvider extends React.Component<ThemeContext> {
  public render() {
    return React.createElement(ThemeContextProvider, { value: this.props }, this.props.children);
  }
}
