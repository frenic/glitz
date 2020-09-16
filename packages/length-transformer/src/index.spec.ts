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
      `"<style data-glitz>.a{transition-duration:0ms}.b{animation-duration:1ms}.c{order:1}.d{left:0}.e{line-height:1}.f{columns:1}.g{padding-left:1px}.h{height:1px;height:max-content}.i{width:1px}</style>"`,
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
      `"<style data-glitz>.a{transition-duration:0ms}.b{animation-duration:1s}.c{order:1}.d{left:0}.e{line-height:1}.f{columns:1em}.g{padding-left:1px}.h{height:1rem;height:max-content}.i{width:1rem}</style>"`,
    );
  });
});
