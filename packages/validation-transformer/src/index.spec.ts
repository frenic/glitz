import { Properties } from '@glitz/type';
import clientValidationTransformer from './index';

describe('style validation', () => {
  it('invalidates', () => {
    const logger = (console.warn = jest.fn());

    clientValidationTransformer({
      colour: 'red',
    } as Properties);

    expect(logger).toHaveBeenCalledTimes(1);

    clientValidationTransformer({
      color: 'bläck',
    });

    expect(logger).toHaveBeenCalledTimes(2);

    clientValidationTransformer({
      backgroundColour: 'red',
    } as Properties);

    expect(logger).toHaveBeenCalledTimes(3);
  });
  it('validates', () => {
    const logger = (console.warn = jest.fn());

    clientValidationTransformer({
      color: 'red',
    });

    expect(logger).toHaveBeenCalledTimes(0);

    clientValidationTransformer({
      color: ['red'],
    });

    expect(logger).toHaveBeenCalledTimes(0);

    clientValidationTransformer({
      backgroundColor: 'red',
    });

    expect(logger).toHaveBeenCalledTimes(0);
  });
});
