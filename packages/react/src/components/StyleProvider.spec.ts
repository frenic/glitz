import { GlitzClient, GlitzServer } from '@glitz/core';
import { mount } from 'enzyme';
import * as React from 'react';
import { styled } from '../styled';
import { StyleContext } from './context';
import { GlitzProvider } from './GlitzProvider';
import { StyleProvider } from './StyleProvider';

describe('StyleProvider', () => {
  it('provides style', () => {
    const Spy: React.FunctionComponent = () => {
      const providedStyle = React.useContext(StyleContext);
      expect(providedStyle).toEqual({
        universal: [{ color: 'red' }],
        a: [{ color: 'green' }, { color: 'blue' }],
        p: [{ color: 'black' }],
      });
      return null;
    };
    mount(
      React.createElement(
        GlitzProvider,
        { glitz: new GlitzClient() },
        React.createElement(
          StyleProvider,
          {
            universal: { color: 'red' },
            include: { a: { color: 'green' } },
            a: { color: 'blue' },
            p: { color: 'black' },
          },
          React.createElement(Spy),
        ),
      ),
    );
  });
  it('renders input with style', () => {
    const glitz = new GlitzServer();

    mount(
      React.createElement(
        GlitzProvider,
        { glitz },
        React.createElement(
          StyleProvider,
          {
            universal: { boxSizing: 'border-box' },
            include: { h1: { lineHeight: 1.2 } },
            h1: { margin: { top: 0, bottom: '10px' } },
          },
          React.createElement(styled.H1),
        ),
      ),
    );

    expect(glitz.getStyleMarkup()).toMatchSnapshot();
  });
  it('renders style', () => {
    const Spy: React.FunctionComponent = () => {
      const providedStyle = React.useContext(StyleContext);
      expect(providedStyle).toEqual({
        universal: [{ color: 'red' }],
        a: [{ color: 'green' }, { color: 'blue' }],
        p: [{ color: 'black' }],
      });
      return null;
    };
    mount(
      React.createElement(
        GlitzProvider,
        { glitz: new GlitzClient() },
        React.createElement(
          StyleProvider,
          {
            universal: { color: 'red' },
            include: { a: { color: 'green' } },
            a: { color: 'blue' },
            p: { color: 'black' },
          },
          React.createElement(Spy),
        ),
      ),
    );
  });
  it('concat styles', () => {
    const Spy: React.FunctionComponent = () => {
      const providedStyle = React.useContext(StyleContext);
      expect(providedStyle).toEqual({
        a: [{ color: 'red' }, { color: 'blue' }],
        p: [{ color: 'green' }, { color: 'black' }],
      });
      return null;
    };
    mount(
      React.createElement(
        GlitzProvider,
        { glitz: new GlitzClient() },
        React.createElement(
          StyleProvider,
          { include: { a: { color: 'red' } }, p: { color: 'green' } },
          React.createElement(
            StyleProvider,
            { include: { a: { color: 'blue' } }, p: { color: 'black' } },
            React.createElement(Spy),
          ),
        ),
      ),
    );
  });
});
