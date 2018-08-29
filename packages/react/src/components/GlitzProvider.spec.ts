import { GlitzClient } from '@glitz/core';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { GlitzContext, GlitzContextConsumer } from './context';
import GlitzProvider from './GlitzProvider';

describe('react provider', () => {
  it('provides instance', () => {
    const glitz = new GlitzClient();
    // @ts-ignore
    const Spy: React.StatelessComponent<GlitzContext> = props => {
      expect(props.glitz).toBe(glitz);
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
        React.createElement(GlitzContextConsumer, null, (value: GlitzContext) => React.createElement(Spy, value)),
      ),
    );
  });
});
