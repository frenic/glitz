import media from './media';

describe('media selector', () => {
  it('logs warning when empty', () => {
    const logger = (console.warn = jest.fn());

    media({});

    expect(logger).toHaveBeenCalledTimes(1);
  });
  it('parses queries', () => {
    expect(media({ minWidth: '50rem' })).toBe('@media (min-width: 50rem)');
    expect(media({ minWidth: 768 })).toBe('@media (min-width: 768px)');
    expect(media({ minHeight: 768 })).toBe('@media (min-height: 768px)');
    expect(media({ resolution: 300 })).toBe('@media (resolution: 300dpi)');
    expect(media({ color: true })).toBe('@media (color)');
    expect(media({ monochrome: 1 })).toBe('@media (monochrome: 1)');
    expect(media({ minWidth: 768, resolution: 300 })).toBe('@media (min-width: 768px) and (resolution: 300dpi)');
    expect(media('(min-width: 768px)')).toBe('@media (min-width: 768px)');
  });
});
