import { Style } from '@glitz/type';
import { validateMixingShorthandLonghand } from './mixing-shorthand-longhand';

describe('mixing shorthand longhand', () => {
  it('will log error', () => {
    const logger = (console.error = jest.fn());

    validateMixingShorthandLonghand(
      {
        border: '',
        borderBottomColor: '',
      } as Style,
      '',
    );

    expect(logger).toHaveBeenCalledTimes(1);

    validateMixingShorthandLonghand(
      {
        borderBottom: '',
        borderBottomColor: '',
      } as Style,
      '',
    );

    expect(logger).toHaveBeenCalledTimes(2);

    validateMixingShorthandLonghand(
      {
        borderBottom: '',
        borderBottomColor: '',
        borderBottomWidth: '',
        borderTop: '',
        borderTopColor: '',
      } as Style,
      '',
    );

    expect(logger).toHaveBeenCalledTimes(5);
  });
  it('wont log error', () => {
    const logger = (console.error = jest.fn());

    validateMixingShorthandLonghand(
      {
        border: '',
        marginBottom: '',
      } as Style,
      '',
    );

    expect(logger).toHaveBeenCalledTimes(0);
  });
});
