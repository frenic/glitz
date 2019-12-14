import selector from './selector';

describe('selectors', () => {
  const style = { color: 'red' };

  it('can create a pseudo selector', () => {
    const target = selector(':hover', style);
    const expected = {
      ':hover': style,
    };

    expect(target).toEqual(expected);
  });
  it('can create a attribute selector', () => {
    const target = selector('[disabled]', style);
    const expected = {
      '[disabled]': style,
    };

    expect(target).toEqual(expected);
  });
  it('can create multiple selectors with the same style', () => {
    const selectors = ['[disabled]', ':hover'];
    const target = selector(selectors, style);
    const expected = {
      '[disabled]': style,
      ':hover': style,
    };

    expect(target).toEqual(expected);
  });
});
