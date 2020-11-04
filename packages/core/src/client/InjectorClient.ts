import Injector from '../core/Injector';
import { injectSheetRule, isCSSStyleSheet } from '../utils/dom';
import { formatClassRule, formatFontFaceRule, formatKeyframesRule } from '../utils/format';
import { HashCounter } from '../utils/hash';

export default class InjectorClient extends Injector {
  public injectRaw: (rule: string) => void;
  public hydrateClassName: (body: string, className: string, suffix?: string) => void;
  public hydrateKeyframes: (body: string, name: string) => void;
  public hydrateFontFace: (body: string) => void;
  constructor(element: HTMLStyleElement, classNameHash: HashCounter, keyframesHash: HashCounter) {
    const plainIndex: { [block: string]: string } = {};
    const selectorIndex: { [selector: string]: { [block: string]: string } } = {};
    const keyframesIndex: { [blockList: string]: string } = {};
    const fontFaceIndex: string[] = [];
    let globalRuleIndex = 0;

    const sheet = element.sheet;

    if (!isCSSStyleSheet(sheet)) {
      throw new Error('HTMLStyleElement was not inserted properly into DOM');
    }

    super(
      (block, selector) => {
        const index = selector ? (selectorIndex[selector] = selectorIndex[selector] ?? {}) : plainIndex;
        if (index[block]) {
          return index[block];
        }

        const className = classNameHash();
        index[block] = className;

        injectSheetRule(sheet, formatClassRule(className, block, selector));

        return className;
      },
      blockList => {
        if (keyframesIndex[blockList]) {
          return keyframesIndex[blockList];
        }

        const name = keyframesHash();
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
      rule => {
        injectSheetRule(sheet, rule, globalRuleIndex++);
      },
    );

    this.injectRaw = rule => {
      injectSheetRule(sheet, rule);
    };

    this.hydrateClassName = (body, className, suffix) => {
      classNameHash();
      const index = suffix ? (selectorIndex[suffix] = selectorIndex[suffix] ?? {}) : plainIndex;
      index[body] = className;
    };

    this.hydrateKeyframes = (body, name) => {
      keyframesHash();
      keyframesIndex[body] = name;
    };

    this.hydrateFontFace = body => {
      fontFaceIndex.push(body);
    };
  }
}
