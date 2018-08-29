import { GlitzClient } from '@glitz/core';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { styled } from '../styled';
import GlitzProvider from './GlitzProvider';
import ThemeProvider from './ThemeProvider';

describe('react provider', () => {
  it('provides instance', () => {
    const glitz = new GlitzClient();
    const theme = { text: 'red' };
    // @ts-ignore
    renderer.create(
      React.createElement(
        GlitzProvider,
        {
          glitz,
        },
        React.createElement(
          ThemeProvider,
          { theme },
          React.createElement(styled.Div, {
            css: {
              color: (themeOut: any) => {
                expect(themeOut).toBe(themeOut);
                return 'red';
              },
            },
          }),
        ),
      ),
    );
  });
});
