import { ResolvedDeclarations, ResolvedValue, Style } from '@glitz/type';
import GlitzStatic from './GlitzStatic';

interface TestStyle extends Style {
  '@media (min-width: 100px)'?: Style;
  '@media (min-width: 200px)'?: Style;
  '@media (min-width: 300px)'?: Style;
  '@media (min-width: 768px)'?: Style;
  '@media (min-width: 992px)'?: Style;
}

describe('server', () => {
  it('injects plain rule', () => {
    const server = new GlitzStatic<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.getStyle()).toMatchInlineSnapshot(`".a{color:red}"`);
  });
  it('injects shorthand rule', () => {
    const server = new GlitzStatic<TestStyle>();

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

    expect(server.getStyle()).toMatchInlineSnapshot(
      `"@font-face{font-family:x}@keyframes a{from{padding-left:20px}}.a{padding-left:10px}.b{padding-right:10px}.c{padding-top:10px}.d{padding-bottom:10px}.e{grid-column-gap:10px}.f{margin-left:10px}.g{margin-right:10px}.h{margin-top:10px}.i{margin-bottom:10px}.j{margin-left:20px}.k{margin-right:20px}.l{margin-top:20px}.m{margin-bottom:20px}.n{padding-left:30px}.o{animation-name:a}.p{font-family:x}.q{border-left-width:0}.r{border-right-width:0}.s{border-top-width:0}.t{border-bottom-width:0}.u{border-left-color:red}.v{border-right-color:red}.w{border-top-color:green}.x{border-bottom-color:green}.y{border-top-left-radius:0}.z{border-top-right-radius:0}.a0{border-bottom-left-radius:0}.a1{border-bottom-right-radius:0}.a2{border-right-width:10px}.a3{border-left-width:20px}"`,
    );
  });
  it('injects pseudo selector', () => {
    const server = new GlitzStatic<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(server.getStyle()).toMatchInlineSnapshot(`".a{color:red}.b:hover{color:red}"`);
  });
  it('injects nested pseudo selector', () => {
    const server = new GlitzStatic<TestStyle>();

    expect(server.injectStyle({ ':first-child': { ':hover': { color: 'red' } } })).toBe('a');
    expect(server.getStyle()).toMatchInlineSnapshot(`".a:first-child:hover{color:red}"`);
  });
  it('injects attribute selector', () => {
    const server = new GlitzStatic<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.injectStyle({ '[disabled]': { color: 'red' } })).toBe('b');
    expect(server.getStyle()).toMatchInlineSnapshot(`".a{color:red}.b[disabled]{color:red}"`);
  });
  it('injects nested attribute selector', () => {
    const server = new GlitzStatic<TestStyle>();

    expect(server.injectStyle({ '[readonly]': { '[disabled]': { color: 'red' } } })).toBe('a');
    expect(server.getStyle()).toMatchInlineSnapshot(`".a[readonly][disabled]{color:red}"`);
  });
  it('injects media rule', () => {
    const server = new GlitzStatic<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(server.injectStyle({ '@media (min-width: 768px)': { color: 'red' } })).toBe('c');
    expect(server.injectStyle({ '@media (min-width: 768px)': { ':hover': { color: 'red' } } })).toBe('d');
    expect(server.getStyle()).toMatchInlineSnapshot(
      `".a{color:red}.b:hover{color:red}@media (min-width: 768px){.c{color:red}.d:hover{color:red}}"`,
    );
  });
  it('injects media markup in certain order', () => {
    const server = new GlitzStatic<TestStyle>({
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

    expect(server.getStyle()).toMatchInlineSnapshot(
      `".d{color:red}@media (min-width: 100px){.b{color:red}}@media (min-width: 200px){.c{color:red}}@media (min-width: 300px){.a{color:red}}"`,
    );
  });
  it('injects atomic rules', () => {
    const server = new GlitzStatic<TestStyle>();

    expect(
      server.injectStyle({
        color: 'red',
        background: { color: 'green' },
        borderLeftColor: 'blue',
        ':hover': { color: 'red', background: { color: 'green' }, borderLeftColor: 'blue' },
        '@media (min-width: 768px)': { color: 'red', background: { color: 'green' }, borderLeftColor: 'blue' },
      }),
    ).toBe('a b c d e f g h i');

    expect(server.getStyle()).toMatchInlineSnapshot(
      `".a{color:red}.b{background-color:green}.c{border-left-color:blue}.d:hover{color:red}.e:hover{background-color:green}.f:hover{border-left-color:blue}@media (min-width: 768px){.g{color:red}.h{background-color:green}.i{border-left-color:blue}}"`,
    );
  });
  it('injects non-atomic rules', () => {
    const server = new GlitzStatic<TestStyle>({ atomic: false });

    expect(
      server.injectStyle({
        color: 'red',
        background: { color: 'green' },
        borderLeftColor: 'blue',
        ':hover': { color: 'red', background: { color: 'green' }, borderLeftColor: 'blue' },
        '@media (min-width: 768px)': { color: 'red', background: { color: 'green' }, borderLeftColor: 'blue' },
      }),
    ).toBe('a b c');

    expect(server.getStyle()).toMatchInlineSnapshot(
      `".a{color:red;background-color:green;border-left-color:blue}.b:hover{color:red;background-color:green;border-left-color:blue}@media (min-width: 768px){.c{color:red;background-color:green;border-left-color:blue}}"`,
    );
  });
  it('injects keyframes rule', () => {
    const server = new GlitzStatic<TestStyle>();

    expect(server.injectStyle({ '@keyframes': { from: { color: 'red' }, to: { color: 'green' } } })).toBe('a');
    expect(server.injectStyle({ animationName: { from: { color: 'blue' }, to: { color: 'white' } } })).toBe('b');
    expect(server.injectStyle({ animation: { name: { from: { color: 'blue' }, to: { color: 'white' } } } })).toBe('b');
    expect(server.injectStyle({ animationName: 'some-thing' })).toBe('c');
    expect(server.getStyle()).toMatchInlineSnapshot(
      `"@keyframes a{from{color:red}to{color:green}}@keyframes b{from{color:blue}to{color:white}}.a{animation-name:a}.b{animation-name:b}.c{animation-name:some-thing}"`,
    );
  });
  it('injects font face rule', () => {
    const server = new GlitzStatic<TestStyle>();

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

    expect(server.getStyle()).toMatchInlineSnapshot(
      `"@font-face{font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2');font-family:x}@font-face{font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2');font-family:y}@font-face{font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2');font-family:x}.a{font-family:x}.b{font-family:y}.c{font-family:x,sans-serif}.d{font-family:sans-serif}"`,
    );
  });
  it('injects different combinations', () => {
    const server = new GlitzStatic<TestStyle>();

    expect(
      server.injectStyle({
        color: 'red',
        '@media (min-width: 768px)': { color: 'green' },
        '@media (min-width: 992px)': { color: 'blue' },
      }),
    ).toBe('a b c');
    expect(server.getStyle()).toMatchInlineSnapshot(
      `".a{color:red}@media (min-width: 768px){.b{color:green}}@media (min-width: 992px){.c{color:blue}}"`,
    );
  });
  it('injects rule deeply', () => {
    const server = new GlitzStatic<TestStyle>();

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

    expect(server.getStyle()).toMatchInlineSnapshot(
      `"@font-face{src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2');font-family:y}@font-face{src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2');font-family:z}@keyframes a{from{color:green}to{color:blue}}@keyframes b{from{color:white}to{color:black}}.a{color:red}.b{padding-left:20px}.e{animation-name:a}.f{animation-name:b}.g{font-family:y}.h{font-family:z}.c:hover{color:red}.d:first-child:hover{color:red}@media (min-width: 768px){.i{color:red}.j:hover{color:red}}"`,
    );
  });
  it('preserves order', () => {
    const atomic = new GlitzStatic<TestStyle>();

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

    expect(atomic.getStyle()).toMatchInlineSnapshot(
      `".a{padding-top:20px}.b{color:red}.c{padding-right:30px}.e{padding-left:30px}.d:hover{color:green}"`,
    );

    const nonAtomic = new GlitzStatic<TestStyle>({ atomic: false });

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

    expect(nonAtomic.getStyle()).toMatchInlineSnapshot(
      `".a{padding-top:20px;color:red;padding-right:30px;padding-left:30px}.b:hover{color:green}"`,
    );
  });
  it('deletes properties', () => {
    const server = new GlitzStatic<TestStyle>();

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

    expect(server.getStyle()).toMatchInlineSnapshot(`".a{color:red}"`);
  });
  it('applies transformer', () => {
    const server = new GlitzStatic<TestStyle>({
      transformer: properties => {
        const prefixed: ResolvedDeclarations = {};
        for (const property in properties) {
          const value: ResolvedValue = properties[property];
          if (property === 'appearance' && value === 'none') {
            prefixed.MozAppearance = value;
          }
          prefixed[property] = properties[property];
        }
        return prefixed;
      },
    });

    expect(server.injectStyle({ appearance: 'none', animationName: { from: { appearance: 'none' } } })).toBe('a b');
    expect(server.getStyle()).toMatchInlineSnapshot(
      `"@keyframes a{from{-moz-appearance:none;appearance:none}}.a{-moz-appearance:none;appearance:none}.b{animation-name:a}"`,
    );
  });
  it('passes theme', () => {
    const server = new GlitzStatic<TestStyle>();

    expect(server.injectStyle({ color: (theme: any) => theme.text }, { text: 'red' })).toBe('a');
    expect(server.getStyle()).toMatchInlineSnapshot(`".a{color:red}"`);
  });
});
