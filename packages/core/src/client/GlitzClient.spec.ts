import { Style } from '@glitz/type';
import GlitzClient from './GlitzClient';

beforeEach(() => {
  document.head.innerHTML = '';
});

describe('client', () => {
  it('injects plain rule', () => {
    const style = createStyle();
    const client = new GlitzClient([style]);

    expect(client.injectStyle({ color: 'red' })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
  });
  it('injects pseudo rule', () => {
    const style = createStyle();
    const client = new GlitzClient([style]);

    expect(client.injectStyle({ color: 'red' })).toBe('a');
    expect(client.injectStyle({ ':hover': { color: 'red' } })).toBe('b');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();
  });
  it('injects nested pseudo rule', () => {
    const style = createStyle();
    const client = new GlitzClient([style]);

    expect(client.injectStyle({ ':first-child': { ':hover': { color: 'red' } } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
  });
  it('injects media rule', () => {
    const style = createStyle();
    const media = createStyle('(min-width: 768px)');
    const client = new GlitzClient([style, media]);

    expect(client.injectStyle({ color: 'red' })).toBe('a');
    expect(client.injectStyle({ ':hover': { color: 'red' } })).toBe('b');
    expect(client.injectStyle({ '@media (min-width: 768px)': { color: 'red' } } as Style)).toBe('c');
    expect(client.injectStyle({ '@media (min-width: 768px)': { ':hover': { color: 'red' } } } as Style)).toBe('d');

    const sheet = media.sheet as CSSStyleSheet;
    const mediaSheet = media.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(mediaSheet.cssRules).toHaveLength(2);
    expect(mediaSheet.cssRules[0].cssText).toMatchSnapshot();
  });
  it('injects media elements in certain order', () => {
    const client = new GlitzClient(null, {
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

    expect(client.injectStyle({ '@media (min-width: 300px)': { color: 'red' } } as Style)).toBe('a');
    expect(client.injectStyle({ '@media (min-width: 100px)': { color: 'red' } } as Style)).toBe('b');

    expect(document.head.childNodes).toHaveLength(2);
    expect((document.head.childNodes[0] as HTMLStyleElement).media).toBe('(min-width: 100px)');
    expect((document.head.childNodes[1] as HTMLStyleElement).media).toBe('(min-width: 300px)');

    expect(client.injectStyle({ '@media (min-width: 200px)': { color: 'red' } } as Style)).toBe('c');

    expect(document.head.childNodes).toHaveLength(3);
    expect((document.head.childNodes[0] as HTMLStyleElement).media).toBe('(min-width: 100px)');
    expect((document.head.childNodes[1] as HTMLStyleElement).media).toBe('(min-width: 200px)');
    expect((document.head.childNodes[2] as HTMLStyleElement).media).toBe('(min-width: 300px)');

    expect(client.injectStyle({ '@media (min-width: 300px)': { color: 'red' } } as Style)).toBe('a');
    expect(client.injectStyle({ color: 'red' })).toBe('d');

    expect(document.head.childNodes).toHaveLength(4);
    expect((document.head.childNodes[0] as HTMLStyleElement).media).toBe('');
    expect((document.head.childNodes[1] as HTMLStyleElement).media).toBe('(min-width: 100px)');
    expect((document.head.childNodes[2] as HTMLStyleElement).media).toBe('(min-width: 200px)');
    expect((document.head.childNodes[3] as HTMLStyleElement).media).toBe('(min-width: 300px)');
  });
  it('cache declarations', () => {
    let count = 0;
    const client = new GlitzClient(null, {
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
    expect(client.injectStyle({ '@media (min-width: 768px)': { color: 'red' } } as Style)).toBe('c');
    expect(client.injectStyle({ '@media (min-width: 768px)': { color: 'red' } } as Style)).toBe('c');
    expect(count).toBe(3);
    expect(client.injectStyle({ '@media (min-width: 768px)': { ':hover': { color: 'red' } } } as Style)).toBe('d');
    expect(client.injectStyle({ '@media (min-width: 768px)': { ':hover': { color: 'red' } } } as Style)).toBe('d');
    expect(count).toBe(4);
  });
  it('injects atomic rules', () => {
    const style = createStyle();
    const client = new GlitzClient([style]);

    expect(client.injectStyle({ color: 'red', background: 'green', border: 'blue' })).toBe('a b c');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(3);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();
    expect(sheet.cssRules[2].cssText).toMatchSnapshot();
  });
  it('injects keyframes rule', () => {
    const style = createStyle();
    const client = new GlitzClient([style]);

    expect(client.injectStyle({ '@keyframes': { from: { color: 'red' }, to: { color: 'green' } } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();

    expect(client.injectStyle({ animationName: { from: { color: 'blue' }, to: { color: 'white' } } })).toBe('b');

    expect(sheet.cssRules).toHaveLength(4);
    expect(sheet.cssRules[2].cssText).toMatchSnapshot();
    expect(sheet.cssRules[3].cssText).toMatchSnapshot();
  });
  it('injects different combinations', () => {
    const style1 = createStyle();
    const style2 = createStyle('(min-width: 768px)');
    const style3 = createStyle('(min-width: 992px)');
    const client = new GlitzClient([style1, style2, style3]);

    expect(
      client.injectStyle({
        color: 'red',
        '@media (min-width: 768px)': { color: 'green' },
        '@media (min-width: 992px)': { color: 'blue' },
      } as Style),
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
  it('hydrates media rule', () => {
    const style = createStyle('(min-width: 768px)', '.a{color:red}');
    const client = new GlitzClient([style]);

    expect(client.injectStyle({ '@media (min-width: 768px)': { color: 'red' } } as Style)).toBe('a');
  });
  it('hydrates multiple different combinations', () => {
    const style1 = createStyle(null, '.a{color:red}');
    const style2 = createStyle('(min-width: 768px)', '.b{color:green}');
    const style3 = createStyle('(min-width: 992px)', '.c{color:blue}');
    const client = new GlitzClient([style1, style2, style3]);

    expect(
      client.injectStyle({
        color: 'red',
        '@media (min-width: 768px)': { color: 'green' },
        '@media (min-width: 992px)': { color: 'blue' },
      } as Style),
    ).toBe('a b c');
  });
});

function createStyle(media?: string | null, css?: string) {
  const element = document.createElement('style');
  document.head.appendChild(element);

  if (media) {
    element.media = media;
  }

  if (css) {
    element.appendChild(document.createTextNode(css));
  }

  return element;
}
