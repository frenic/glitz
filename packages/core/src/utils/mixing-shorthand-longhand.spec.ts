import { validateMixingShorthandLonghand } from './mixing-shorthand-longhand';

describe('mixing shorthand longhand', () => {
  it('will log error', () => {
    const logger = (console.error = jest.fn());

    validateMixingShorthandLonghand(
      {
        border: 1,
        borderBottomColor: 1,
      },
      '',
    );

    expect(logger).toHaveBeenCalledTimes(1);

    validateMixingShorthandLonghand(
      {
        borderBottom: 1,
        borderBottomColor: 1,
      },
      '',
    );

    expect(logger).toHaveBeenCalledTimes(2);

    validateMixingShorthandLonghand(
      {
        borderBottom: 1,
        borderBottomColor: 1,
        borderBottomWidth: 1,
        borderTop: 1,
        borderTopColor: 1,
      },
      '',
    );

    expect(logger).toHaveBeenCalledTimes(5);
  });
  it('wont log error', () => {
    const logger = (console.error = jest.fn());

    validateMixingShorthandLonghand(
      {
        border: 1,
        marginBottom: 1,
      },
      '',
    );

    expect(logger).toHaveBeenCalledTimes(0);
  });
});
