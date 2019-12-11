import { GlitzClient } from '@glitz/core';
import { mount } from 'enzyme';
import * as React from 'react';
import { StyleContext } from './context';
import { GlitzProvider } from './GlitzProvider';
import { StyleProvider } from './StyleProvider';

describe('react provider', () => {
  it('provides instance', () => {
    const Spy: React.FunctionComponent = () => {
      const providedStyle = React.useContext(StyleContext);
      expect(providedStyle).toEqual({ a: [{ color: 'red' }, { color: 'green' }], p: [{ color: 'blue' }] });
      return null;
    };
    mount(
      React.createElement(
        GlitzProvider,
        { glitz: new GlitzClient() },
        React.createElement(
          StyleProvider,
          { include: { a: { color: 'red' } }, a: { color: 'green' }, p: { color: 'blue' } },
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
