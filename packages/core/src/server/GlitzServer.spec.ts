import { Style } from '@glitz/type';
import GlitzServer from './GlitzServer';

interface TestStyle extends Style {
  '@media (min-width: 100px)'?: Style;
  '@media (min-width: 200px)'?: Style;
  '@media (min-width: 300px)'?: Style;
  '@media (min-width: 768px)'?: Style;
  '@media (min-width: 992px)'?: Style;
  spacing?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

describe('server', () => {
  it('injects plain rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects pseudo rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects nested pseudo rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ ':first-child': { ':hover': { color: 'red' } } })).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects media rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(server.injectStyle({ '@media (min-width: 768px)': { color: 'red' } })).toBe('c');
    expect(server.injectStyle({ '@media (min-width: 768px)': { ':hover': { color: 'red' } } })).toBe('d');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects media markup in certain order', () => {
    const server = new GlitzServer<TestStyle>({
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

    expect(server.injectStyle({ '@media (min-width: 300px)': { color: 'red' } })).toBe('a');
    expect(server.injectStyle({ '@media (min-width: 100px)': { color: 'red' } })).toBe('b');
    expect(server.injectStyle({ '@media (min-width: 200px)': { color: 'red' } })).toBe('c');
    expect(server.injectStyle({ color: 'red' })).toBe('d');

    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects atomic rules', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: 'red', background: 'green', border: 'blue' })).toBe('a b c');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects keyframes rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ '@keyframes': { from: { color: 'red' }, to: { color: 'green' } } })).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();

    expect(server.injectStyle({ animationName: { from: { color: 'blue' }, to: { color: 'white' } } })).toBe('b');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects different combinations', () => {
    const server = new GlitzServer<TestStyle>();

    expect(
      server.injectStyle({
        color: 'red',
        '@media (min-width: 768px)': { color: 'green' },
        '@media (min-width: 992px)': { color: 'blue' },
      }),
    ).toBe('a b c');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('applies transformer', () => {
    const server = new GlitzServer<TestStyle>({
      transformer: properties => ({ ...properties, mozAppearance: 'none' }),
    });

    expect(server.injectStyle({ appearance: 'none' })).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
});
