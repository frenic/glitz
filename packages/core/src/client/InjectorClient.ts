import Injector from '../core/Injector';
import { injectSheetRule, isCSSStyleSheet } from '../utils/dom';
import { formatClassRule, formatFontFaceRule, formatKeyframesRule } from '../utils/format';

export default class InjectorClient extends Injector {
  public injectRaw: (rule: string) => void;
  public hydrateClassName: (body: string, className: string, suffix?: string) => void;
  public hydrateKeyframes: (body: string, name: string) => void;
  public hydrateFontFace: (body: string) => void;
  constructor(element: HTMLStyleElement, incrementClassNameHash: () => string, incrementKeyframesHash: () => string) {
    const plainIndex: { [block: string]: string } = {};
    const selectorIndex: { [selector: string]: { [block: string]: string } } = {};
    const keyframesIndex: { [blockList: string]: string } = {};
    const fontFaceIndex: string[] = [];

    const sheet = element.sheet;

    if (!isCSSStyleSheet(sheet)) {
      throw new Error('HTMLStyleElement was not inserted properly into DOM');
    }

    super(
      block => {
        if (plainIndex[block]) {
          return plainIndex[block];
        }

        const className = incrementClassNameHash();
        plainIndex[block] = className;

        injectSheetRule(sheet, formatClassRule(className, block));

        return className;
      },
      (selector, block) => {
        const index = (selectorIndex[selector] = selectorIndex[selector] || {});
        if (index[block]) {
          return index[block];
        }

        const className = incrementClassNameHash();
        index[block] = className;

        injectSheetRule(sheet, formatClassRule(className, block, selector));

        return className;
      },
      blockList => {
        if (keyframesIndex[blockList]) {
          return keyframesIndex[blockList];
        }

        const name = incrementKeyframesHash();
        keyframesIndex[blockList] = name;

        injectSheetRule(sheet, formatKeyframesRule(name, blockList));

        return name;
      },
      block => {
        if (fontFaceIndex.indexOf(block) === -1) {
          fontFaceIndex.push(block);
          injectSheetRule(sheet, formatFontFaceRule(block));
        }
      },
    );

    this.injectRaw = rule => {
      injectSheetRule(sheet, rule);
    };

    this.hydrateClassName = (body, className, suffix) => {
      const index = suffix ? (selectorIndex[suffix] = selectorIndex[suffix] || {}) : plainIndex;
      index[body] = className;
    };

    this.hydrateKeyframes = (body, name) => {
      keyframesIndex[body] = name;
    };

    this.hydrateFontFace = body => {
      fontFaceIndex.push(body);
    };
  }
}
