import { GlitzServer, ResolvedDeclarations, CommonValue, Style } from '..';
import reboot from '../__fixtures__/reboot';

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
    expect(server.getStyle()).toMatchInlineSnapshot(`".a{color:red}"`);
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

    expect(server.getStyle()).toMatchInlineSnapshot(
      `"@font-face{font-family:x}@keyframes a{from{padding-left:20px}}.a{padding-bottom:10px}.b{padding-top:10px}.c{padding-right:10px}.d{padding-left:10px}.e{grid-column-gap:10px}.f{margin-right:10px}.g{margin-left:10px}.h{margin-bottom:10px}.i{margin-top:10px}.j{margin-bottom:20px}.k{margin-top:20px}.l{margin-right:20px}.m{margin-left:20px}.n{padding-left:30px}.o{animation-name:a}.p{font-family:x}.q{border-bottom-color:green}.r{border-top-color:green}.s{border-right-color:red}.t{border-left-color:red}.u{border-bottom-width:0}.v{border-top-width:0}.w{border-right-width:0}.x{border-left-width:0}.y{border-bottom-right-radius:0}.z{border-bottom-left-radius:0}.a0{border-top-right-radius:0}.a1{border-top-left-radius:0}.a2{border-left-width:20px}.a3{border-right-width:10px}"`,
    );
  });
  it('injects pseudo selector', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(server.getStyle()).toMatchInlineSnapshot(`".a{color:red}.b:hover{color:red}"`);
  });
  it('injects nested pseudo selector', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ ':first-child': { ':hover': { color: 'red' } } })).toBe('a');
    expect(server.getStyle()).toMatchInlineSnapshot(`".a:first-child:hover{color:red}"`);
  });
  it('injects attribute selector', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.injectStyle({ '[disabled]': { color: 'red' } })).toBe('b');
    expect(server.getStyle()).toMatchInlineSnapshot(`".a{color:red}.b[disabled]{color:red}"`);
  });
  it('injects nested attribute selector', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ '[readonly]': { '[disabled]': { color: 'red' } } })).toBe('a');
    expect(server.getStyle()).toMatchInlineSnapshot(`".a[readonly][disabled]{color:red}"`);
  });
  it('injects media rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: 'red' })).toBe('a');
    expect(server.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(server.injectStyle({ '@media (min-width: 768px)': { color: 'red' } })).toBe('c');
    expect(server.injectStyle({ '@media (min-width: 768px)': { ':hover': { color: 'red' } } })).toBe('d');
    expect(server.getStyle()).toMatchInlineSnapshot(
      `".a{color:red}.b:hover{color:red}@media (min-width: 768px){.c{color:red}.d:hover{color:red}}"`,
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

    expect(server.getStyle()).toMatchInlineSnapshot(
      `".d{color:red}@media (min-width: 100px){.b{color:red}}@media (min-width: 200px){.c{color:red}}@media (min-width: 300px){.a{color:red}}"`,
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

    expect(server.getStyle()).toMatchInlineSnapshot(
      `".g{border-left-color:blue}.h{background-color:green}.i{color:red}.d:hover{border-left-color:blue}.e:hover{background-color:green}.f:hover{color:red}@media (min-width: 768px){.a{border-left-color:blue}.b{background-color:green}.c{color:red}}"`,
    );
  });
  it('injects keyframes rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ animationName: { from: { color: 'blue' }, to: { color: 'white' } } })).toBe('a');
    expect(server.injectStyle({ animation: { name: { from: { color: 'blue' }, to: { color: 'white' } } } })).toBe('a');
    expect(server.injectStyle({ animationName: 'some-thing' })).toBe('b');
    expect(server.getStyle()).toMatchInlineSnapshot(
      `"@keyframes a{from{color:blue}to{color:white}}.a{animation-name:a}.b{animation-name:some-thing}"`,
    );
  });
  it('injects font face rule', () => {
    const server = new GlitzServer<TestStyle>();

    expect(
      server.injectStyle({
        fontFamily: {
          fontFamily: 'x',
          fontStyle: 'normal',
          fontWeight: 400,
          src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
        },
      }),
    ).toBe('a');

    expect(
      server.injectStyle({
        font: {
          family: {
            fontFamily: 'x',
            fontStyle: 'normal',
            fontWeight: 400,
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
          },
        },
      }),
    ).toBe('a');

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
    ).toBe('b');

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
    ).toBe('b');

    expect(
      server.injectStyle({
        fontFamily: 'sans-serif',
      }),
    ).toBe('c');

    expect(server.getStyle()).toMatchInlineSnapshot(
      `"@font-face{src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2');font-weight:400;font-style:normal;font-family:x}@font-face{src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2');font-weight:400;font-style:normal;font-family:x}.a{font-family:x}.b{font-family:x,sans-serif}.c{font-family:sans-serif}"`,
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
    expect(server.getStyle()).toMatchInlineSnapshot(
      `".c{color:red}@media (min-width: 992px){.a{color:blue}}@media (min-width: 768px){.b{color:green}}"`,
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
        { animationName: { from: { color: 'blue' }, to: { color: 'white' } } },
        { animationName: { from: { color: 'white' }, to: { color: 'black' } } },
      ]),
    ).toBe('e');

    expect(
      server.injectStyle([
        { '@media (min-width: 768px)': { color: 'green' } },
        { '@media (min-width: 768px)': { color: 'red' } },
      ]),
    ).toBe('f');
    expect(
      server.injectStyle([
        { '@media (min-width: 768px)': { ':hover': { color: 'green' } } },
        { '@media (min-width: 768px)': { ':hover': { color: 'red' } } },
      ]),
    ).toBe('g');

    expect(server.getStyle()).toMatchInlineSnapshot(
      `"@keyframes a{from{color:white}to{color:black}}.a{color:red}.b{padding-left:20px}.e{animation-name:a}.c:hover{color:red}.d:first-child:hover{color:red}@media (min-width: 768px){.f{color:red}.g:hover{color:red}}"`,
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
    expect(server.getStyle()).toMatchInlineSnapshot(
      `"div{color:red;background-color:green}div:hover{color:green}@media (min-width: 768px){div{color:blue}}"`,
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

    expect(server.getStyle()).toMatchInlineSnapshot(`".a{color:red}"`);
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
    expect(server.getStyle()).toMatchInlineSnapshot(
      `"@keyframes a{from{-moz-appearance:none;appearance:none}}.a{animation-name:a}.b{-moz-appearance:none;appearance:none}"`,
    );
  });
  it('passes theme', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: (theme: any) => theme.text }, { text: 'red' })).toBe('a');
    expect(server.getStyle()).toMatchInlineSnapshot(`".a{color:red}"`);
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
    expect(serverA.getStyle()).toMatchInlineSnapshot(
      `".e{color:blue}@media (min-width: 768px){.f{color:blue}}@media (min-width: 992px){.g{color:blue}}"`,
    );
    expect(serverB.injectStyle({ color: 'red' })).toBe('a');
    expect(serverB.injectStyle({ '@media (min-width: 768px)': { color: 'red' } })).toBe('c');
    expect(serverB.injectStyle({ color: 'blue' })).toBe('e');
    expect(serverB.injectStyle({ '@media (min-width: 768px)': { color: 'blue' } })).toBe('f');
    expect(serverB.injectStyle({ '@media (min-width: 992px)': { color: 'blue' } })).toBe('g');
    expect(serverB.getStyle()).toMatchInlineSnapshot(
      `".e{color:blue}@media (min-width: 768px){.f{color:blue}}@media (min-width: 992px){.g{color:blue}}"`,
    );
  });
  it('injects Reboot and hydrates', () => {
    const serverA = new GlitzServer<TestStyle>();

    serverA.injectGlobals(reboot);

    expect(serverA.getStyle()).toMatchInlineSnapshot(
      `"*,*::before,*::after{box-sizing:border-box}body{margin:0;font-family:system-ui, -apple-system, \\"Segoe UI\\", Roboto, \\"Helvetica Neue\\", Arial, \\"Noto Sans\\", \\"Liberation Sans\\", sans-serif, \\"Apple Color Emoji\\", \\"Segoe UI Emoji\\", \\"Segoe UI Symbol\\", \\"Noto Color Emoji\\";font-size:1rem;font-weight:400;line-height:1.5;color:#212529;background-color:#fff;-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:rgba(0, 0, 0, 0)}[tabindex=\\"-1\\"]:focus:not(:focus-visible){outline:0 !important}hr{margin:1rem 0;color:inherit;background-color:currentColor;border:0;opacity:0.25}hr:not([size]){height:1px}h1, h2, h3, h4, h5, h6{margin-top:0;margin-bottom:0.5rem;font-weight:500;line-height:1.2}h1{font-size:calc(1.375rem + 1.5vw)}h2{font-size:calc(1.325rem + 0.9vw)}h3{font-size:calc(1.3rem + 0.6vw)}h4{font-size:calc(1.275rem + 0.3vw)}h5{font-size:1.25rem}h6{font-size:1rem}p{margin-top:0;margin-bottom:1rem}abbr[title],abbr[data-original-title]{text-decoration:underline;text-decoration:underline dotted;-webkit-text-decoration:underline dotted;cursor:help;-webkit-text-decoration-skip-ink:none;text-decoration-skip-ink:none}address{margin-bottom:1rem;font-style:normal;line-height:inherit}ol,ul{padding-left:2rem}ol,ul,dl{margin-top:0;margin-bottom:1rem}ol ol,ul ul,ol ul,ul ol{margin-bottom:0}dt{font-weight:700}dd{margin-bottom:.5rem;margin-left:0}blockquote{margin:0 0 1rem}b,strong{font-weight:bolder}small{font-size:0.875em}mark{padding:0.2em;background-color:#fcf8e3}sub,sup{position:relative;font-size:0.75em;line-height:0;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}a{color:#0d6efd;text-decoration:underline}a:hover{color:#0a58ca}a:not([href]):not([class]), a:not([href]):not([class]):hover{color:inherit;text-decoration:none}pre,code,kbd,samp{font-family:SFMono-Regular, Menlo, Monaco, Consolas, \\"Liberation Mono\\", \\"Courier New\\", monospace;font-size:1em}pre{display:block;margin-top:0;margin-bottom:1rem;overflow:auto;font-size:0.875em;-ms-overflow-style:scrollbar}pre code{font-size:inherit;color:inherit;word-break:normal}code{font-size:0.875em;color:#d63384;word-wrap:break-word}a > code{color:inherit}kbd{padding:0.2rem 0.4rem;font-size:0.875em;color:#fff;background-color:#212529;border-radius:0.2rem}kbd kbd{padding:0;font-size:1em;font-weight:700}figure{margin:0 0 1rem}img,svg{vertical-align:middle}table{caption-side:bottom;border-collapse:collapse}caption{padding-top:0.5rem;padding-bottom:0.5rem;color:#6c757d;text-align:left}th{text-align:inherit;text-align:-webkit-match-parent}thead,tbody,tfoot,tr,td,th{border-color:inherit;border-style:solid;border-width:0}label{display:inline-block}button{border-radius:0}button:focus{outline:1px dotted;outline:5px auto -webkit-focus-ring-color}input,button,select,optgroup,textarea{margin:0;font-family:inherit;font-size:inherit;line-height:inherit}button,input{overflow:visible}button,select{text-transform:none}[role=\\"button\\"]{cursor:pointer}select{word-wrap:normal}[list]::-webkit-calendar-picker-indicator{display:none}button,[type=\\"button\\"],[type=\\"reset\\"],[type=\\"submit\\"]{-webkit-appearance:button}button:not(:disabled),[type=\\"button\\"]:not(:disabled),[type=\\"reset\\"]:not(:disabled),[type=\\"submit\\"]:not(:disabled){cursor:pointer}::-moz-focus-inner{padding:0;border-style:none}textarea{resize:vertical}fieldset{min-width:0;padding:0;margin:0;border:0}legend{float:left;width:100%;padding:0;margin-bottom:0.5rem;font-size:calc(1.275rem + 0.3vw);line-height:inherit;white-space:normal}legend + *{clear:left}::-webkit-datetime-edit-fields-wrapper,::-webkit-datetime-edit-text,::-webkit-datetime-edit-minute,::-webkit-datetime-edit-hour-field,::-webkit-datetime-edit-day-field,::-webkit-datetime-edit-month-field,::-webkit-datetime-edit-year-field{padding:0}::-webkit-inner-spin-button{height:auto}[type=\\"search\\"]{outline-offset:-2px;-webkit-appearance:textfield}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-color-swatch-wrapper{padding:0}::-webkit-file-upload-button{font:inherit;-webkit-appearance:button}output{display:inline-block}iframe{border:0}summary{display:list-item;cursor:pointer}progress{vertical-align:baseline}[hidden]{display:none !important}@media (prefers-reduced-motion: no-preference){:root{scroll-behavior:smooth}}@media (min-width: 1200px){h1{font-size:2.5rem}h2{font-size:2rem}h3{font-size:1.75rem}h4{font-size:1.5rem}legend{font-size:1.5rem}}"`,
    );

    expect(serverA.injectStyle({ color: 'red' })).toBe('a');

    const serverB = new GlitzServer<TestStyle>();
    serverB.hydrate(serverA.getStyle());

    expect(serverB.injectStyle({ color: 'red' })).toBe('a');
  });
  it('recovers from minified hydration', () => {
    const server = new GlitzServer<TestStyle>();

    server.hydrate('.b{color:#f00}@media(min-width: 768px){.a{color:#0f0}}');

    expect(server.injectStyle({ color: 'red' })).toBe('c');
  });
  it('gets markup', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: 'red', '@media (min-width: 768px)': { color: 'green' } })).toBe('a b');
    expect(server.getStyle(true)).toMatchInlineSnapshot(
      `"<style data-glitz>.b{color:red}</style><style data-glitz media=\\"(min-width: 768px)\\">.a{color:green}</style>"`,
    );
  });
  it('gets stream', () => {
    const server = new GlitzServer<TestStyle>();

    expect(server.injectStyle({ color: 'red', '@media (min-width: 768px)': { color: 'green' } })).toBe('a b');
    expect(server.getStyle(false, true)).toMatchInlineSnapshot(
      `".b{color:red}@media (min-width: 768px){.a{color:green}}"`,
    );
    expect(server.injectStyle({ color: 'green' })).toBe('c');
    expect(server.getStyle(false, true)).toMatchInlineSnapshot(`".c{color:green}"`);
  });
});
