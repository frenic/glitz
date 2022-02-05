/**
 * @jest-environment jsdom
 */

import { GlitzClient } from '@glitz/core';
import { render } from '@testing-library/react';
import * as React from 'react';
import { GlitzContext } from './context';
import { GlitzProvider } from './GlitzProvider';

describe('GlitzProvider', () => {
  it('provides instance', () => {
    const glitz = new GlitzClient();
    const Spy: React.FunctionComponent = () => {
      const providedGlitz = React.useContext(GlitzContext);
      expect(providedGlitz).toBe(glitz);
      return React.createElement('div');
    };
    render(React.createElement(GlitzProvider, { glitz }, React.createElement(Spy)));
  });
});
