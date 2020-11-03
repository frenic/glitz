import { createHashCounter } from '../utils/hash';
import InjectorClient from './InjectorClient';

beforeEach(() => {
  document.head.innerHTML = '';
});

describe('client', () => {
  it('injects plain rule', () => {
    const style = createStyle();
    const injector = createInjector(style);

    expect(injector.injectClassName({ color: 'red' })).toBe('a');
    expect(injector.injectClassName({ color: 'green', backgroundColor: 'black' })).toBe('b');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`".a {color: red;}"`);
    expect(sheet.cssRules[1].cssText).toMatchInlineSnapshot(`".b {color: green; background-color: black;}"`);
  });
  it('injects pseudo selector', () => {
    const style = createStyle();
    const injector = createInjector(style);

    expect(injector.injectClassName({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassName({ color: 'green', backgroundColor: 'black' }, ':hover')).toBe('b');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`".a:hover {color: red;}"`);
    expect(sheet.cssRules[1].cssText).toMatchInlineSnapshot(`".b:hover {color: green; background-color: black;}"`);
  });
  it('injects attribute selector', () => {
    const style = createStyle();
    const injector = createInjector(style);

    expect(injector.injectClassName({ color: 'red' }, '[disabled]')).toBe('a');
    expect(injector.injectClassName({ color: 'green', backgroundColor: 'black' }, '[disabled]')).toBe('b');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`".a[disabled] {color: red;}"`);
    expect(sheet.cssRules[1].cssText).toMatchInlineSnapshot(`".b[disabled] {color: green; background-color: black;}"`);
  });
  it('injects keyframes rule', () => {
    const style = createStyle();
    const injector = createInjector(style);

    expect(injector.injectKeyframes({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`
      "@keyframes a { 
        from {color: red;} 
        to {color: green;} 
      }"
    `);
  });
  it('injects font face rule', () => {
    const style = createStyle();
    const injector = createInjector(style);

    expect(
      injector.injectFontFace({
        fontFamily: 'x',
        fontStyle: 'normal',
        fontWeight: 400,
        src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
      }),
    ).toBe('x');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(
      `"@font-face {font-style: normal; font-weight: 400; src: url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2'); font-family: x;}"`,
    );
  });
  it('injects fallback rule', () => {
    // Use Puppeteer
  });
  it('injects global rule', () => {
    const style = createStyle();
    const injector = createInjector(style);

    injector.injectGlobals({ color: 'red' }, 'div');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchInlineSnapshot(`"div {color: red;}"`);
  });
  it('reuses plain rule', () => {
    const style = createStyle();
    const injector = createInjector(style);

    expect(injector.injectClassName({ color: 'red' })).toBe('a');
    expect(injector.injectClassName({ color: 'red' })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
  });
  it('reuses pseudo selector', () => {
    const style = createStyle();
    const injector = createInjector(style);

    expect(injector.injectClassName({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassName({ color: 'red' }, ':hover')).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
  });
  it('reuses attribute selector', () => {
    const style = createStyle();
    const injector = createInjector(style);

    expect(injector.injectClassName({ color: 'red' }, '[disabled]')).toBe('a');
    expect(injector.injectClassName({ color: 'red' }, '[disabled]')).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
  });
  it('reuses keyframes rule', () => {
    const style = createStyle();
    const injector = createInjector(style);

    expect(injector.injectKeyframes({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.injectKeyframes({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
  });
  it("won't fail if style element is removed from DOM", () => {
    const style = createStyle();
    const injector = createInjector(style);

    expect(injector.injectClassName({ color: 'red' })).toBe('a');

    document.head.removeChild(style);

    expect(injector.injectClassName({ color: 'green' })).toBe('b');
  });
  it("will fail if style element wasn't inserted to DOM", () => {
    const style = createStyle();
    document.head.removeChild(style);

    expect(() => createInjector(style)).toThrowError();
  });
});

function createStyle() {
  const element = document.createElement('style');
  document.head.appendChild(element);
  return element;
}

function createInjector(style: HTMLStyleElement) {
  return new InjectorClient(style, createHashCounter(), createHashCounter());
}
