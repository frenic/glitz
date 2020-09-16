import Injector from '../core/Injector';
import { formatClassRule, formatFontFaceRule, formatKeyframesRule } from '../utils/format';
import { HashCounter } from '../utils/hash';

type Index<TValue = string> = Record<string, TValue>;

export default class InjectorServer extends Injector {
  public getStyleResult: () => string;
  public getStyleStream: () => string;
  public hydrateClassName: (body: string, className: string, suffix?: string) => void;
  public hydrateKeyframes: (body: string, name: string) => void;
  public hydrateFontFace: (body: string) => void;
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
    const plainStreamIndex: Index = {};
    const selectorStreamIndex: Index<Index> = {};
    const keyframesStreamIndex: Index = {};
    const fontFaceStreamIndex: string[] = [];

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
    );

    this.getStyleResult = () => {
      let css = '';

      for (const block of fontFaceResultIndex) {
        css += formatFontFaceRule(block);
      }

      for (const blockList in keyframesResultIndex) {
        css += formatKeyframesRule(keyframesResultIndex[blockList], blockList);
      }

      for (const block in plainResultIndex) {
        css += formatClassRule(plainResultIndex[block], block);
      }

      for (const selector in selectorResultIndex) {
        const index = selectorResultIndex[selector];
        for (const block in index) {
          css += formatClassRule(index[block], block, selector);
        }
      }

      return css;
    };

    this.getStyleStream = () => {
      let css = '';

      if (fontFaceStreamIndex.length > 0) {
        for (const block of fontFaceStreamIndex) {
          css += formatFontFaceRule(block);
        }
        fontFaceStreamIndex.splice(0, fontFaceStreamIndex.length);
      }

      for (const blockList in keyframesStreamIndex) {
        css += formatKeyframesRule(keyframesStreamIndex[blockList], blockList);
        delete keyframesStreamIndex[blockList];
      }

      for (const block in plainStreamIndex) {
        css += formatClassRule(plainStreamIndex[block], block);
        delete plainStreamIndex[block];
      }

      for (const selector in selectorStreamIndex) {
        const index = selectorStreamIndex[selector];
        for (const block in index) {
          css += formatClassRule(index[block], block, selector);
        }
        delete selectorStreamIndex[selector];
      }

      return css;
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

    this.hydrateFontFace = body => {
      preHydrationCheck();
      fontFaceFullIndex.push(body);
      fontFaceHydrationIndex.push(body);
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
