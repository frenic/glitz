import GlitzClient from '@glitz/core';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import GlitzProvider from './GlitzProvider';

describe('react provider', () => {
  it('provides instance', () => {
    const glitz = new GlitzClient();
    // @ts-ignore
    const Spy: React.StatelessComponent<any> = (props, context) => {
      expect(context.glitz).toBe(glitz);
      return React.createElement('div');
    };
    Spy.contextTypes = {
      glitz: () => null,
    };
    renderer.create(
      React.createElement(
        GlitzProvider,
        {
          glitz,
        },
        React.createElement(Spy),
      ),
    );
  });
});
