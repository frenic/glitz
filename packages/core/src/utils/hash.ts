export type HashCounter = {
  (): string;
  clone(): HashCounter;
};

export function createHashCounter(prefix = '', skipList: number[] = [], count = 0, offset = 10, msb = 35, power = 1): HashCounter {
  function increment(): string {
    const virtualCount = count + offset;

    if (virtualCount === msb) {
      offset += (msb + 1) * 9;
      msb = Math.pow(36, ++power) - 1;
    }

    count++;

    // Skip "ad" due to ad-blockers
    if (virtualCount === 373 || skipList.findIndex(s => s === virtualCount) > -1) {
      return increment();
    }

    return prefix + virtualCount.toString(36);
  }

  return Object.assign(increment, {
    clone() {
      return createHashCounter(prefix, skipList, count, offset, msb, power);
    },
  });
}

export function createHashCountsFromStringList(disallowedClassNames: string[] = []) {
  return disallowedClassNames.map(c => parseInt(c, 36));
}
