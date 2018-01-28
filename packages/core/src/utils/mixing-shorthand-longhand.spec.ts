import { validateMixingShorthandLonghand } from './mixing-shorthand-longhand';

describe('mixing shorthand longhand', () => {
  it('will log error', () => {
    const logger = (console.error = jest.fn());

    validateMixingShorthandLonghand(
      {
        border: '',
        borderBottomColor: '',
      },
      '',
    );

    expect(logger).toHaveBeenCalledTimes(1);

    validateMixingShorthandLonghand(
      {
        borderBottom: '',
        borderBottomColor: '',
      },
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
      },
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
      },
      '',
    );

    expect(logger).toHaveBeenCalledTimes(0);
  });
});
