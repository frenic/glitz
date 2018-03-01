import { createHashCounter } from '../utils/hash';
import InjectorServer from './InjectorServer';

describe('server', () => {
  it('injects plain rule', () => {
    const injector = createInjector();

    expect(injector.injectClassRule({ color: 'red' })).toBe('a');
    expect(injector.injectClassRule({ color: 'green', backgroundColor: 'black' })).toBe('b');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('injects pseudo rule', () => {
    const injector = createInjector();

    expect(injector.injectClassRule({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassRule({ color: 'green', backgroundColor: 'black' }, ':hover')).toBe('b');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('injects font face rule', () => {
    const injector = createInjector();

    expect(
      injector.injectFontFaceRule({
        fontStyle: 'normal',
        fontWeight: 400,
        src: "url(https://fonts.gstatic.com/s/paytoneone/v10/0nksC9P7MfYHj2oFtYm2ChTtgPs.woff2) format('woff2')",
      }),
    ).toBe('a');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('injects keyframes rule', () => {
    const injector = createInjector();

    expect(injector.injectKeyframesRule({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('injects fallback rule', () => {
    const injector = createInjector();

    expect(injector.injectClassRule({ color: ['red', 'green'] })).toBe('a');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('reuses plain rule', () => {
    const injector = createInjector();

    expect(injector.injectClassRule({ color: 'red' })).toBe('a');
    expect(injector.injectClassRule({ color: 'red' })).toBe('a');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('reuses pseudo rule', () => {
    const injector = createInjector();

    expect(injector.injectClassRule({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassRule({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('reuses keyframes rule', () => {
    const injector = createInjector();

    expect(injector.injectKeyframesRule({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.injectKeyframesRule({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('reuses fallback rule', () => {
    const injector = createInjector();

    expect(injector.injectClassRule({ color: ['red', 'green'] })).toBe('a');
    expect(injector.injectClassRule({ color: ['red', 'green'] })).toBe('a');
    expect(injector.getStyle()).toMatchSnapshot();
  });
});

function createInjector() {
  return new InjectorServer(createHashCounter(), createHashCounter(), createHashCounter());
}
