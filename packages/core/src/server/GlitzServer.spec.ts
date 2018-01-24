import { Style } from '@glitz/type';
import GlitzServer from './GlitzServer';

describe('server', () => {
  it('injects plain rule', () => {
    const server = new GlitzServer();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects pseudo rule', () => {
    const server = new GlitzServer();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects nested pseudo rule', () => {
    const server = new GlitzServer();

    expect(server.injectStyle({ ':first-child': { ':hover': { color: 'red' } } })).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects media rule', () => {
    const server = new GlitzServer();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(server.injectStyle({ '@media (min-width: 768px)': { color: 'red' } } as Style)).toBe('c');
    expect(server.injectStyle({ '@media (min-width: 768px)': { ':hover': { color: 'red' } } } as Style)).toBe('d');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects media markup in certain order', () => {
    const server = new GlitzServer({
      mediaOrder: (a: string, b: string) => {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      },
    });

    expect(server.injectStyle({ '@media (min-width: 300px)': { color: 'red' } } as Style)).toBe('a');
    expect(server.injectStyle({ '@media (min-width: 100px)': { color: 'red' } } as Style)).toBe('b');
    expect(server.injectStyle({ '@media (min-width: 200px)': { color: 'red' } } as Style)).toBe('c');
    expect(server.injectStyle({ color: 'red' })).toBe('d');

    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects atomic rules', () => {
    const server = new GlitzServer();

    expect(server.injectStyle({ color: 'red', background: 'green', border: 'blue' })).toBe('a b c');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects keyframes rule', () => {
    const server = new GlitzServer();

    expect(server.injectStyle({ '@keyframes': { from: { color: 'red' }, to: { color: 'green' } } })).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects different combinations', () => {
    const server = new GlitzServer();

    expect(
      server.injectStyle({
        color: 'red',
        '@media (min-width: 768px)': { color: 'green' },
        '@media (min-width: 992px)': { color: 'blue' },
      } as Style),
    ).toBe('a b c');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
});
