import { Properties } from '@glitz/type';
import devToolTransformer from './index';

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
  });
});
