import { validateMixingShorthandLonghand } from './mixing-shorthand-longhand';

describe('mixing shorthand longhand', () => {
  it('will log error', () => {
    const logger1 = (console.warn = jest.fn());

    validateMixingShorthandLonghand({
      // It should be reversed
      borderBottomColor: 1,
      border: 1,
    });

    expect(logger1).toHaveBeenCalledWith(
      `Inserted style had a longhand property \`borderBottomColor\` mixed with its corresponding shorthand property \`border\` may likely cause some unexpected behavior in:

{
  %c"border"%c: %o,
  %c"borderBottomColor"%c: %o
}`,
      expect.any(String),
      expect.any(String),
      1,
      expect.any(String),
      expect.any(String),
      1,
    );

    const logger2 = (console.warn = jest.fn());

    validateMixingShorthandLonghand({
      // It should be reversed
      borderBottomColor: 1,
      borderBottom: 1,
    });

    expect(logger2).toHaveBeenCalledWith(
      `Inserted style had a longhand property \`borderBottomColor\` mixed with its corresponding shorthand property \`borderBottom\` may likely cause some unexpected behavior in:

{
  %c"borderBottom"%c: %o,
  %c"borderBottomColor"%c: %o
}`,
      expect.any(String),
      expect.any(String),
      1,
      expect.any(String),
      expect.any(String),
      1,
    );

    const logger3 = (console.warn = jest.fn());

    validateMixingShorthandLonghand({
      borderBottomColor: 1,
      borderBottom: 1,
      borderTopColor: 1,
      borderTop: 1,
    });

    expect(logger3).toHaveBeenCalledTimes(2);
  });
  it("won't log error", () => {
    const logger = (console.warn = jest.fn());

    validateMixingShorthandLonghand({
      border: 1,
      marginBottom: 1,
    });

    expect(logger).toHaveBeenCalledTimes(0);
  });
});
