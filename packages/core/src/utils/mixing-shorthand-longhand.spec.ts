import { validateMixingShorthandLonghand } from './mixing-shorthand-longhand';

describe('mixing shorthand longhand', () => {
  it('will log error', () => {
    const warn = jest.fn();

    validateMixingShorthandLonghand(
      {
        // It should be reversed
        borderBottomColor: 1,
        border: 1,
      },
      warn,
    );

    expect(warn).toHaveBeenCalledWith(
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

    const warn2 = jest.fn();

    validateMixingShorthandLonghand(
      {
        // It should be reversed
        borderBottomColor: 1,
        borderBottom: 1,
      },
      warn2,
    );

    expect(warn2).toHaveBeenCalledWith(
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

    const warn3 = jest.fn();

    validateMixingShorthandLonghand(
      {
        borderBottomColor: 1,
        borderBottom: 1,
        borderTopColor: 1,
        borderTop: 1,
      },
      warn3,
    );

    expect(warn3).toHaveBeenCalledTimes(2);
  });
  it("won't log error", () => {
    const warn = jest.fn();

    validateMixingShorthandLonghand(
      {
        border: 1,
        marginBottom: 1,
      },
      warn,
    );

    expect(warn).toHaveBeenCalledTimes(0);
  });
});
