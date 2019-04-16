import pseudo from './pseudo';

describe('pseudo selector', () => {
  it('can create a selector', () => {
    const style = {
      minWidth: '300px',
    };

    const target = pseudo(':hover', style);
    const expected = {
      ':hover': style,
    };

    expect(target).toEqual(expected);
  });
  it('can create multiple selectors with the same style', () => {
    const style = {
      minWidth: '300px',
    };

    const selectors = [':hover', ':last-child'];
    const target = pseudo(selectors, style);
    const expected = {
      ':hover': style,
      ':last-child': style,
    };

    expect(target).toEqual(expected);
  });
});
