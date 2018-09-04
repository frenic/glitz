import { GlitzClient } from '@glitz/core';
import { mount } from 'enzyme';
import * as React from 'react';
import { styled } from '../styled';
import GlitzProvider from './GlitzProvider';
import ThemeProvider from './ThemeProvider';

describe('react provider', () => {
  it('provides instance', () => {
    const glitz = new GlitzClient();
    const theme = { text: 'red' };
    // @ts-ignore
    mount(
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
