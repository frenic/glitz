import GlitzServer from '@glitz/core/server';
import prefixer from './prefixer';

describe('prefixer', () => {
  it('injects prefixed style', () => {
    const server = new GlitzServer({ transformer: prefixer });

    expect(server.injectStyle({ display: 'flex' })).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
});
