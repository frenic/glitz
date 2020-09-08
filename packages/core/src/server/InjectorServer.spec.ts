import { createHashCounter } from '../utils/hash';
import InjectorServer from './InjectorServer';

describe('server', () => {
  it('injects plain rule', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: 'red' })).toBe('a');
    expect(injector.injectClassName({ color: 'green', backgroundColor: 'black' })).toBe('b');
    expect(injector.getStyleResult()).toMatchSnapshot();
  });
  it('injects pseudo selector', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassName({ color: 'green', backgroundColor: 'black' }, ':hover')).toBe('b');
    expect(injector.getStyleResult()).toMatchSnapshot();
  });
  it('injects attribute selector', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: 'red' }, '[disabled]')).toBe('a');
    expect(injector.injectClassName({ color: 'green', backgroundColor: 'black' }, '[disabled]')).toBe('b');
    expect(injector.getStyleResult()).toMatchSnapshot();
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
    expect(injector.getStyleResult()).toMatchSnapshot();
  });
  it('injects keyframes rule', () => {
    const injector = createInjector();

    expect(injector.injectKeyframes({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.getStyleResult()).toMatchSnapshot();
  });
  it('injects fallback rule', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: ['red', 'green'] })).toBe('a');
    expect(injector.getStyleResult()).toMatchSnapshot();
  });
  it('reuses plain rule', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: 'red' })).toBe('a');
    expect(injector.injectClassName({ color: 'red' })).toBe('a');
    expect(injector.getStyleResult()).toMatchSnapshot();
  });
  it('reuses pseudo selector', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassName({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.getStyleResult()).toMatchSnapshot();
  });
  it('reuses attribute selector', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: 'red' }, '[disabled]')).toBe('a');
    expect(injector.injectClassName({ color: 'red' }, '[disabled]')).toBe('a');
    expect(injector.getStyleResult()).toMatchSnapshot();
  });
  it('reuses keyframes rule', () => {
    const injector = createInjector();

    expect(injector.injectKeyframes({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.injectKeyframes({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.getStyleResult()).toMatchSnapshot();
  });
  it('reuses fallback rule', () => {
    const injector = createInjector();

    expect(injector.injectClassName({ color: ['red', 'green'] })).toBe('a');
    expect(injector.injectClassName({ color: ['red', 'green'] })).toBe('a');
    expect(injector.getStyleResult()).toMatchSnapshot();
  });
});

function createInjector() {
  return new InjectorServer(createHashCounter(), createHashCounter());
}
