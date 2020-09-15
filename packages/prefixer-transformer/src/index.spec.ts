import { GlitzServer } from '@glitz/core';
import prefixer from './';

describe('prefixer', () => {
  it('injects prefixed atomic style', () => {
    const server = new GlitzServer({ transformer: prefixer });

    expect(server.injectStyle({ display: 'flex' })).toBe('a');
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.a{display:-webkit-box;display:-moz-box;display:-ms-flexbox;display:-webkit-flex;display:flex}</style>"`,
    );
  });
  it('injects prefixed non-atomic style', () => {
    const server = new GlitzServer({ transformer: prefixer, atomic: false });

    expect(server.injectStyle({ display: 'flex' })).toBe('a');
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.a{display:-webkit-box;display:-moz-box;display:-ms-flexbox;display:-webkit-flex;display:flex}</style>"`,
    );
  });
});
