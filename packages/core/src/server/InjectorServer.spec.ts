import Injector from './InjectorServer';

describe('server', () => {
  it('injects plain rule', () => {
    const injector = new Injector();

    expect(injector.injectClassRule({ color: 'red' })).toBe('a');
    expect(injector.injectClassRule({ color: 'green', backgroundColor: 'black' })).toBe('b');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('injects pseudo rule', () => {
    const injector = new Injector();

    expect(injector.injectClassRule({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassRule({ color: 'green', backgroundColor: 'black' }, ':hover')).toBe('b');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('injects keyframes rule', () => {
    const injector = new Injector();

    expect(injector.injectKeyframesRule({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('injects fallback rule', () => {
    const injector = new Injector();

    expect(injector.injectClassRule({ color: ['red', 'green'] })).toBe('a');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('reuses plain rule', () => {
    const injector = new Injector();

    expect(injector.injectClassRule({ color: 'red' })).toBe('a');
    expect(injector.injectClassRule({ color: 'red' })).toBe('a');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('reuses pseudo rule', () => {
    const injector = new Injector();

    expect(injector.injectClassRule({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.injectClassRule({ color: 'red' }, ':hover')).toBe('a');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('reuses keyframes rule', () => {
    const injector = new Injector();

    expect(injector.injectKeyframesRule({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.injectKeyframesRule({ from: { color: 'red' }, to: { color: 'green' } })).toBe('a');
    expect(injector.getStyle()).toMatchSnapshot();
  });
  it('reuses fallback rule', () => {
    const injector = new Injector();

    expect(injector.injectClassRule({ color: ['red', 'green'] })).toBe('a');
    expect(injector.injectClassRule({ color: ['red', 'green'] })).toBe('a');
    expect(injector.getStyle()).toMatchSnapshot();
  });
});
