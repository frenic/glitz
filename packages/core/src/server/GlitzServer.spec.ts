import { ResolvedDeclarations, CommonValue, Style } from '@glitz/type';
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
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(`"<style data-glitz>.a{color:red}</style>"`);
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
        fontFamily: { fontFamily: 'x' },
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

    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>@font-face{font-family:x}@keyframes a{from{padding-left:20px}}.a{padding-bottom:10px}.b{padding-top:10px}.c{padding-right:10px}.d{padding-left:10px}.e{grid-column-gap:10px}.f{margin-right:10px}.g{margin-left:10px}.h{margin-bottom:10px}.i{margin-top:10px}.j{margin-bottom:20px}.k{margin-top:20px}.l{margin-right:20px}.m{margin-left:20px}.n{padding-left:30px}.o{animation-name:a}.p{font-family:x}.q{border-bottom-color:green}.r{border-top-color:green}.s{border-right-color:red}.t{border-left-color:red}.u{border-bottom-width:0}.v{border-top-width:0}.w{border-right-width:0}.x{border-left-width:0}.y{border-bottom-right-radius:0}.z{border-bottom-left-radius:0}.a0{border-top-right-radius:0}.a1{border-top-left-radius:0}.a2{border-left-width:20px}.a3{border-right-width:10px}</style>"`,
    );
  });
  it('injects pseudo selector', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.a{color:red}.b:hover{color:red}</style>"`,
    );
  });
  it('injects nested pseudo selector', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ ':first-child': { ':hover': { color: 'red' } } })).toBe('a');
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.a:first-child:hover{color:red}</style>"`,
    );
  });
  it('injects attribute selector', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.injectStyle({ '[disabled]': { color: 'red' } })).toBe('b');
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.a{color:red}.b[disabled]{color:red}</style>"`,
    );
  });
  it('injects nested attribute selector', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ '[readonly]': { '[disabled]': { color: 'red' } } })).toBe('a');
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.a[readonly][disabled]{color:red}</style>"`,
    );
  });
  it('injects media rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(server.injectStyle({ '@media (min-width: 768px)': { color: 'red' } })).toBe('c');
    expect(server.injectStyle({ '@media (min-width: 768px)': { ':hover': { color: 'red' } } })).toBe('d');
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.a{color:red}.b:hover{color:red}</style><style data-glitz media=\\"(min-width: 768px)\\">.c{color:red}.d:hover{color:red}</style>"`,
    );
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

    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.d{color:red}</style><style data-glitz media=\\"(min-width: 100px)\\">.b{color:red}</style><style data-glitz media=\\"(min-width: 200px)\\">.c{color:red}</style><style data-glitz media=\\"(min-width: 300px)\\">.a{color:red}</style>"`,
    );
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

    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.g{border-left-color:blue}.h{background-color:green}.i{color:red}.d:hover{border-left-color:blue}.e:hover{background-color:green}.f:hover{color:red}</style><style data-glitz media=\\"(min-width: 768px)\\">.a{border-left-color:blue}.b{background-color:green}.c{color:red}</style>"`,
    );
  });
  it('injects keyframes rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ '@keyframes': { from: { color: 'red' }, to: { color: 'green' } } })).toBe('a');
    expect(server.injectStyle({ animationName: { from: { color: 'blue' }, to: { color: 'white' } } })).toBe('b');
    expect(server.injectStyle({ animation: { name: { from: { color: 'blue' }, to: { color: 'white' } } } })).toBe('b');
    expect(server.injectStyle({ animationName: 'some-thing' })).toBe('c');
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>@keyframes a{from{color:red}to{color:green}}@keyframes b{from{color:blue}to{color:white}}.a{animation-name:a}.b{animation-name:b}.c{animation-name:some-thing}</style>"`,
    );
  });
  it('injects font face rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(
      server.injectStyle({
        '@font-face': {
          fontFamily: 'x',
          fontStyle: 'normal',
          fontWeight: 400,
          src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
        },
      }),
    ).toBe('a');

    expect(
      server.injectStyle({
        fontFamily: {
          fontFamily: 'y',
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
            fontFamily: 'y',
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
            fontFamily: 'x',
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
              fontFamily: 'x',
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

    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>@font-face{src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2');font-weight:400;font-style:normal;font-family:x}@font-face{src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2');font-weight:400;font-style:normal;font-family:y}@font-face{src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2');font-weight:400;font-style:normal;font-family:x}.a{font-family:x}.b{font-family:y}.c{font-family:x,sans-serif}.d{font-family:sans-serif}</style>"`,
    );
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
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.c{color:red}</style><style data-glitz media=\\"(min-width: 992px)\\">.a{color:blue}</style><style data-glitz media=\\"(min-width: 768px)\\">.b{color:green}</style>"`,
    );
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
            fontFamily: 'x',
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
          },
        },
        {
          '@font-face': {
            fontFamily: 'y',
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
          },
        },
      ]),
    ).toBe('g');
    expect(
      server.injectStyle([
        {
          '@font-face': {
            fontFamily: 'y',
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
          },
        },
        {
          '@font-face': {
            fontFamily: 'z',
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

    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>@font-face{src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2');font-family:y}@font-face{src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2');font-family:z}@keyframes a{from{color:green}to{color:blue}}@keyframes b{from{color:white}to{color:black}}.a{color:red}.b{padding-left:20px}.e{animation-name:a}.f{animation-name:b}.g{font-family:y}.h{font-family:z}.c:hover{color:red}.d:first-child:hover{color:red}</style><style data-glitz media=\\"(min-width: 768px)\\">.i{color:red}.j:hover{color:red}</style>"`,
    );
  });
  it('injects global rule', () => {
    const server = new GlitzServer<TestStyle>();

    server.injectGlobals({
      div: {
        color: 'red',
        backgroundColor: 'green',
        ':hover': { color: 'green' },
        '@media (min-width: 768px)': { color: 'blue' },
      },
    });
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>div{color:red;background-color:green}div:hover{color:green}</style><style data-glitz media=\\"(min-width: 768px)\\">div{color:blue}</style>"`,
    );
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

    expect(server.getStyleMarkup()).toMatchInlineSnapshot(`"<style data-glitz>.a{color:red}</style>"`);
  });
  it('applies transformer', () => {
    const server = new GlitzServer<TestStyle>({
      transformer: properties => {
        const prefixed: ResolvedDeclarations = {};
        for (const property in properties) {
          const value: CommonValue = properties[property];
          if (property === 'appearance' && value === 'none') {
            prefixed.MozAppearance = value;
          }
          prefixed[property] = properties[property];
        }
        return prefixed;
      },
    });

    expect(server.injectStyle({ appearance: 'none', animationName: { from: { appearance: 'none' } } })).toBe('a b');
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>@keyframes a{from{-moz-appearance:none;appearance:none}}.a{animation-name:a}.b{-moz-appearance:none;appearance:none}</style>"`,
    );
  });
  it('passes theme', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: (theme: any) => theme.text }, { text: 'red' })).toBe('a');
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(`"<style data-glitz>.a{color:red}</style>"`);
  });
  it('hydrates and resets', () => {
    const serverA = new GlitzServer<TestStyle>();

    serverA.hydrate('.a{color:red}.b{color:green}@media (min-width: 768px){.c{color:red}.d{color:green}}');
    const serverB = serverA.clone();
    expect(serverA.injectStyle({ color: 'red' })).toBe('a');
    expect(serverA.injectStyle({ '@media (min-width: 768px)': { color: 'red' } })).toBe('c');
    expect(serverA.injectStyle({ color: 'blue' })).toBe('e');
    expect(serverA.injectStyle({ '@media (min-width: 768px)': { color: 'blue' } })).toBe('f');
    expect(serverA.injectStyle({ '@media (min-width: 992px)': { color: 'blue' } })).toBe('g');
    expect(serverA.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.e{color:blue}</style><style data-glitz media=\\"(min-width: 768px)\\">.f{color:blue}</style><style data-glitz media=\\"(min-width: 992px)\\">.g{color:blue}</style>"`,
    );
    expect(serverB.injectStyle({ color: 'red' })).toBe('a');
    expect(serverB.injectStyle({ '@media (min-width: 768px)': { color: 'red' } })).toBe('c');
    expect(serverB.injectStyle({ color: 'blue' })).toBe('e');
    expect(serverB.injectStyle({ '@media (min-width: 768px)': { color: 'blue' } })).toBe('f');
    expect(serverB.injectStyle({ '@media (min-width: 992px)': { color: 'blue' } })).toBe('g');
    expect(serverB.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.e{color:blue}</style><style data-glitz media=\\"(min-width: 768px)\\">.f{color:blue}</style><style data-glitz media=\\"(min-width: 992px)\\">.g{color:blue}</style>"`,
    );
  });
});
