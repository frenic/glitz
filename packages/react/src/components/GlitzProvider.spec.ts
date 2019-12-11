import { GlitzClient } from '@glitz/core';
import { mount } from 'enzyme';
import * as React from 'react';
import { GlitzContext } from './context';
import { GlitzProvider } from './GlitzProvider';

describe('react provider', () => {
  it('provides instance', () => {
    const glitz = new GlitzClient();
    const Spy: React.FunctionComponent = () => {
      const providedGlitz = React.useContext(GlitzContext);
      expect(providedGlitz).toBe(glitz);
      return React.createElement('div');
    };
    mount(React.createElement(GlitzProvider, { glitz }, React.createElement(Spy)));
  });
});
