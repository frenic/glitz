import { Properties } from '@glitz/type';
import devToolTransformer, { createDevToolTransformer } from './index';

describe('style validation', () => {
  it('invalidates', () => {
    const logger1 = (console.warn = jest.fn());

    devToolTransformer({
      colour: 'red',
    } as Properties);

    expect(logger1).toHaveBeenCalledWith(
      `The browser ignored the CSS in:

{
  %c"colour"%c: %o
}`,
      expect.any(String),
      expect.any(String),
      'red',
    );

    const logger2 = (console.warn = jest.fn());

    devToolTransformer({
      color: 'bläck',
    });

    expect(logger2).toHaveBeenCalledWith(
      `The browser ignored the CSS in:

{
  %c"color"%c: %o
}`,
      expect.any(String),
      expect.any(String),
      'bläck',
    );

    const logger3 = (console.warn = jest.fn());
    const value = [0, '--maxcontent'];

    devToolTransformer({
      width: value,
    } as Properties);

    expect(logger3).toHaveBeenCalledWith(
      `The browser ignored the CSS fallback value \`--maxcontent\` in:

{
  %c"width"%c: %o
}`,
      expect.any(String),
      expect.any(String),
      value,
    );
  });
  it('validates', () => {
    const logger = (console.warn = jest.fn());

    devToolTransformer({
      color: 'red',
    });

    expect(logger).toHaveBeenCalledTimes(0);

    devToolTransformer({
      color: ['red'],
    });

    expect(logger).toHaveBeenCalledTimes(0);

    devToolTransformer({
      backgroundColor: 'red',
    });

    expect(logger).toHaveBeenCalledTimes(0);

    devToolTransformer({
      backgroundColor: 'red !important',
    });

    expect(logger).toHaveBeenCalledTimes(0);
  });
  it('ignores property', () => {
    const logger = (console.warn = jest.fn());

    createDevToolTransformer({ ignoreProperties: 'colour' })({
      colour: 'red',
    } as Properties);

    expect(logger).toHaveBeenCalledTimes(0);

    createDevToolTransformer({ ignoreProperties: /^background/ })({
      backgroundColour: 'red',
    } as Properties);

    expect(logger).toHaveBeenCalledTimes(0);

    createDevToolTransformer({ ignoreProperties: ['colour', /^background/] })({
      colour: 'red',
      backgroundColour: 'red',
    } as Properties);

    expect(logger).toHaveBeenCalledTimes(0);
  });
});
