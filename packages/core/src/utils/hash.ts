export type HashCounter = {
  (): string;
  clone(): HashCounter;
};

export function createHashCounter(prefix = '', count = 0, offset = 10, msb = 35, power = 1): HashCounter {
  function increment(): string {
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
  }

  return Object.assign(increment, {
    clone() {
      return createHashCounter(prefix, count, offset, msb, power);
    },
  });
}
