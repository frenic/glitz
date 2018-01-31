import InjectorClient from './InjectorClient';

beforeEach(() => {
  document.head.innerHTML = '';
});

describe('client', () => {
  it('injects plain rule', () => {
    const style = createStyle();
    const injector = new InjectorClient(style);

    expect(injector.injectClassRule({ color: 'red' })).toBe('a');
    expect(injector.injectClassRule({ color: 'green', background: 'block' })).toBe('b');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();
  });
  it('injects pseudo rule', () => {
    const style = createStyle();
    const injector = new InjectorClient(style);

    expect(injector.injectClassRule({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassRule({ color: 'green', background: 'block' }, ':hover')).toBe('b');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
    expect(sheet.cssRules[1].cssText).toMatchSnapshot();
  });
  it('injects keyframes rule', () => {
    const style = createStyle();
    const injector = new InjectorClient(style);

    expect(injector.injectKeyframesRule({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
    expect(sheet.cssRules[0].cssText).toMatchSnapshot();
  });
  it('injects fallback rule', () => {
    // Use Puppeteer
  });
  it('reuses plain rule', () => {
    const style = createStyle();
    const injector = new InjectorClient(style);

    expect(injector.injectClassRule({ color: 'red' })).toBe('a');
    expect(injector.injectClassRule({ color: 'red' })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
  });
  it('reuses pseudo rule', () => {
    const style = createStyle();
    const injector = new InjectorClient(style);

    expect(injector.injectClassRule({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassRule({ color: 'red' }, ':hover')).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
  });
  it('reuses keyframes rule', () => {
    const style = createStyle();
    const injector = new InjectorClient(style);

    expect(injector.injectKeyframesRule({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.injectKeyframesRule({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules).toHaveLength(1);
  });
  it('reuses fallback rule', () => {
    // Use Puppeteer
  });
  it('hydrates plain rule', () => {
    const style = createStyle('.a{color:red}.b{color:green}.c{color:black;background:white}');
    const injector = new InjectorClient(style);

    // Skipping .a
    expect(injector.injectClassRule({ color: 'green' })).toBe('b');
    expect(injector.injectClassRule({ color: 'black', background: 'white' })).toBe('c');
  });
  it('hydrates pseudo rule', () => {
    const style = createStyle('.a:hover{color:red}.b:hover{color:green}');
    const injector = new InjectorClient(style);

    // Skipping .a
    expect(injector.injectClassRule({ color: 'green' }, ':hover')).toBe('b');
  });
  it('hydrates keyframes rule', () => {
    const style = createStyle('@keyframes a{from{color:red}to{color:green}}@keyframes b{from{color:black}to{color:white}}');
    const injector = new InjectorClient(style);

    // Skipping .a
    expect(injector.injectKeyframesRule({ from: { color: 'black' }, to: { color: 'white' } })).toBe('b');
  });
  it('hydrates fallback rule', () => {
    const style = createStyle('.a{color:red;color:green}.b{color:black;color:white}');
    const injector = new InjectorClient(style);

    // Skipping .a
    expect(injector.injectClassRule({ color: ['black', 'white'] })).toBe('b');
  });
  it('increments plain hash', () => {
    const style = createStyle('.a{color:red}.b{color:green}');
    const injector = new InjectorClient(style);

    expect(injector.injectClassRule({ color: 'blue' })).toBe('c');

    const sheet = style.sheet as CSSStyleSheet;

    expect(sheet.cssRules[2].cssText).toMatchSnapshot();
  });
});

function createStyle(css?: string) {
  const element = document.createElement('style');
  document.head.appendChild(element);

  if (css) {
    element.appendChild(document.createTextNode(css));
  }

  return element;
}
