import { Properties } from '@glitz/type';
import devToolTransformer, { createDevToolTransformer } from './index';

describe('style validation', () => {
  it('invalidates', () => {
    const logger = (console.warn = jest.fn());

    devToolTransformer({
      colour: 'red',
    } as Properties);

    expect(logger).toHaveBeenCalledTimes(1);

    devToolTransformer({
      color: 'bläck',
    });

    expect(logger).toHaveBeenCalledTimes(2);

    devToolTransformer({
      backgroundColour: 'red',
    } as Properties);

    expect(logger).toHaveBeenCalledTimes(3);
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
