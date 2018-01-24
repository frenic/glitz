import { Style } from '@glitz/type';
import GlitzClient from './GlitzClient';

describe('client', () => {
  it('injects plain rule', () => {
    const style = document.createElement('style');
    const client = new GlitzClient([style]);

    expect(client.injectStyle({ color: 'red' })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
  });
  it('injects pseudo rule', () => {
    const style = document.createElement('style');
    const client = new GlitzClient([style]);

    expect(client.injectStyle({ color: 'red' })).toBe('a');
    expect(client.injectStyle({ ':hover': { color: 'red' } })).toBe('b');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();
  });
  it('injects nested pseudo rule', () => {
    const style = document.createElement('style');
    const client = new GlitzClient([style]);

    expect(client.injectStyle({ ':first-child': { ':hover': { color: 'red' } } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
  });
  it('injects media rule', () => {
    const style = document.createElement('style');
    const media = document.createElement('style');
    media.media = '(min-width: 768px)';
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
    const style = document.createElement('style');
    const client = new GlitzClient([style]);

    expect(client.injectStyle({ color: 'red', background: 'green', border: 'blue' })).toBe('a b c');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(3);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();
    expect(sheet.cssRules[2].cssText).toMatchSnapshot();
  });
  it('injects keyframes rule', () => {
    const style = document.createElement('style');
    const client = new GlitzClient([style]);

    expect(client.injectStyle({ '@keyframes': { from: { color: 'red' }, to: { color: 'green' } } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();
  });
  it('injects different combinations', () => {
    const style1 = document.createElement('style');
    const style2 = document.createElement('style');
    style2.media = '(min-width: 768px)';
    const style3 = document.createElement('style');
    style3.media = '(min-width: 992px)';
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
    const style = document.createElement('style');
    style.media = '(min-width: 768px)';
    style.appendChild(document.createTextNode(`.a{color:red}`));
    const client = new GlitzClient([style]);

    expect(client.injectStyle({ '@media (min-width: 768px)': { color: 'red' } } as Style)).toBe('a');
  });
  it('hydrates multiple different combinations', () => {
    const style1 = document.createElement('style');
    style1.appendChild(document.createTextNode(`.a{color:red}`));
    const style2 = document.createElement('style');
    style2.media = '(min-width: 768px)';
    style2.appendChild(document.createTextNode(`.b{color:green}`));
    const style3 = document.createElement('style');
    style3.media = '(min-width: 992px)';
    style3.appendChild(document.createTextNode(`.c{color:blue}`));
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
