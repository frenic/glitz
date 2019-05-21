import { GlitzClient } from '@glitz/core';
import { mount } from 'enzyme';
import * as React from 'react';
import { ThemeContext } from './context';
import GlitzProvider from './GlitzProvider';
import ThemeProvider from './ThemeProvider';

describe('react provider', () => {
  it('provides instance', () => {
    const theme = { text: 'red' };
    const Spy: React.FunctionComponent = () => {
      const providedTheme = React.useContext(ThemeContext);
      expect(providedTheme).toBe(theme);
      return React.createElement('div');
    };
    mount(
      React.createElement(
        GlitzProvider,
        { glitz: new GlitzClient() },
        React.createElement(ThemeProvider, { theme }, React.createElement(Spy)),
      ),
    );
  });
});
