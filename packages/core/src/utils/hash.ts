export function createHashCounter(prefix = '') {
  let count = 0;
  let offset = 10;
  let msb = 35;
  let power = 1;

  const increment = (): string => {
    const virtualCount = count + offset;

    if (virtualCount === msb) {
      offset += (msb + 1) * 9;
      msb = Math.pow(36, ++power) - 1;
    }

    count++;

    // Skip "ad" due to ad-blockers
    if (virtualCount === 373) {
      return increment();
    }

    return prefix + virtualCount.toString(36);
  };

  return increment;
}
