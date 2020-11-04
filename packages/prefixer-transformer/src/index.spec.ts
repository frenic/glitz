import { GlitzServer } from '@glitz/core';
import prefixer from './';

describe('prefixer', () => {
  it('injects prefixed atomic style', () => {
    const server = new GlitzServer({ transformer: prefixer });

    expect(server.injectStyle({ display: 'flex' })).toBe('a');
    expect(server.getStyle()).toMatchInlineSnapshot(
      `".a{display:-webkit-box;display:-moz-box;display:-ms-flexbox;display:-webkit-flex;display:flex}"`,
    );
  });
});
