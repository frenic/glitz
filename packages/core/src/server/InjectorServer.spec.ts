import { createHashCounter } from '../utils/hash';
import InjectorServer from './InjectorServer';

describe('server', () => {
  it('injects plain rule', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: 'red' })).toBe('a');
    expect(injector.injectClassName({ color: 'green', backgroundColor: 'black' })).toBe('b');
    expect(injector.getStyleResult()).toMatchInlineSnapshot(`".a{color:red}.b{color:green;background-color:black}"`);
  });
  it('injects pseudo selector', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassName({ color: 'green', backgroundColor: 'black' }, ':hover')).toBe('b');
    expect(injector.getStyleResult()).toMatchInlineSnapshot(
      `".a:hover{color:red}.b:hover{color:green;background-color:black}"`,
    );
  });
  it('injects attribute selector', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: 'red' }, '[disabled]')).toBe('a');
    expect(injector.injectClassName({ color: 'green', backgroundColor: 'black' }, '[disabled]')).toBe('b');
    expect(injector.getStyleResult()).toMatchInlineSnapshot(
      `".a[disabled]{color:red}.b[disabled]{color:green;background-color:black}"`,
    );
  });
  it('injects font face rule', () => {
    const injector = createInjector();

    expect(
      injector.injectFontFace({
        fontFamily: 'x',
        fontStyle: 'normal',
        fontWeight: 400,
        src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
      }),
    ).toBe('x');
    expect(injector.getStyleResult()).toMatchInlineSnapshot(
      `"@font-face{font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2');font-family:x}"`,
    );
  });
  it('injects keyframes rule', () => {
    const injector = createInjector();

    expect(injector.injectKeyframes({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.getStyleResult()).toMatchInlineSnapshot(`"@keyframes a{from{color:red}to{color:green}}"`);
  });
  it('injects fallback rule', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: ['red', 'green'] })).toBe('a');
    expect(injector.getStyleResult()).toMatchInlineSnapshot(`".a{color:red;color:green}"`);
  });
  it('reuses plain rule', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: 'red' })).toBe('a');
    expect(injector.injectClassName({ color: 'red' })).toBe('a');
    expect(injector.getStyleResult()).toMatchInlineSnapshot(`".a{color:red}"`);
  });
  it('reuses pseudo selector', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassName({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.getStyleResult()).toMatchInlineSnapshot(`".a:hover{color:red}"`);
  });
  it('reuses attribute selector', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: 'red' }, '[disabled]')).toBe('a');
    expect(injector.injectClassName({ color: 'red' }, '[disabled]')).toBe('a');
    expect(injector.getStyleResult()).toMatchInlineSnapshot(`".a[disabled]{color:red}"`);
  });
  it('reuses keyframes rule', () => {
    const injector = createInjector();

    expect(injector.injectKeyframes({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.injectKeyframes({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.getStyleResult()).toMatchInlineSnapshot(`"@keyframes a{from{color:red}to{color:green}}"`);
  });
  it('reuses fallback rule', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: ['red', 'green'] })).toBe('a');
    expect(injector.injectClassName({ color: ['red', 'green'] })).toBe('a');
    expect(injector.getStyleResult()).toMatchInlineSnapshot(`".a{color:red;color:green}"`);
  });
  it('resets plain rule', () => {
    const classNameHash = createHashCounter();
    const keyframesHash = createHashCounter();
    const injector = new InjectorServer(classNameHash, keyframesHash);

    injector.hydrateClassName('color:red', 'a');
    injector.hydrateClassName('color:green', 'b');
    expect(injector.injectClassName({ color: 'red' })).toBe('a');
    expect(injector.injectClassName({ color: 'blue' })).toBe('c');
    classNameHash.reset();
    keyframesHash.reset();
    injector.reset();
    expect(injector.injectClassName({ color: 'red' })).toBe('a');
    expect(injector.injectClassName({ color: 'blue' })).toBe('c');
  });
  it('resets pseudo rule', () => {
    const classNameHash = createHashCounter();
    const keyframesHash = createHashCounter();
    const injector = new InjectorServer(classNameHash, keyframesHash);

    injector.hydrateClassName('color:red', 'a', ':hover');
    injector.hydrateClassName('color:green', 'b', ':hover');
    expect(injector.injectClassName({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassName({ color: 'blue' }, ':hover')).toBe('c');
    classNameHash.reset();
    keyframesHash.reset();
    injector.reset();
    expect(injector.injectClassName({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassName({ color: 'blue' }, ':hover')).toBe('c');
  });
  it('resets attribute rule', () => {
    const classNameHash = createHashCounter();
    const keyframesHash = createHashCounter();
    const injector = new InjectorServer(classNameHash, keyframesHash);

    injector.hydrateClassName('color:red', 'a', '[disabled]');
    injector.hydrateClassName('color:green', 'b', '[disabled]');
    expect(injector.injectClassName({ color: 'red' }, '[disabled]')).toBe('a');
    expect(injector.injectClassName({ color: 'blue' }, '[disabled]')).toBe('c');
    classNameHash.reset();
    keyframesHash.reset();
    injector.reset();
    expect(injector.injectClassName({ color: 'red' }, '[disabled]')).toBe('a');
    expect(injector.injectClassName({ color: 'blue' }, '[disabled]')).toBe('c');
  });
  it('resets keyframes rule', () => {
    const classNameHash = createHashCounter();
    const keyframesHash = createHashCounter();
    const injector = new InjectorServer(classNameHash, keyframesHash);

    injector.hydrateKeyframes('from{color:red}to{color:green}', 'a');
    injector.hydrateKeyframes('from{color:green}to{color:blue}', 'b');
    expect(injector.injectKeyframes({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.injectKeyframes({ from: { color: 'blue' }, to: { color: 'white' } })).toBe('c');
    classNameHash.reset();
    keyframesHash.reset();
    injector.reset();
    expect(injector.injectKeyframes({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.injectKeyframes({ from: { color: 'blue' }, to: { color: 'white' } })).toBe('c');
  });
  it('throws when hydrating after injection', () => {
    const injector = createInjector();

    injector.hydrateClassName('color:red', 'a');
    injector.injectClassName({ color: 'red' });
    expect(() => injector.hydrateClassName('color:green', 'b')).toThrowError();
  });
});

function createInjector() {
  return new InjectorServer(createHashCounter(), createHashCounter());
}
