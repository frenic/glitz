import { Properties, Style, UntransformedProperties } from '@glitz/type';
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
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
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
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();
    expect(sheet.cssRules[2].cssText).toMatchSnapshot();
    expect(sheet.cssRules[3].cssText).toMatchSnapshot();

    expect(
      client.injectStyle({
        grid: { column: { gap: '10px' } },
      }),
    ).toBe('e');

    expect(sheet.cssRules).toHaveLength(5);
    expect(sheet.cssRules[4].cssText).toMatchSnapshot();

    expect(
      client.injectStyle({
        margin: { x: '10px' },
      }),
    ).toBe('f g');

    expect(sheet.cssRules).toHaveLength(7);
    expect(sheet.cssRules[5].cssText).toMatchSnapshot();
    expect(sheet.cssRules[6].cssText).toMatchSnapshot();

    expect(
      client.injectStyle({
        margin: { y: '10px' },
      }),
    ).toBe('h i');

    expect(sheet.cssRules).toHaveLength(9);
    expect(sheet.cssRules[7].cssText).toMatchSnapshot();
    expect(sheet.cssRules[8].cssText).toMatchSnapshot();

    expect(
      client.injectStyle({
        margin: { xy: '20px' },
      }),
    ).toBe('j k l m');

    expect(sheet.cssRules).toHaveLength(13);
    expect(sheet.cssRules[9].cssText).toMatchSnapshot();
    expect(sheet.cssRules[10].cssText).toMatchSnapshot();
    expect(sheet.cssRules[11].cssText).toMatchSnapshot();
    expect(sheet.cssRules[12].cssText).toMatchSnapshot();

    expect(
      client.injectStyle({
        padding: { left: '20px' },
        paddingLeft: '30px',
      }),
    ).toBe('n');

    expect(sheet.cssRules).toHaveLength(14);
    expect(sheet.cssRules[13].cssText).toMatchSnapshot();

    expect(
      client.injectStyle({
        animationName: { from: { padding: { left: '20px' } } },
      }),
    ).toBe('o');

    expect(sheet.cssRules).toHaveLength(16);
    expect(sheet.cssRules[14].cssText).toMatchSnapshot();
    expect(sheet.cssRules[15].cssText).toMatchSnapshot();

    expect(
      client.injectStyle({
        fontFamily: { fontFamily: 'x' },
      }),
    ).toBe('p');

    expect(sheet.cssRules).toHaveLength(18);
    expect(sheet.cssRules[16].cssText).toMatchSnapshot();
    expect(sheet.cssRules[17].cssText).toMatchSnapshot();

    expect(
      client.injectStyle({
        border: { xy: { width: 0 }, x: { color: 'red' }, y: { color: 'green' } },
      }),
    ).toBe('q r s t u v w x');

    expect(sheet.cssRules).toHaveLength(26);
    expect(sheet.cssRules[18].cssText).toMatchSnapshot();
    expect(sheet.cssRules[19].cssText).toMatchSnapshot();
    expect(sheet.cssRules[20].cssText).toMatchSnapshot();
    expect(sheet.cssRules[21].cssText).toMatchSnapshot();
    expect(sheet.cssRules[22].cssText).toMatchSnapshot();
    expect(sheet.cssRules[23].cssText).toMatchSnapshot();
    expect(sheet.cssRules[24].cssText).toMatchSnapshot();
    expect(sheet.cssRules[25].cssText).toMatchSnapshot();

    expect(
      client.injectStyle({
        border: { y: { x: { radius: 0 } } },
      }),
    ).toBe('y z a0 a1');

    expect(sheet.cssRules).toHaveLength(30);
    expect(sheet.cssRules[26].cssText).toMatchSnapshot();
    expect(sheet.cssRules[27].cssText).toMatchSnapshot();
    expect(sheet.cssRules[28].cssText).toMatchSnapshot();
    expect(sheet.cssRules[29].cssText).toMatchSnapshot();

    expect(
      client.injectStyle({
        border: { x: { width: '10px' }, left: { width: '20px' } },
      }),
    ).toBe('a2 a3');

    expect(sheet.cssRules).toHaveLength(32);
    expect(sheet.cssRules[30].cssText).toMatchSnapshot();
    expect(sheet.cssRules[31].cssText).toMatchSnapshot();
  });
  it('injects pseudo rule', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ color: 'red' })).toBe('a');
    expect(client.injectStyle({ ':hover': { color: 'red' } })).toBe('b');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();
  });
  it('injects nested pseudo rule', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ ':first-child': { ':hover': { color: 'red' } } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
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
    expect(mediaSheet.cssRules[0].cssText).toMatchSnapshot();
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
        return declaration as Properties;
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
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();
    expect(sheet.cssRules[2].cssText).toMatchSnapshot();
    expect(sheet.cssRules[3].cssText).toMatchSnapshot();
    expect(sheet.cssRules[4].cssText).toMatchSnapshot();
    expect(sheet.cssRules[5].cssText).toMatchSnapshot();

    expect(mediaSheet.cssRules).toHaveLength(6);
    expect(mediaSheet.cssRules[0].cssText).toMatchSnapshot();
    expect(mediaSheet.cssRules[1].cssText).toMatchSnapshot();
    expect(mediaSheet.cssRules[2].cssText).toMatchSnapshot();
    expect(mediaSheet.cssRules[3].cssText).toMatchSnapshot();
    expect(mediaSheet.cssRules[4].cssText).toMatchSnapshot();
    expect(mediaSheet.cssRules[5].cssText).toMatchSnapshot();
  });
  it('injects non-atomic rules', () => {
    const style = createStyle();
    const media = createStyle('(min-width: 768px)');
    const client = new GlitzClient<TestStyle>({ atomic: false });
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
    ).toBe('a b c d');

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();

    expect(mediaSheet.cssRules).toHaveLength(2);
    expect(mediaSheet.cssRules[0].cssText).toMatchSnapshot();
    expect(mediaSheet.cssRules[1].cssText).toMatchSnapshot();
  });
  it('injects keyframes rule', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ '@keyframes': { from: { color: 'red' }, to: { color: 'green' } } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();

    expect(client.injectStyle({ animationName: { from: { color: 'blue' }, to: { color: 'white' } } })).toBe('b');

    expect(sheet.cssRules).toHaveLength(4);
    expect(sheet.cssRules[2].cssText).toMatchSnapshot();
    expect(sheet.cssRules[3].cssText).toMatchSnapshot();

    expect(client.injectStyle({ animation: { name: { from: { color: 'blue' }, to: { color: 'white' } } } })).toBe('b');

    expect(client.injectStyle({ animationName: 'some-thing' })).toBe('c');

    expect(sheet.cssRules).toHaveLength(5);
    expect(sheet.cssRules[4].cssText).toMatchSnapshot();
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
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();

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
    expect(sheet.cssRules[2].cssText).toMatchSnapshot();
    expect(sheet.cssRules[3].cssText).toMatchSnapshot();

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
    expect(sheet.cssRules[5].cssText).toMatchSnapshot();

    expect(
      client.injectStyle({
        fontFamily: 'sans-serif',
      }),
    ).toBe('d');

    expect(sheet.cssRules).toHaveLength(7);
    expect(sheet.cssRules[6].cssText).toMatchSnapshot();
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
    expect(sheet1.cssRules[0].cssText).toMatchSnapshot();

    const sheet2 = style2.sheet as CSSStyleSheet;

    expect(sheet2.cssRules).toHaveLength(1);
    expect(sheet2.cssRules[0].cssText).toMatchSnapshot();

    const sheet3 = style3.sheet as CSSStyleSheet;

    expect(sheet3.cssRules).toHaveLength(1);
    expect(sheet3.cssRules[0].cssText).toMatchSnapshot();
  });
  it('injects rule deeply', () => {
    const style = createStyle();
    const media = createStyle('(min-width: 768px)');
    const client = new GlitzClient<TestStyle>();
    const sheet = style.sheet as CSSStyleSheet;

    expect(client.injectStyle([{ color: 'green' }, { color: 'red' }])).toBe('a');

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();

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
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();

    expect(client.injectStyle([{ ':hover': { color: 'green' } }, { ':hover': { color: 'red' } }])).toBe('c');
    expect(
      client.injectStyle([
        { ':first-child': { ':hover': { color: 'green' } } },
        { ':first-child': { ':hover': { color: 'red' } } },
      ]),
    ).toBe('d');

    expect(sheet.cssRules).toHaveLength(4);
    expect(sheet.cssRules[2].cssText).toMatchSnapshot();
    expect(sheet.cssRules[3].cssText).toMatchSnapshot();

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
    expect(sheet.cssRules[4].cssText).toMatchSnapshot();
    expect(sheet.cssRules[5].cssText).toMatchSnapshot();
    expect(sheet.cssRules[6].cssText).toMatchSnapshot();
    expect(sheet.cssRules[7].cssText).toMatchSnapshot();

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
    expect(sheet.cssRules[8].cssText).toMatchSnapshot();
    expect(sheet.cssRules[9].cssText).toMatchSnapshot();
    expect(sheet.cssRules[10].cssText).toMatchSnapshot();
    expect(sheet.cssRules[11].cssText).toMatchSnapshot();

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
    expect(mediaSheet.cssRules[0].cssText).toMatchSnapshot();
    expect(mediaSheet.cssRules[1].cssText).toMatchSnapshot();
  });
  it('preserves order', () => {
    const style1 = createStyle();
    const atomic = new GlitzClient<TestStyle>();

    const sheet1 = style1.sheet as CSSStyleSheet;

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

    expect(sheet1.cssRules).toHaveLength(5);
    expect(sheet1.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet1.cssRules[1].cssText).toMatchSnapshot();
    expect(sheet1.cssRules[2].cssText).toMatchSnapshot();
    expect(sheet1.cssRules[3].cssText).toMatchSnapshot();
    expect(sheet1.cssRules[4].cssText).toMatchSnapshot();

    style1.remove();

    const style2 = createStyle();
    const nonAtomic = new GlitzClient<TestStyle>({ atomic: false });

    const sheet2 = style2.sheet as CSSStyleSheet;

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

    expect(sheet2.cssRules).toHaveLength(2);
    expect(sheet2.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet2.cssRules[1].cssText).toMatchSnapshot();
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
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
  });
  it('hydrates plain rule', () => {
    createStyle(null, '.a{color:red}.b{color:green}');
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ color: 'green' })).toBe('b');
  });
  it('hydrates media rule', () => {
    createStyle(null, '.a{color:red}.b:hover{color:green}');
    createStyle('(min-width: 768px)', '.c{color:blue}.d:hover{color:white}');
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ '@media (min-width: 768px)': { color: 'blue', ':hover': { color: 'white' } } })).toBe(
      'c d',
    );
  });
  it('hydrates keyframes rule', () => {
    createStyle(
      null,
      '.a{animation-name:a}.b{animation-name:b}@keyframes a{from{color:red}to{color:green}}@keyframes b{from{color:blue}to{color:white}}',
    );
    const client = new GlitzClient<TestStyle>();

    expect(client.injectStyle({ '@keyframes': { from: { color: 'blue' }, to: { color: 'white' } } })).toBe('b');
    expect(client.injectStyle({ animationName: { from: { color: 'blue' }, to: { color: 'white' } } })).toBe('b');
    expect(client.injectStyle({ animation: { name: { from: { color: 'blue' }, to: { color: 'white' } } } })).toBe('b');
  });
  it('hydrates font face rule', () => {
    createStyle(
      null,
      "@font-face {font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2');font-family:x}" +
        "@font-face {font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTjgPvNiA.woff2) format('woff2');font-family:y}" +
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
    createStyle(null, '.a{color:red}');
    createStyle('(min-width: 768px)', '.b{color:green}');
    createStyle('(min-width: 992px)', '.c{color:blue}');
    const client = new GlitzClient<TestStyle>();

    expect(
      client.injectStyle({
        color: 'red',
        '@media (min-width: 768px)': { color: 'green' },
        '@media (min-width: 992px)': { color: 'blue' },
      }),
    ).toBe('a b c');
  });
  it('hydrates transformed properties', () => {
    function transformer(style: UntransformedProperties) {
      return {
        ...(Object.keys(style) as Array<keyof UntransformedProperties>).reduce(
          (result, key) => ({ ...result, [`-moz-${key}`]: `${style[key]}px`, [key]: `${style[key]}px` }),
          {},
        ),
      };
    }

    createStyle(null, '.a{-moz-column-gap:1px;column-gap:1px}');
    const client = new GlitzClient<TestStyle>({ transformer });

    expect(client.injectStyle({ columnGap: 1 as 0 })).toBe('a');
  });
  it('applies transformer', () => {
    const style = createStyle();
    const client = new GlitzClient<TestStyle>({
      transformer: properties => {
        const prefixed: Properties = {};
        for (const property in properties) {
          const value = (properties as any)[property];
          if (property === 'appearance' && value === 'none') {
            prefixed.MozAppearance = value;
          }
          (prefixed as any)[property] = (properties as any)[property];
        }
        return prefixed;
      },
    });

    expect(client.injectStyle({ appearance: 'none', animationName: { from: { appearance: 'none' } } })).toBe('a b');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(3);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();
    expect(sheet.cssRules[2].cssText).toMatchSnapshot();
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
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
  });
});

function createStyle(media?: string | null, css?: string) {
  const element = document.createElement('style');
  element.dataset.glitz = undefined;
  document.head.appendChild(element);

  if (media) {
    element.media = media;
  }

  if (css) {
    element.appendChild(document.createTextNode(css));
  }

  return element;
}
