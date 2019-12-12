// tslint:disable max-classes-per-file

import { GlitzServer } from '@glitz/core';
import { GlitzProvider, styled, StyleProvider } from '@glitz/react';
import { mount } from 'enzyme';
import * as React from 'react';
import glitzReboot from '.';

describe('reboot', () => {
  it('renders input with reboot style', () => {
    const glitz = new GlitzServer();

    mount(
      React.createElement(
        GlitzProvider,
        { glitz },
        React.createElement(StyleProvider, { include: glitzReboot() }, React.createElement(styled.Input)),
      ),
    );

    expect(glitz.getStyleMarkup()).toMatchSnapshot();
  });
  it('overrides style', () => {
    const glitz = new GlitzServer();

    mount(
      React.createElement(
        GlitzProvider,
        { glitz },
        React.createElement(
          StyleProvider,
          { include: glitzReboot() },
          React.createElement(styled.P, {
            css: { marginBottom: '1em' },
          }),
        ),
      ),
    );

    expect(glitz.getStyleMarkup()).toMatchSnapshot();
  });
});
