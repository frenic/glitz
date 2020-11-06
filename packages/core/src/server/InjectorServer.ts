import Injector from '../core/Injector';
import { formatClassRule, formatFontFaceRule, formatKeyframesRule } from '../utils/format';
import { HashCounter } from '../utils/hash';

type Index<TValue = string> = Record<string, TValue>;

export default class InjectorServer extends Injector {
  public getStyle: (stream?: boolean) => string;
  public hydrateClassName: (body: string, className: string, suffix?: string) => void;
  public hydrateKeyframes: (body: string, name: string) => void;
  public hydrateFontFace: (rule: string) => void;
  public clone: (classNameHashClone: HashCounter, keyframesHashClone: HashCounter) => InjectorServer;
  constructor(
    classNameHash: HashCounter,
    keyframesHash: HashCounter,
    postInjection = false,
    plainFullIndex: Index = {},
    selectorFullIndex: Index<Index> = {},
    keyframesFullIndex: Index = {},
    fontFaceFullIndex: string[] = [],
    plainHydrationIndex: Index = {},
    selectorHydrationIndex: Index<Index> = {},
    keyframesHydrationIndex: Index = {},
    fontFaceHydrationIndex: string[] = [],
  ) {
    const plainResultIndex: Index = {};
    const selectorResultIndex: Index<Index> = {};
    const keyframesResultIndex: Index = {};
    const fontFaceResultIndex: string[] = [];
    let globalsResult = '';
    const plainStreamIndex: Index = {};
    const selectorStreamIndex: Index<Index> = {};
    const keyframesStreamIndex: Index = {};
    const fontFaceStreamIndex: string[] = [];
    let globalsStream = '';

    super(
      (block, selector) => {
        postInjection = true;
        const full = selector ? (selectorFullIndex[selector] = selectorFullIndex[selector] ?? {}) : plainFullIndex;

        if (full[block]) {
          return full[block];
        }

        const className = classNameHash();

        const result = selector
          ? (selectorResultIndex[selector] = selectorResultIndex[selector] ?? {})
          : plainResultIndex;
        const stream = selector
          ? (selectorStreamIndex[selector] = selectorStreamIndex[selector] ?? {})
          : plainStreamIndex;
        full[block] = result[block] = stream[block] = className;

        return className;
      },
      blockList => {
        postInjection = true;
        if (keyframesFullIndex[blockList]) {
          return keyframesFullIndex[blockList];
        }

        const name = keyframesHash();
        keyframesFullIndex[blockList] = keyframesResultIndex[blockList] = keyframesStreamIndex[blockList] = name;

        return name;
      },
      block => {
        postInjection = true;
        if (fontFaceFullIndex.indexOf(block) === -1) {
          fontFaceFullIndex.push(block);
          fontFaceResultIndex.push(block);
          fontFaceStreamIndex.push(block);
        }
      },
      rule => {
        globalsResult += rule;
        globalsStream += rule;
      },
    );

    this.getStyle = (stream = false) => {
      let result = '';

      if (stream) {
        result += globalsStream;
        globalsStream = '';
      } else {
        result += globalsResult;
      }

      const fontFaces = stream ? fontFaceStreamIndex : fontFaceResultIndex;
      for (const block of fontFaces) {
        result += formatFontFaceRule(block);
      }

      if (stream) {
        fontFaceStreamIndex.length = 0;
      }

      const keyframes = stream ? keyframesStreamIndex : keyframesResultIndex;
      for (const blockList in keyframes) {
        result += formatKeyframesRule(keyframes[blockList], blockList);

        if (stream) {
          delete keyframesStreamIndex[blockList];
        }
      }

      const plains = stream ? plainStreamIndex : plainResultIndex;
      for (const block in plains) {
        result += formatClassRule(plains[block], block);

        if (stream) {
          delete plainStreamIndex[block];
        }
      }

      const selectors = stream ? selectorStreamIndex : selectorResultIndex;
      for (const selector in selectors) {
        const index = selectors[selector];
        for (const block in index) {
          result += formatClassRule(index[block], block, selector);
        }

        if (stream) {
          delete selectorStreamIndex[selector];
        }
      }

      return result;
    };

    function createPreActionCheck(action: string) {
      return () => {
        if (postInjection) {
          throw new Error(`${action} is prohibited after injections`);
        }
      };
    }

    const preHydrationCheck = createPreActionCheck('Hydration');

    this.hydrateClassName = (body, className, suffix) => {
      preHydrationCheck();
      classNameHash();
      const full = suffix ? (selectorFullIndex[suffix] = selectorFullIndex[suffix] ?? {}) : plainFullIndex;
      const hydration = suffix
        ? (selectorHydrationIndex[suffix] = selectorHydrationIndex[suffix] ?? {})
        : plainHydrationIndex;
      full[body] = hydration[body] = className;
    };

    this.hydrateKeyframes = (body, name) => {
      preHydrationCheck();
      keyframesHash();
      keyframesFullIndex[body] = name;
      keyframesHydrationIndex[body] = name;
    };

    this.hydrateFontFace = rule => {
      preHydrationCheck();
      fontFaceFullIndex.push(rule);
      fontFaceHydrationIndex.push(rule);
    };

    const preCloningCheck = createPreActionCheck('Cloning');

    this.clone = (classNameHashClone, keyframesHashClone) => {
      preCloningCheck();

      return new InjectorServer(
        classNameHashClone,
        keyframesHashClone,
        postInjection,
        clone(plainHydrationIndex),
        clone(selectorHydrationIndex),
        clone(keyframesHydrationIndex),
        fontFaceHydrationIndex.slice(0),
        clone(plainHydrationIndex),
        clone(selectorHydrationIndex),
        clone(keyframesHydrationIndex),
        fontFaceHydrationIndex.slice(0),
      );
    };
  }
}

function clone<TIndex extends Index<string | Index>>(index: TIndex): TIndex {
  const copy: Index<string | Index> = {};

  for (const key in index) {
    const value: string | Index = index[key];
    if (typeof value === 'string') {
      copy[key] = value;
    } else {
      copy[key] = clone(value);
    }
  }

  return copy as TIndex;
}
