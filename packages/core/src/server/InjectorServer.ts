import Injector from '../core/Injector';
import { formatClassRule, formatFontFaceRule, formatKeyframesRule } from '../utils/format';
import { HashCounter } from '../utils/hash';

export default class InjectorServer extends Injector {
  public getStyleResult: () => string;
  public getStyleStream: () => string;
  public hydrateClassName: (body: string, className: string, suffix?: string) => void;
  public hydrateKeyframes: (body: string, name: string) => void;
  public hydrateFontFace: (body: string) => void;
  public reset: () => boolean;
  constructor(classNameHash: HashCounter, keyframesHash: HashCounter) {
    let plainFullIndex: { [block: string]: string } = {};
    let selectorFullIndex: { [selector: string]: { [block: string]: string } } = {};
    let keyframesFullIndex: { [block: string]: string } = {};
    let fontFaceFullIndex: string[] = [];

    const plainHydrationIndex: { [block: string]: string } = {};
    const selectorHydrationIndex: { [selector: string]: { [block: string]: string } } = {};
    const keyframesHydrationIndex: { [block: string]: string } = {};
    const fontFaceHydrationIndex: string[] = [];
    let forbidHydration = false;

    let plainResultIndex: { [block: string]: string } = {};
    let selectorResultIndex: { [selector: string]: { [block: string]: string } } = {};
    let keyframesResultIndex: { [block: string]: string } = {};
    let fontFaceResultIndex: string[] = [];

    let plainStreamIndex: { [block: string]: string } = {};
    let selectorStreamIndex: { [selector: string]: { [block: string]: string } } = {};
    let keyframesStreamIndex: { [block: string]: string } = {};
    let fontFaceStreamIndex: string[] = [];

    super(
      (block, selector) => {
        forbidHydration = true;
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
        forbidHydration = true;
        if (keyframesFullIndex[blockList]) {
          return keyframesFullIndex[blockList];
        }

        const name = keyframesHash();
        keyframesFullIndex[blockList] = keyframesResultIndex[blockList] = keyframesStreamIndex[blockList] = name;

        return name;
      },
      block => {
        forbidHydration = true;
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

    function allowHydrationCheck() {
      if (forbidHydration) {
        throw new Error('Hydration is prohibited after injections');
      }
    }

    this.hydrateClassName = (body, className, suffix) => {
      allowHydrationCheck();
      classNameHash();
      const full = suffix ? (selectorFullIndex[suffix] = selectorFullIndex[suffix] ?? {}) : plainFullIndex;
      const hydration = suffix
        ? (selectorHydrationIndex[suffix] = selectorHydrationIndex[suffix] ?? {})
        : plainHydrationIndex;
      full[body] = hydration[body] = className;
    };

    this.hydrateKeyframes = (body, name) => {
      allowHydrationCheck();
      keyframesHash();
      keyframesFullIndex[body] = name;
      keyframesHydrationIndex[body] = name;
    };

    this.hydrateFontFace = body => {
      allowHydrationCheck();
      fontFaceFullIndex.push(body);
      fontFaceHydrationIndex.push(body);
    };

    this.reset = () => {
      plainFullIndex = {};
      selectorFullIndex = {};
      keyframesFullIndex = {};
      fontFaceFullIndex = [];
      plainResultIndex = {};
      selectorResultIndex = {};
      keyframesResultIndex = {};
      fontFaceResultIndex = [];
      plainStreamIndex = {};
      selectorStreamIndex = {};
      keyframesStreamIndex = {};
      fontFaceStreamIndex = [];

      let shouldDelete = true;

      for (const body in plainHydrationIndex) {
        shouldDelete = false;
        classNameHash();
        plainFullIndex[body] = plainHydrationIndex[body];
      }

      for (const selector in selectorHydrationIndex) {
        for (const body in selectorHydrationIndex[selector]) {
          shouldDelete = false;
          classNameHash();
          const index = (selectorFullIndex[selector] = selectorFullIndex[selector] ?? {});
          index[body] = selectorHydrationIndex[selector][body];
        }
      }

      for (const body in keyframesHydrationIndex) {
        shouldDelete = false;
        keyframesHash();
        keyframesFullIndex[body] = keyframesHydrationIndex[body];
      }

      for (const body of fontFaceHydrationIndex) {
        shouldDelete = false;
        fontFaceFullIndex.push(body);
      }

      return shouldDelete;
    };
  }
}
