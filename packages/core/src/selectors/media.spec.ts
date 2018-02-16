import media, { query } from './media';

describe('media selector', () => {
  it('logs warning when empty', () => {
    const logger = (console.warn = jest.fn());

    media({}, {});

    expect(logger).toHaveBeenCalledTimes(1);
  });
  it('parses queries to list', () => {
    expect(query({ minWidth: '50rem' })).toBe('(min-width: 50rem)');
    expect(query({ minWidth: 768 })).toBe('(min-width: 768px)');
    expect(query({ minHeight: 768 })).toBe('(min-height: 768px)');
    expect(query({ resolution: 300 })).toBe('(resolution: 300dpi)');
    expect(query({ color: true })).toBe('(color)');
    expect(query({ monochrome: 1 })).toBe('(monochrome: 1)');
    expect(query({ minWidth: 768, resolution: 300 })).toBe('(min-width: 768px) and (resolution: 300dpi)');
  });
  it('parses queries to rule', () => {
    expect(media({ minWidth: 768 }, { color: 'green' })).toEqual({ '@media (min-width: 768px)': { color: 'green' } });
    expect(media('(min-width: 768px)', { color: 'green' })).toEqual({
      '@media (min-width: 768px)': { color: 'green' },
    });
  });
});
