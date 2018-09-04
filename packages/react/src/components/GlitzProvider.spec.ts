import { GlitzClient } from '@glitz/core';
import { mount } from 'enzyme';
import * as React from 'react';
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
    mount(
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
