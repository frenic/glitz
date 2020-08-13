import { GlitzClient } from '@glitz/core';
import { mount } from 'enzyme';
import * as React from 'react';
import { GlitzProvider } from './GlitzProvider';
import { StyleAbsorber } from './StyleAbsorber';
import { styled } from '../styled';

describe('StyleAbsorber', () => {
  it('composes style', () => {
    const glitz = new GlitzClient();
    const Spy = styled(
      () =>
        React.createElement(StyleAbsorber, {
          children(compose) {
            expect(compose({ borderBottomColor: 'blue' })).toEqual([
              { borderBottomColor: 'blue' },
              { borderRightColor: 'green' },
              { borderTopColor: 'red' },
            ]);
            return React.createElement(styled.Div, {
              css: compose({ borderBottomColor: 'blue' }),
              ref: el => expect(el?.className).toBe('a b c'),
            });
          },
        }),
      { borderRightColor: 'green' },
    );
    mount(React.createElement(GlitzProvider, { glitz }, React.createElement(Spy, { css: { borderTopColor: 'red' } })));
  });
  it('prevent forward of style', () => {
    const glitz = new GlitzClient();
    const Spy = styled(
      () =>
        React.createElement(StyleAbsorber, {
          children() {
            return React.createElement(styled.Div, {
              ref: el => expect(el?.className).toBe(''),
            });
          },
        }),
      { borderRightColor: 'green' },
    );
    mount(React.createElement(GlitzProvider, { glitz }, React.createElement(Spy)));
  });
});
