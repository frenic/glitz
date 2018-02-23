import { Style } from '@glitz/type';
import GlitzServer from './GlitzServer';

interface TestStyle extends Style {
  '@media (min-width: 100px)'?: Style;
  '@media (min-width: 200px)'?: Style;
  '@media (min-width: 300px)'?: Style;
  '@media (min-width: 768px)'?: Style;
  '@media (min-width: 992px)'?: Style;
}

describe('server', () => {
  it('injects plain rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects shorthand rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(
      server.injectStyle({
        padding: { left: '10px', right: '10px', top: '10px', bottom: '10px' },
      }),
    ).toBe('a b c d');

    expect(
      server.injectStyle({
        margin: { x: '10px' },
      }),
    ).toBe('e f');

    expect(
      server.injectStyle({
        margin: { y: '10px' },
      }),
    ).toBe('g h');

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

    expect(server.injectStyle({ color: 'red', backgroundColor: 'green', borderColor: 'blue' })).toBe('a b c');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects keyframes rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ '@keyframes': { from: { color: 'red' }, to: { color: 'green' } } })).toBe('a');
    expect(server.injectStyle({ animationName: { from: { color: 'blue' }, to: { color: 'white' } } })).toBe('b');
    expect(server.injectStyle({ animation: { name: { from: { color: 'blue' }, to: { color: 'white' } } } })).toBe('b');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects font face rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(
      server.injectStyle({
        '@font-face': {
          fontStyle: 'normal',
          fontWeight: 400,
          src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
        },
      }),
    ).toBe('a');

    expect(
      server.injectStyle({
        fontFamily: {
          fontStyle: 'normal',
          fontWeight: 400,
          src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
        },
      }),
    ).toBe('b');

    expect(
      server.injectStyle({
        font: {
          family: {
            fontStyle: 'normal',
            fontWeight: 400,
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
          },
        },
      }),
    ).toBe('b');

    expect(
      server.injectStyle({
        fontFamily: [
          {
            fontStyle: 'normal',
            fontWeight: 400,
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
          },
          'sans-serif',
        ],
      }),
    ).toBe('c');

    expect(
      server.injectStyle({
        font: {
          family: [
            {
              fontStyle: 'normal',
              fontWeight: 400,
              src:
                "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
            },
            'sans-serif',
          ],
        },
      }),
    ).toBe('c');

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
  it('injects rule deeply', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle([{ color: 'green' }, { color: 'red' }])).toBe('a');

    expect(
      server.injectStyle([
        {
          padding: { left: '10px' },
        },
        {
          paddingLeft: '20px',
        },
      ]),
    ).toBe('b');

    expect(server.injectStyle([{ ':hover': { color: 'green' } }, { ':hover': { color: 'red' } }])).toBe('c');
    expect(
      server.injectStyle([
        { ':first-child': { ':hover': { color: 'green' } } },
        { ':first-child': { ':hover': { color: 'red' } } },
      ]),
    ).toBe('d');

    expect(
      server.injectStyle([
        { '@keyframes': { from: { color: 'red' }, to: { color: 'green' } } },
        { '@keyframes': { from: { color: 'green' }, to: { color: 'blue' } } },
      ]),
    ).toBe('e');
    expect(
      server.injectStyle([
        { animationName: { from: { color: 'blue' }, to: { color: 'white' } } },
        { animationName: { from: { color: 'white' }, to: { color: 'black' } } },
      ]),
    ).toBe('f');

    expect(
      server.injectStyle([
        {
          '@font-face': {
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
          },
        },
        {
          '@font-face': {
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
          },
        },
      ]),
    ).toBe('g');
    expect(
      server.injectStyle([
        {
          '@font-face': {
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
          },
        },
        {
          '@font-face': {
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
          },
        },
      ]),
    ).toBe('h');

    expect(
      server.injectStyle([
        { '@media (min-width: 768px)': { color: 'green' } },
        { '@media (min-width: 768px)': { color: 'red' } },
      ]),
    ).toBe('i');
    expect(
      server.injectStyle([
        { '@media (min-width: 768px)': { ':hover': { color: 'green' } } },
        { '@media (min-width: 768px)': { ':hover': { color: 'red' } } },
      ]),
    ).toBe('j');

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
