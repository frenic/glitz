import { FeaturedProperties, ResolvedDeclarations, Style } from '@glitz/type';
import GlitzClient from './GlitzClient';

interface TestStyle extends Style {
  '@media (min-width: 100px)'?: Style;
  '@media (min-width: 200px)'?: Style;
  '@media (min-width: 1000px)'?: Style;
  '@media (min-width: 768px)'?: Style;
  '@media (min-width: 992px)'?: Style;
}

beforeEach(() => {
  document.head.innerHTML = '';
});

describe('client', () => {
  it('injects plain rule', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ color: 'red' })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`".a {color: red;}"`);
  });
  it('injects shorthand rule', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();
    const sheet = style.sheet as CSSStyleSheet;

    expect(
      client.injectStyle({
        padding: { left: '10px', right: '10px', top: '10px', bottom: '10px' },
      }),
    ).toBe('a b c d');

    expect(sheet.cssRules).toHaveLength(4);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`".a {padding-bottom: 10px;}"`);
    expect(sheet.cssRules[1].cssText).toMatchInlineSnapshot(`".b {padding-top: 10px;}"`);
    expect(sheet.cssRules[2].cssText).toMatchInlineSnapshot(`".c {padding-right: 10px;}"`);
    expect(sheet.cssRules[3].cssText).toMatchInlineSnapshot(`".d {padding-left: 10px;}"`);

    expect(
      client.injectStyle({
        grid: { column: { gap: '10px' } },
      }),
    ).toBe('e');

    expect(sheet.cssRules).toHaveLength(5);
    expect(sheet.cssRules[4].cssText).toMatchInlineSnapshot(`".e {grid-column-gap: 10px;}"`);

    expect(
      client.injectStyle({
        margin: { x: '10px' },
      }),
    ).toBe('f g');

    expect(sheet.cssRules).toHaveLength(7);
    expect(sheet.cssRules[5].cssText).toMatchInlineSnapshot(`".f {margin-right: 10px;}"`);
    expect(sheet.cssRules[6].cssText).toMatchInlineSnapshot(`".g {margin-left: 10px;}"`);

    expect(
      client.injectStyle({
        margin: { y: '10px' },
      }),
    ).toBe('h i');

    expect(sheet.cssRules).toHaveLength(9);
    expect(sheet.cssRules[7].cssText).toMatchInlineSnapshot(`".h {margin-bottom: 10px;}"`);
    expect(sheet.cssRules[8].cssText).toMatchInlineSnapshot(`".i {margin-top: 10px;}"`);

    expect(
      client.injectStyle({
        margin: { xy: '20px' },
      }),
    ).toBe('j k l m');

    expect(sheet.cssRules).toHaveLength(13);
    expect(sheet.cssRules[9].cssText).toMatchInlineSnapshot(`".j {margin-bottom: 20px;}"`);
    expect(sheet.cssRules[10].cssText).toMatchInlineSnapshot(`".k {margin-top: 20px;}"`);
    expect(sheet.cssRules[11].cssText).toMatchInlineSnapshot(`".l {margin-right: 20px;}"`);
    expect(sheet.cssRules[12].cssText).toMatchInlineSnapshot(`".m {margin-left: 20px;}"`);

    expect(
      client.injectStyle({
        padding: { left: '20px' },
        paddingLeft: '30px',
      }),
    ).toBe('n');

    expect(sheet.cssRules).toHaveLength(14);
    expect(sheet.cssRules[13].cssText).toMatchInlineSnapshot(`".n {padding-left: 30px;}"`);

    expect(
      client.injectStyle({
        animationName: { from: { padding: { left: '20px' } } },
      }),
    ).toBe('o');

    expect(sheet.cssRules).toHaveLength(16);
    expect(sheet.cssRules[14].cssText).toMatchInlineSnapshot(`
      "@keyframes a { 
        from {padding-left: 20px;} 
      }"
    `);
    expect(sheet.cssRules[15].cssText).toMatchInlineSnapshot(`".o {animation-name: a;}"`);

    expect(
      client.injectStyle({
        fontFamily: { fontFamily: 'x' },
      }),
    ).toBe('p');

    expect(sheet.cssRules).toHaveLength(18);
    expect(sheet.cssRules[16].cssText).toMatchInlineSnapshot(`"@font-face {font-family: x;}"`);
    expect(sheet.cssRules[17].cssText).toMatchInlineSnapshot(`".p {font-family: x;}"`);

    expect(
      client.injectStyle({
        border: { xy: { width: 0 }, x: { color: 'red' }, y: { color: 'green' } },
      }),
    ).toBe('q r s t u v w x');

    expect(sheet.cssRules).toHaveLength(26);
    expect(sheet.cssRules[18].cssText).toMatchInlineSnapshot(`".q {border-bottom-color: green;}"`);
    expect(sheet.cssRules[19].cssText).toMatchInlineSnapshot(`".r {border-top-color: green;}"`);
    expect(sheet.cssRules[20].cssText).toMatchInlineSnapshot(`".s {border-right-color: red;}"`);
    expect(sheet.cssRules[21].cssText).toMatchInlineSnapshot(`".t {border-left-color: red;}"`);
    expect(sheet.cssRules[22].cssText).toMatchInlineSnapshot(`".u {border-bottom-width: 0;}"`);
    expect(sheet.cssRules[23].cssText).toMatchInlineSnapshot(`".v {border-top-width: 0;}"`);
    expect(sheet.cssRules[24].cssText).toMatchInlineSnapshot(`".w {border-right-width: 0;}"`);
    expect(sheet.cssRules[25].cssText).toMatchInlineSnapshot(`".x {border-left-width: 0;}"`);

    expect(
      client.injectStyle({
        border: { y: { x: { radius: 0 } } },
      }),
    ).toBe('y z a0 a1');

    expect(sheet.cssRules).toHaveLength(30);
    expect(sheet.cssRules[26].cssText).toMatchInlineSnapshot(`".y {border-bottom-right-radius: 0;}"`);
    expect(sheet.cssRules[27].cssText).toMatchInlineSnapshot(`".z {border-bottom-left-radius: 0;}"`);
    expect(sheet.cssRules[28].cssText).toMatchInlineSnapshot(`".a0 {border-top-right-radius: 0;}"`);
    expect(sheet.cssRules[29].cssText).toMatchInlineSnapshot(`".a1 {border-top-left-radius: 0;}"`);

    expect(
      client.injectStyle({
        border: { x: { width: '10px' }, left: { width: '20px' } },
      }),
    ).toBe('a2 a3');

    expect(sheet.cssRules).toHaveLength(32);
    expect(sheet.cssRules[30].cssText).toMatchInlineSnapshot(`".a2 {border-left-width: 20px;}"`);
    expect(sheet.cssRules[31].cssText).toMatchInlineSnapshot(`".a3 {border-right-width: 10px;}"`);
  });
  it('injects pseudo selector', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ color: 'red' })).toBe('a');
    expect(client.injectStyle({ ':hover': { color: 'red' } })).toBe('b');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[1].cssText).toMatchInlineSnapshot(`".b:hover {color: red;}"`);
  });
  it('injects nested pseudo selector', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ ':first-child': { ':hover': { color: 'red' } } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`".a:first-child:hover {color: red;}"`);
  });
  it('injects attribute selector', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ color: 'red' })).toBe('a');
    expect(client.injectStyle({ '[disabled]': { color: 'red' } })).toBe('b');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[1].cssText).toMatchInlineSnapshot(`".b[disabled] {color: red;}"`);
  });
  it('injects nested attribute selector', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ '[readonly]': { '[disabled]': { color: 'red' } } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`".a[readonly][disabled] {color: red;}"`);
  });
  it('injects mixed selectors', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ '[disabled]': { ':hover': { color: 'red' } } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`".a[disabled]:hover {color: red;}"`);
  });
  it('injects media rule', () => {
    const style = createStyle();
    const media = createStyle('(min-width: 768px)');
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ color: 'red' })).toBe('a');
    expect(client.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(client.injectStyle({ '@media (min-width: 768px)': { color: 'red' } })).toBe('c');
    expect(client.injectStyle({ '@media (min-width: 768px)': { ':hover': { color: 'red' } } })).toBe('d');

    const sheet = style.sheet as CSSStyleSheet;
    const mediaSheet = media.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(mediaSheet.cssRules).toHaveLength(2);
    expect(mediaSheet.cssRules[0].cssText).toMatchInlineSnapshot(`".c {color: red;}"`);
  });
  it('injects media elements in certain order', () => {
    const order = ['(min-width: 100px)', '(min-width: 200px)', '(min-width: 1000px)'];
    const client = new GlitzClient<TestStyle>({
      mediaOrder: (a: string, b: string) => {
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);
        return indexA - indexB;
      },
    });

    expect(client.injectStyle({ '@media (min-width: 1000px)': { color: 'red' } })).toBe('a');
    expect(client.injectStyle({ '@media (min-width: 100px)': { color: 'red' } })).toBe('b');

    expect(document.head.childNodes).toHaveLength(2);
    expect((document.head.childNodes[0] as HTMLStyleElement).media).toBe('(min-width: 100px)');
    expect((document.head.childNodes[1] as HTMLStyleElement).media).toBe('(min-width: 1000px)');

    expect(client.injectStyle({ '@media (min-width: 200px)': { color: 'red' } })).toBe('c');

    expect(document.head.childNodes).toHaveLength(3);
    expect((document.head.childNodes[0] as HTMLStyleElement).media).toBe('(min-width: 100px)');
    expect((document.head.childNodes[1] as HTMLStyleElement).media).toBe('(min-width: 200px)');
    expect((document.head.childNodes[2] as HTMLStyleElement).media).toBe('(min-width: 1000px)');

    expect(client.injectStyle({ '@media (min-width: 1000px)': { color: 'red' } })).toBe('a');
    expect(client.injectStyle({ color: 'red' })).toBe('d');

    expect(document.head.childNodes).toHaveLength(4);
    expect((document.head.childNodes[0] as HTMLStyleElement).media).toBe('');
    expect((document.head.childNodes[1] as HTMLStyleElement).media).toBe('(min-width: 100px)');
    expect((document.head.childNodes[2] as HTMLStyleElement).media).toBe('(min-width: 200px)');
    expect((document.head.childNodes[3] as HTMLStyleElement).media).toBe('(min-width: 1000px)');
  });
  it('cache declarations', () => {
    let count = 0;
    const client = new GlitzClient<TestStyle>({
      transformer: declaration => {
        count++;
        return declaration;
      },
    });

    expect(client.injectStyle({ color: 'red' })).toBe('a');
    expect(client.injectStyle({ color: 'red' })).toBe('a');
    expect(count).toBe(1);
    expect(client.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(client.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(count).toBe(2);
    expect(client.injectStyle({ '@media (min-width: 768px)': { color: 'red' } })).toBe('c');
    expect(client.injectStyle({ '@media (min-width: 768px)': { color: 'red' } })).toBe('c');
    expect(count).toBe(3);
    expect(client.injectStyle({ '@media (min-width: 768px)': { ':hover': { color: 'red' } } })).toBe('d');
    expect(client.injectStyle({ '@media (min-width: 768px)': { ':hover': { color: 'red' } } })).toBe('d');
    expect(count).toBe(4);
  });
  it('injects atomic rules', () => {
    const style = createStyle();
    const media = createStyle('(min-width: 768px)');
    const client = new GlitzClient<TestStyle>();
    const sheet = style.sheet as CSSStyleSheet;
    const mediaSheet = media.sheet as CSSStyleSheet;

    expect(
      client.injectStyle({
        color: 'red',
        background: { color: 'green' },
        borderLeftColor: 'blue',
        ':hover': { color: 'red', background: { color: 'green' }, borderLeftColor: 'blue' },
        '@media (min-width: 768px)': {
          color: 'red',
          background: { color: 'green' },
          borderLeftColor: 'blue',
          ':hover': { color: 'red', background: { color: 'green' }, borderLeftColor: 'blue' },
        },
      }),
    ).toBe('a b c d e f g h i j k l');

    expect(sheet.cssRules).toHaveLength(6);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`".g:hover {border-left-color: blue;}"`);
    expect(sheet.cssRules[1].cssText).toMatchInlineSnapshot(`".h:hover {background-color: green;}"`);
    expect(sheet.cssRules[2].cssText).toMatchInlineSnapshot(`".i:hover {color: red;}"`);
    expect(sheet.cssRules[3].cssText).toMatchInlineSnapshot(`".j {border-left-color: blue;}"`);
    expect(sheet.cssRules[4].cssText).toMatchInlineSnapshot(`".k {background-color: green;}"`);
    expect(sheet.cssRules[5].cssText).toMatchInlineSnapshot(`".l {color: red;}"`);

    expect(mediaSheet.cssRules).toHaveLength(6);
    expect(mediaSheet.cssRules[0].cssText).toMatchInlineSnapshot(`".a:hover {border-left-color: blue;}"`);
    expect(mediaSheet.cssRules[1].cssText).toMatchInlineSnapshot(`".b:hover {background-color: green;}"`);
    expect(mediaSheet.cssRules[2].cssText).toMatchInlineSnapshot(`".c:hover {color: red;}"`);
    expect(mediaSheet.cssRules[3].cssText).toMatchInlineSnapshot(`".d {border-left-color: blue;}"`);
    expect(mediaSheet.cssRules[4].cssText).toMatchInlineSnapshot(`".e {background-color: green;}"`);
    expect(mediaSheet.cssRules[5].cssText).toMatchInlineSnapshot(`".f {color: red;}"`);
  });
  it('injects keyframes rule', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ '@keyframes': { from: { color: 'red' }, to: { color: 'green' } } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`
      "@keyframes a { 
        from {color: red;} 
        to {color: green;} 
      }"
    `);
    expect(sheet.cssRules[1].cssText).toMatchInlineSnapshot(`".a {animation-name: a;}"`);

    expect(client.injectStyle({ animationName: { from: { color: 'blue' }, to: { color: 'white' } } })).toBe('b');

    expect(sheet.cssRules).toHaveLength(4);
    expect(sheet.cssRules[2].cssText).toMatchInlineSnapshot(`
      "@keyframes b { 
        from {color: blue;} 
        to {color: white;} 
      }"
    `);
    expect(sheet.cssRules[3].cssText).toMatchInlineSnapshot(`".b {animation-name: b;}"`);

    expect(client.injectStyle({ animation: { name: { from: { color: 'blue' }, to: { color: 'white' } } } })).toBe('b');

    expect(client.injectStyle({ animationName: 'some-thing' })).toBe('c');

    expect(sheet.cssRules).toHaveLength(5);
    expect(sheet.cssRules[4].cssText).toMatchInlineSnapshot(`".c {animation-name: some-thing;}"`);
  });
  it('injects font face rule', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();

    expect(
      client.injectStyle({
        '@font-face': {
          fontFamily: 'x',
          fontStyle: 'normal',
          fontWeight: 400,
          src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
        },
      }),
    ).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(
      `"@font-face {font-style: normal; font-weight: 400; src: url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2'); font-family: x;}"`,
    );
    expect(sheet.cssRules[1].cssText).toMatchInlineSnapshot(`".a {font-family: x;}"`);

    expect(
      client.injectStyle({
        fontFamily: {
          fontFamily: 'y',
          fontStyle: 'normal',
          fontWeight: 400,
          src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
        },
      }),
    ).toBe('b');

    expect(
      client.injectStyle({
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

    expect(sheet.cssRules).toHaveLength(4);
    expect(sheet.cssRules[2].cssText).toMatchInlineSnapshot(
      `"@font-face {font-style: normal; font-weight: 400; src: url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2'); font-family: y;}"`,
    );
    expect(sheet.cssRules[3].cssText).toMatchInlineSnapshot(`".b {font-family: y;}"`);

    expect(
      client.injectStyle({
        fontFamily: [
          {
            fontFamily: 'z',
            fontStyle: 'normal',
            fontWeight: 400,
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
          },
          'sans-serif',
        ],
      }),
    ).toBe('c');

    expect(
      client.injectStyle({
        font: {
          family: [
            {
              fontFamily: 'z',
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

    expect(sheet.cssRules).toHaveLength(6);
    expect(sheet.cssRules[5].cssText).toMatchInlineSnapshot(`".c {font-family: z,sans-serif;}"`);

    expect(
      client.injectStyle({
        fontFamily: 'sans-serif',
      }),
    ).toBe('d');

    expect(sheet.cssRules).toHaveLength(7);
    expect(sheet.cssRules[6].cssText).toMatchInlineSnapshot(`".d {font-family: sans-serif;}"`);
  });
  it('injects different combinations', () => {
    const style1 = createStyle();
    const style2 = createStyle('(min-width: 768px)');
    const style3 = createStyle('(min-width: 992px)');
    const client = new GlitzClient<TestStyle>();

    expect(
      client.injectStyle({
        color: 'red',
        '@media (min-width: 768px)': { color: 'green' },
        '@media (min-width: 992px)': { color: 'blue' },
      }),
    ).toBe('a b c');

    const sheet1 = style1.sheet as CSSStyleSheet;

    expect(sheet1.cssRules).toHaveLength(1);
    expect(sheet1.cssRules[0].cssText).toMatchInlineSnapshot(`".c {color: red;}"`);

    const sheet2 = style2.sheet as CSSStyleSheet;

    expect(sheet2.cssRules).toHaveLength(1);
    expect(sheet2.cssRules[0].cssText).toMatchInlineSnapshot(`".b {color: green;}"`);

    const sheet3 = style3.sheet as CSSStyleSheet;

    expect(sheet3.cssRules).toHaveLength(1);
    expect(sheet3.cssRules[0].cssText).toMatchInlineSnapshot(`".a {color: blue;}"`);
  });
  it('injects rule deeply', () => {
    const style = createStyle();
    const media = createStyle('(min-width: 768px)');
    const client = new GlitzClient<TestStyle>();
    const sheet = style.sheet as CSSStyleSheet;

    expect(client.injectStyle([{ color: 'green' }, { color: 'red' }])).toBe('a');

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`".a {color: red;}"`);

    expect(
      client.injectStyle([
        {
          padding: { left: '10px' },
        },
        {
          paddingLeft: '20px',
        },
      ]),
    ).toBe('b');

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[1].cssText).toMatchInlineSnapshot(`".b {padding-left: 20px;}"`);

    expect(client.injectStyle([{ ':hover': { color: 'green' } }, { ':hover': { color: 'red' } }])).toBe('c');
    expect(
      client.injectStyle([
        { ':first-child': { ':hover': { color: 'green' } } },
        { ':first-child': { ':hover': { color: 'red' } } },
      ]),
    ).toBe('d');

    expect(sheet.cssRules).toHaveLength(4);
    expect(sheet.cssRules[2].cssText).toMatchInlineSnapshot(`".c:hover {color: red;}"`);
    expect(sheet.cssRules[3].cssText).toMatchInlineSnapshot(`".d:first-child:hover {color: red;}"`);

    expect(
      client.injectStyle([
        { '@keyframes': { from: { color: 'red' }, to: { color: 'green' } } },
        { '@keyframes': { from: { color: 'green' }, to: { color: 'blue' } } },
      ]),
    ).toBe('e');
    expect(
      client.injectStyle([
        { animationName: { from: { color: 'blue' }, to: { color: 'white' } } },
        { animationName: { from: { color: 'white' }, to: { color: 'black' } } },
      ]),
    ).toBe('f');

    expect(sheet.cssRules).toHaveLength(8);
    expect(sheet.cssRules[4].cssText).toMatchInlineSnapshot(`
      "@keyframes a { 
        from {color: green;} 
        to {color: blue;} 
      }"
    `);
    expect(sheet.cssRules[5].cssText).toMatchInlineSnapshot(`".e {animation-name: a;}"`);
    expect(sheet.cssRules[6].cssText).toMatchInlineSnapshot(`
      "@keyframes b { 
        from {color: white;} 
        to {color: black;} 
      }"
    `);
    expect(sheet.cssRules[7].cssText).toMatchInlineSnapshot(`".f {animation-name: b;}"`);

    expect(
      client.injectStyle([
        {
          '@font-face': {
            fontFamily: 'x',
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
          },
        },
        {
          '@font-face': {
            fontFamily: 'x',
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
          },
        },
      ]),
    ).toBe('g');
    expect(
      client.injectStyle([
        {
          '@font-face': {
            fontFamily: 'z',
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

    expect(sheet.cssRules).toHaveLength(12);
    expect(sheet.cssRules[8].cssText).toMatchInlineSnapshot(
      `"@font-face {src: url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2'); font-family: x;}"`,
    );
    expect(sheet.cssRules[9].cssText).toMatchInlineSnapshot(`".g {font-family: x;}"`);
    expect(sheet.cssRules[10].cssText).toMatchInlineSnapshot(
      `"@font-face {src: url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2'); font-family: z;}"`,
    );
    expect(sheet.cssRules[11].cssText).toMatchInlineSnapshot(`".h {font-family: z;}"`);

    const mediaSheet = media.sheet as CSSStyleSheet;

    expect(
      client.injectStyle([
        { '@media (min-width: 768px)': { color: 'green' } },
        { '@media (min-width: 768px)': { color: 'red' } },
      ]),
    ).toBe('i');
    expect(
      client.injectStyle([
        { '@media (min-width: 768px)': { ':hover': { color: 'green' } } },
        { '@media (min-width: 768px)': { ':hover': { color: 'red' } } },
      ]),
    ).toBe('j');

    expect(mediaSheet.cssRules).toHaveLength(2);
    expect(mediaSheet.cssRules[0].cssText).toMatchInlineSnapshot(`".i {color: red;}"`);
    expect(mediaSheet.cssRules[1].cssText).toMatchInlineSnapshot(`".j:hover {color: red;}"`);
  });
  it('deletes properties', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();

    expect(
      client.injectStyle({
        color: 'red',
        paddingRight: '10px',
        padding: { right: undefined },
        animationName: { from: { color: 'red' }, to: { color: 'green' } },
        animation: { name: undefined },
      }),
    ).toBe('a');

    expect(
      client.injectStyle([
        {
          color: 'red',
          paddingRight: '10px',
        },
        {
          paddingRight: (null as any) as undefined,
        },
      ]),
    ).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`".a {color: red;}"`);
  });
  it('hydrates plain rule', () => {
    createStyle(undefined, '.a{color:red}.b{color:green}');
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ color: 'green' })).toBe('b');
  });
  it('hydrates media rule', () => {
    createStyle(undefined, '.a{color:red}.b:hover{color:green}');
    createStyle('(min-width: 768px)', '.c{color:blue}.d:hover{color:white}');
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ '@media (min-width: 768px)': { color: 'blue', ':hover': { color: 'white' } } })).toBe(
      'd c',
    );
  });
  it('hydrates keyframes rule', () => {
    createStyle(
      undefined,
      '.a{animation-name:a}.b{animation-name:b}@keyframes a{from{color:red}to{color:green}}@keyframes b{from{color:blue}to{color:white}}',
    );
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ '@keyframes': { from: { color: 'blue' }, to: { color: 'white' } } })).toBe('b');
    expect(client.injectStyle({ animationName: { from: { color: 'blue' }, to: { color: 'white' } } })).toBe('b');
    expect(client.injectStyle({ animation: { name: { from: { color: 'blue' }, to: { color: 'white' } } } })).toBe('b');
  });
  it('hydrates font face rule', () => {
    createStyle(
      undefined,
      "@font-face{font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2');font-family:x}" +
        "@font-face{font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2');font-family:y}" +
        '.a{font-family:x}.b{font-family:y}.c{font-family:z,sans-serif}',
    );
    const client = new GlitzClient<TestStyle>();

    expect(
      client.injectStyle({
        '@font-face': {
          fontFamily: 'x',
          fontStyle: 'normal',
          fontWeight: 400,
          src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
        },
      }),
    ).toBe('a');
    expect(
      client.injectStyle({
        '@font-face': [
          {
            fontFamily: 'y',
            fontStyle: 'normal',
            fontWeight: 400,
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
          },
          {
            fontFamily: 'y',
            fontStyle: 'normal',
            fontWeight: 400,
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
          },
        ],
      }),
    ).toBe('b');
    expect(
      client.injectStyle({
        fontFamily: [
          {
            fontFamily: 'y',
            fontStyle: 'normal',
            fontWeight: 400,
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
          },
          {
            fontFamily: 'y',
            fontStyle: 'normal',
            fontWeight: 400,
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
          },
        ],
      }),
    ).toBe('b');
    expect(
      client.injectStyle({
        fontFamily: [
          {
            fontFamily: 'z',
            fontStyle: 'normal',
            fontWeight: 400,
            src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2')",
          },
          'sans-serif',
        ],
      }),
    ).toBe('c');
  });
  it('hydrates multiple different combinations', () => {
    createStyle(undefined, '.a{color:red}');
    createStyle('(min-width: 768px)', '.b{color:green}');
    createStyle('(min-width: 992px)', '.c{color:blue}');
    const client = new GlitzClient<TestStyle>();

    expect(
      client.injectStyle({
        color: 'red',
        '@media (min-width: 768px)': { color: 'green' },
        '@media (min-width: 992px)': { color: 'blue' },
      }),
    ).toBe('c b a');
  });
  it('hydrates transformed properties', () => {
    function transformer(style: FeaturedProperties) {
      return {
        ...(Object.keys(style) as (keyof FeaturedProperties)[]).reduce(
          (result, key) => ({ ...result, [`-moz-${key}`]: `${style[key]}px`, [key]: `${style[key]}px` }),
          {},
        ),
      };
    }

    createStyle(undefined, '.a{-moz-column-gap:1px;column-gap:1px}');
    const client = new GlitzClient<TestStyle>({ transformer });

    expect(client.injectStyle({ columnGap: 1 as 0 })).toBe('a');
  });
  it('hydrates static style', () => {
    const client = new GlitzClient<TestStyle>();
    client.hydrate('.a{color:red}.b:hover{color:green}@media (min-width: 768px){.c{color:blue}.d:hover{color:white}}');
    expect(client.injectStyle({ color: 'red', ':hover': { color: 'green' } })).toBe('b a');
    expect(client.injectStyle({ '@media (min-width: 768px)': { color: 'blue', ':hover': { color: 'white' } } })).toBe(
      'd c',
    );
  });
  it('applies transformer', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>({
      transformer: properties => {
        const prefixed: ResolvedDeclarations = {};
        for (const property in properties) {
          const value = properties[property];
          if (property === 'appearance' && value === 'none') {
            prefixed.MozAppearance = value;
          }
          prefixed[property] = properties[property];
        }
        return prefixed;
      },
    });

    expect(client.injectStyle({ appearance: 'none', animationName: { from: { appearance: 'none' } } })).toBe('a b');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(3);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`
      "@keyframes a { 
        from {-moz-appearance: none; appearance: none;} 
      }"
    `);
    expect(sheet.cssRules[1].cssText).toMatchInlineSnapshot(`".a {animation-name: a;}"`);
    expect(sheet.cssRules[2].cssText).toMatchInlineSnapshot(`".b {-moz-appearance: none; appearance: none;}"`);
  });
  it('errors with invalid value type', () => {
    const client = new GlitzClient<TestStyle>();
    const logger = (console.error = jest.fn());
    const value = Symbol();

    try {
      client.injectStyle({ ['color' as any]: value });
    } catch {
      /* noop */
    }

    expect(logger).toHaveBeenCalledWith(
      `Value from property \`color\` has to be a string, number, plain object or array in:

{
  %c"color"%c: %o
}`,
      expect.any(String),
      expect.any(String),
      value,
    );
  });
  it('errors with empty value', () => {
    const client = new GlitzClient<TestStyle>();
    const error = (console.error = jest.fn());
    const warn = (console.warn = jest.fn());

    try {
      client.injectStyle({ ['color' as any]: '' });
    } catch {
      /* noop */
    }

    expect(error).toHaveBeenCalledWith(
      `Value from property \`color\` is an empty string and may cause some unexpected behavior in:

{
  %c"color"%c: %o
}`,
      expect.any(String),
      expect.any(String),
      '',
    );

    expect(warn).toHaveBeenCalledWith(
      `Failed to insert this CSS rule possibly because the selector isn't supported by the browser:

`,
      `.a {
  color: ;
}`,
    );
  });
  it('errors with NaN value', () => {
    const client = new GlitzClient<TestStyle>();
    const logger = (console.error = jest.fn());

    try {
      client.injectStyle({ ['color' as any]: NaN });
    } catch {
      /* noop */
    }

    expect(logger).toHaveBeenCalledWith(
      `Value from property \`color\` is a NaN and may cause some unexpected behavior in:

{
  %c"color"%c: %o
}`,
      expect.any(String),
      expect.any(String),
      NaN,
    );
  });
  it('errors with Infinity value', () => {
    const client = new GlitzClient<TestStyle>();
    const logger = (console.error = jest.fn());

    try {
      client.injectStyle({ ['color' as any]: Infinity });
    } catch {
      /* noop */
    }

    expect(logger).toHaveBeenCalledWith(
      `Value from property \`color\` is an infinite number and may cause some unexpected behavior in:

{
  %c"color"%c: %o
}`,
      expect.any(String),
      expect.any(String),
      Infinity,
    );
  });
  it('warns with empty object value', () => {
    const client = new GlitzClient<TestStyle>();
    const logger = (console.warn = jest.fn());
    const value = {};

    client.injectStyle({ ['color' as any]: value });

    expect(logger).toHaveBeenCalledWith(
      `Value from property \`color\` is an empty object and can be removed in:

{
  %c"color"%c: %o
}`,
      expect.any(String),
      expect.any(String),
      value,
    );
  });
  it('warns with mixed longhand and shorthand', () => {
    const client = new GlitzClient<TestStyle>();
    const logger = (console.warn = jest.fn());

    client.injectStyle({ border: { left: { width: 0 } }, borderLeftWidth: 0 });
    expect(logger).toHaveBeenCalledTimes(0);

    client.injectStyle({ ':hover': { border: 0 }, borderWidth: 0 } as TestStyle);
    expect(logger).toHaveBeenCalledTimes(0);

    client.injectStyle({ border: 0, borderWidth: 0 } as TestStyle);
    expect(logger).toHaveBeenCalledTimes(1);

    client.injectStyle([{ border: 0 }, { borderWidth: 0 }] as TestStyle[]);
    expect(logger).toHaveBeenCalledTimes(2);

    client.injectStyle({ ':hover': { border: 0, borderWidth: 0 } } as TestStyle);
    expect(logger).toHaveBeenCalledTimes(3);
  });
  it('passes theme', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ color: (theme: any) => theme.text }, { text: 'red' })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;
    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`".a {color: red;}"`);
  });
});

function createStyle(media: HTMLLinkElement['media'] = '', css?: string) {
  const element = document.createElement('style');
  element.dataset.glitz = undefined;
  element.media = media;

  if (css) {
    element.appendChild(document.createTextNode(css));
  }

  document.head.appendChild(element);

  return element;
}
