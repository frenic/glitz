import { createHashCounter } from './hash';

describe('hash', () => {
  it('increments', () => {
    const counter = createHashCounter();
    expect(counter()).toBe('a');
    expect(counter()).toBe('b');
    expect(counter()).toBe('c');
  });
  it('includes only letters and numbers', () => {
    const counter = createHashCounter();
    for (let i = 0; i < 1000; i++) {
      expect(counter()).toMatch(/^[a-z][a-z0-9]*$/);
    }
  });
  it('skips ad', () => {
    const counter = createHashCounter();
    for (let i = 0; i < 38; i++) {
      counter();
    }
    expect(counter()).toBe('ac');
    expect(counter()).toBe('ae');
  });
  it('adds prefix', () => {
    const counter = createHashCounter('x');
    expect(counter()).toBe('xa');
  });
  it('resets', () => {
    const counter = createHashCounter();
    expect(counter()).toBe('a');
    counter.reset();
    expect(counter()).toBe('a');
  });
});
