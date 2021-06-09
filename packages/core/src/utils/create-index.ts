type Index<TValue = string> = Record<string, TValue>;

export type InjectorIndexes = [
  getIndex: (selector?: string | undefined, condition?: string | undefined) => Index<string>,
  keyframesIndex: Index,
  fontFaceIndex: string[],
  clone: () => InjectorIndexes,
  plainIndex: Index,
  plainSupportsIndex: Index<Index>,
  selectorIndex: Index<Index>,
  selectorSupportsIndex: Index<Index<Index>>,
];

export function createInjectorIndexes(
  plainIndex: Index = {},
  plainSupportsIndex: Index<Index> = {},
  selectorIndex: Index<Index> = {},
  selectorSupportsIndex: Index<Index<Index>> = {},
  keyframesIndex: Index = {},
  fontFaceIndex: string[] = [],
): InjectorIndexes {
  return [
    (selector?: string, condition?: string) => {
      let index = plainIndex;

      if (condition) {
        if (selector) {
          selectorSupportsIndex[condition] ??= {};
          selectorSupportsIndex[condition][selector] ??= {};
          index = selectorSupportsIndex[condition][selector];
        } else {
          plainSupportsIndex[condition] ??= {};
          index = plainSupportsIndex[condition];
        }
      } else if (selector) {
        selectorIndex[selector] ??= {};
        index = selectorIndex[selector];
      }

      return index;
    },
    keyframesIndex,
    fontFaceIndex,
    () =>
      createInjectorIndexes(
        clone(plainIndex),
        clone(plainSupportsIndex),
        clone(selectorIndex),
        clone(selectorSupportsIndex),
        clone(keyframesIndex),
        fontFaceIndex.slice(0),
      ),
    plainIndex,
    plainSupportsIndex,
    selectorIndex,
    selectorSupportsIndex,
  ];
}

function clone<TIndex extends Index<string | Index | Index<Index>>>(index: TIndex): TIndex {
  const copy: Index<string | Index | Index<Index>> = {};

  for (const key in index) {
    const value: string | Index | Index<Index> = index[key];
    if (typeof value === 'string') {
      copy[key] = value;
    } else {
      copy[key] = clone(value);
    }
  }

  return copy as TIndex;
}
