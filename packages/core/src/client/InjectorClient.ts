import Injector from '../core/Injector';
import { createInjectorIndexes } from '../utils/create-index';
import { injectRule, injectSupportsRule, isCSSStyleSheet } from '../utils/dom';
import { formatClassRule, formatFontFaceRule, formatKeyframesRule } from '../utils/format';
import { HashCounter } from '../utils/hash';

export default class InjectorClient extends Injector {
  public injectRaw: (rule: string) => void;
  public hydrateClassName: (body: string, className: string, selector?: string, condition?: string) => void;
  public hydrateKeyframes: (body: string, name: string) => void;
  public hydrateFontFace: (body: string) => void;
  constructor(element: HTMLStyleElement, classNameHash: HashCounter, keyframesHash: HashCounter) {
    const [getIndex, keyframesIndex, fontFaceIndex] = createInjectorIndexes();
    let globalRuleIndex = 0;

    const sheet = element.sheet;

    if (!isCSSStyleSheet(sheet)) {
      throw new Error('HTMLStyleElement was not inserted properly into DOM');
    }

    super(
      (block, selector, condition) => {
        const index = getIndex(selector, condition);

        if (index[block]) {
          return index[block];
        }

        const className = classNameHash();
        index[block] = className;

        injectSupportsRule(sheet, formatClassRule(className, block, selector), condition);

        return className;
      },
      blockList => {
        if (keyframesIndex[blockList]) {
          return keyframesIndex[blockList];
        }

        const name = keyframesHash();
        keyframesIndex[blockList] = name;

        injectRule(sheet, formatKeyframesRule(name, blockList));

        return name;
      },
      block => {
        if (fontFaceIndex.indexOf(block) === -1) {
          fontFaceIndex.push(block);
          injectRule(sheet, formatFontFaceRule(block));
        }
      },
      rule => {
        injectRule(sheet, rule, globalRuleIndex++);
      },
    );

    this.injectRaw = rule => {
      injectRule(sheet, rule);
    };

    this.hydrateClassName = (body, className, selector, condition) => {
      classNameHash();
      const index = getIndex(selector, condition);
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
