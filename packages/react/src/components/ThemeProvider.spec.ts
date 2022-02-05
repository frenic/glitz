/**
 * @jest-environment jsdom
 */

import { GlitzClient } from '@glitz/core';
import { render } from '@testing-library/react';
import * as React from 'react';
import { ThemeContext } from './context';
import { GlitzProvider } from './GlitzProvider';
import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
  it('provides instance', () => {
    const theme = { text: 'red' };
    const Spy: React.FunctionComponent = () => {
      const providedTheme = React.useContext(ThemeContext);
      expect(providedTheme).toBe(theme);
      return React.createElement('div');
    };
    render(
      React.createElement(
        GlitzProvider,
        { glitz: new GlitzClient() },
        React.createElement(ThemeProvider, { theme }, React.createElement(Spy)),
      ),
    );
  });
});
