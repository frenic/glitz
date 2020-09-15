import { GlitzServer } from '@glitz/core';
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
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.a{width:1px}.b{height:1px;height:max-content}.c{padding-left:1px}.d{columns:1}.e{line-height:1}.f{left:0}.g{order:1}.h{animation-duration:1ms}.i{transition-duration:0ms}</style>"`,
    );
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
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.a{width:1rem}.b{height:1rem;height:max-content}.c{padding-left:1px}.d{columns:1em}.e{line-height:1}.f{left:0}.g{order:1}.h{animation-duration:1s}.i{transition-duration:0ms}</style>"`,
    );
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
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.a{width:1px;height:1px;height:max-content;padding-left:1px;columns:1;line-height:1;left:0;order:1;animation-duration:1ms;transition-duration:0ms}</style>"`,
    );
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
    expect(server.getStyleMarkup()).toMatchInlineSnapshot(
      `"<style data-glitz>.a{width:1rem;height:1rem;height:max-content;padding-left:1px;columns:1em;line-height:1;left:0;order:1;animation-duration:1s;transition-duration:0ms}</style>"`,
    );
  });
});
