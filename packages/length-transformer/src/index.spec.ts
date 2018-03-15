import GlitzServer from '@glitz/core/server';
import numberToLength, { createNumberToLengthTransformer } from './';

describe('number to unit', () => {
  it('injects atomic style with numeric values with default units', () => {
    const server = new GlitzServer({ transformer: numberToLength });

    expect(
      server.injectStyle({
        width: 1,
        height: [1, 'max-content'],
        padding: { left: 1 },
        columns: 1,
        lineHeight: 1,
        left: 0,
        order: 1,
        animationDuration: 1,
        transitionDuration: 0,
      }),
    ).toBe('a b c d e f g h i');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects atomic style with numeric values with different units', () => {
    const server = new GlitzServer({
      transformer: createNumberToLengthTransformer({
        defaultUnit: 'rem',
        columns: 'em',
        paddingLeft: 'px',
        animationDuration: 's',
      }),
    });

    expect(
      server.injectStyle({
        width: 1,
        height: [1, 'max-content'],
        padding: { left: 1 },
        columns: 1,
        lineHeight: 1,
        left: 0,
        order: 1,
        animationDuration: 1,
        transitionDuration: 0,
      }),
    ).toBe('a b c d e f g h i');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects non-atomic style with numeric values with default units', () => {
    const server = new GlitzServer({ transformer: numberToLength, atomic: false });

    expect(
      server.injectStyle({
        width: 1,
        height: [1, 'max-content'],
        padding: { left: 1 },
        columns: 1,
        lineHeight: 1,
        left: 0,
        order: 1,
        animationDuration: 1,
        transitionDuration: 0,
      }),
    ).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects non-atomic style with numeric values with different units', () => {
    const server = new GlitzServer({
      transformer: createNumberToLengthTransformer({
        defaultUnit: 'rem',
        columns: 'em',
        paddingLeft: 'px',
        animationDuration: 's',
      }),
      atomic: false,
    });

    expect(
      server.injectStyle({
        width: 1,
        height: [1, 'max-content'],
        padding: { left: 1 },
        columns: 1,
        lineHeight: 1,
        left: 0,
        order: 1,
        animationDuration: 1,
        transitionDuration: 0,
      }),
    ).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
});
