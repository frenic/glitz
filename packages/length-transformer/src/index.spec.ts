import GlitzServer from '@glitz/core/server';
import numberToLength, { createNumberToLengthTransformer } from './';

describe('number to unit', () => {
  it('injects atomic style with numeric values as px', () => {
    const server = new GlitzServer({ transformer: numberToLength });

    expect(
      server.injectStyle({
        width: 1,
        height: [1, 'max-content'],
        padding: { left: 1 },
        columns: 1,
        lineHeight: 1,
        left: 0,
      }),
    ).toBe('a b c d e f');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects atomic style with numeric values as rem', () => {
    const server = new GlitzServer({
      transformer: createNumberToLengthTransformer({ defaultUnit: 'rem', columns: 'em', paddingLeft: 'px' }),
    });

    expect(
      server.injectStyle({
        width: 1,
        height: [1, 'max-content'],
        padding: { left: 1 },
        columns: 1,
        lineHeight: 1,
        left: 0,
      }),
    ).toBe('a b c d e f');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects non-atomic style with numeric values as px', () => {
    const server = new GlitzServer({ transformer: numberToLength, atomic: false });

    expect(
      server.injectStyle({
        width: 1,
        height: [1, 'max-content'],
        padding: { left: 1 },
        columns: 1,
        lineHeight: 1,
        left: 0,
      }),
    ).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
  it('injects non-atomic style with numeric values as rem', () => {
    const server = new GlitzServer({
      transformer: createNumberToLengthTransformer({ defaultUnit: 'rem', columns: 'em', paddingLeft: 'px' }),
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
      }),
    ).toBe('a');
    expect(server.getStyleMarkup()).toMatchSnapshot();
  });
});
