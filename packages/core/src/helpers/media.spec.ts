import media, { query } from './media';

describe('media selector', () => {
  it('parses queries to list', () => {
    expect(query({ minWidth: '768px' })).toBe('(min-width: 768px)');
    expect(query({ minHeight: '768px' })).toBe('(min-height: 768px)');
    expect(query({ resolution: '300dpi' })).toBe('(resolution: 300dpi)');
    expect(query({ color: true })).toBe('(color)');
    expect(query({ monochrome: 1 })).toBe('(monochrome: 1)');
    expect(query({ minWidth: '768px', resolution: '300dpi' })).toBe('(min-width: 768px) and (resolution: 300dpi)');
  });
  it('parses queries to rule', () => {
    expect(media('(min-width: 768px)', { color: 'green' })).toEqual({
      '@media (min-width: 768px)': { color: 'green' },
    });
  });
});
