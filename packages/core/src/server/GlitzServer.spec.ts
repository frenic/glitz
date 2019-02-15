import { Properties, Style } from '@glitz/type';
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
        grid: { column: { gap: '10px' } },
      }),
    ).toBe('e');

    expect(
      server.injectStyle({
        margin: { x: '10px' },
      }),
    ).toBe('f g');

    expect(
      server.injectStyle({
        margin: { y: '10px' },
      }),
    ).toBe('h i');

    expect(
      server.injectStyle({
        margin: { xy: '20px' },
      }),
    ).toBe('j k l m');

    expect(
      server.injectStyle({
        padding: { left: '20px' },
        paddingLeft: '30px',
      }),
    ).toBe('n');

    expect(
      server.injectStyle({
        animationName: { from: { padding: { left: '20px' } } },
      }),
    ).toBe('o');

    expect(
      server.injectStyle({
        fontFamily: { font: { weight: 'bold' } },
      }),
    ).toBe('p');

    expect(
      server.injectStyle({
        border: { xy: { width: 0 }, x: { color: 'red' }, y: { color: 'green' } },
      }),
    ).toBe('q r s t u v w x');

    expect(
      server.injectStyle({
        border: { y: { x: { radius: 0 } } },
      }),
    ).toBe('y z a0 a1');

    expect(
      server.injectStyle({
        border: { x: { width: '10px' }, left: { width: '20px' } },
      }),
    ).toBe('a2 a3');

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

    expect(
      server.injectStyle({
        color: 'red',
        background: { color: 'green' },
        borderLeftColor: 'blue',
        ':hover': { color: 'red', background: { color: 'green' }, borderLeftColor: 'blue' },
        '@media (min-width: 768px)': { color: 'red', background: { color: 'green' }, borderLeftColor: 'blue' },
      }),
    ).toBe('a b c d e f g h i');

    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects non-atomic rules', () => {
    const server = new GlitzServer<TestStyle>({ atomic: false });

    expect(
      server.injectStyle({
        color: 'red',
        background: { color: 'green' },
        borderLeftColor: 'blue',
        ':hover': { color: 'red', background: { color: 'green' }, borderLeftColor: 'blue' },
        '@media (min-width: 768px)': { color: 'red', background: { color: 'green' }, borderLeftColor: 'blue' },
      }),
    ).toBe('a b c');

    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects keyframes rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ '@keyframes': { from: { color: 'red' }, to: { color: 'green' } } })).toBe('a');
    expect(server.injectStyle({ animationName: { from: { color: 'blue' }, to: { color: 'white' } } })).toBe('b');
    expect(server.injectStyle({ animation: { name: { from: { color: 'blue' }, to: { color: 'white' } } } })).toBe('b');
    expect(server.injectStyle({ animationName: 'some-thing' })).toBe('c');
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

    expect(
      server.injectStyle({
        fontFamily: 'sans-serif',
      }),
    ).toBe('d');

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
  it('preserves order', () => {
    const atomic = new GlitzServer<TestStyle>();

    expect(
      atomic.injectStyle({
        padding: { left: '20px', right: '20px', top: '20px' },
        color: 'red',
        paddingRight: '30px',
        ':hover': {
          color: 'green',
        },
        paddingLeft: '30px',
      }),
    ).toBe('a b c d e');

    expect(atomic.getStyleMarkup()).toMatchSnapshot();

    const nonAtomic = new GlitzServer<TestStyle>({ atomic: false });

    expect(
      nonAtomic.injectStyle({
        padding: { left: '20px', right: '20px', top: '20px' },
        color: 'red',
        paddingRight: '30px',
        ':hover': {
          color: 'green',
        },
        paddingLeft: '30px',
      }),
    ).toBe('a b');

    expect(nonAtomic.getStyleMarkup()).toMatchSnapshot();
  });
  it('deletes properties', () => {
    const server = new GlitzServer<TestStyle>();

    expect(
      server.injectStyle({
        color: 'red',
        paddingRight: '10px',
        padding: { right: undefined },
        animationName: { from: { color: 'red' }, to: { color: 'green' } },
        animation: { name: undefined },
      }),
    ).toBe('a');

    expect(
      server.injectStyle([
        {
          color: 'red',
          paddingRight: '10px',
        },
        {
          paddingRight: (null as any) as undefined,
        },
      ]),
    ).toBe('a');

    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('applies transformer', () => {
    const server = new GlitzServer<TestStyle>({
      transformer: properties => {
        const prefixed: Properties = {};
        let property: keyof Properties;
        for (property in properties) {
          const value = properties[property];
          if (property === 'appearance' && value === 'none') {
            prefixed.MozAppearance = value;
          }
          prefixed[property] = properties[property] as Properties[typeof property];
        }
        return prefixed;
      },
    });

    expect(server.injectStyle({ appearance: 'none', animationName: { from: { appearance: 'none' } } })).toBe('a b');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('passes theme', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: (theme: any) => theme.text }, { text: 'red' })).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
});
