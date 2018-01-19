import { compose } from './compose';

describe('compose', () => {
  it('composes', () => {
    const fn1 = compose((arg: number) => arg + 1);
    expect(fn1(1)).toBe(2);

    const fn2 = compose((arg: number) => arg + 1, (arg: number) => arg * 2);
    expect(fn2(1)).toBe(3);
  });
});
