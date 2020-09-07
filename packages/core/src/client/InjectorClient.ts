// tslint:disable no-conditional-assignment

import Injector from '../core/Injector';
import { injectSheetRule, isCSSStyleSheet } from '../utils/dom';
import { formatClassRule, formatFontFaceRule, formatKeyframesRule } from '../utils/format';

const RULE_REGEX = /(?:\.([a-z0-9]+)([:\[][^{]+)?\{([^}]+)\})|(?:@keyframes ([a-z0-9]+)\{((?:[a-z0-9%]+\{[^}]+\})+)\})|(?:@font-face \{.*?;?font-family:([^}]+)\})/g;

export default class InjectorClient extends Injector {
  public hydrate: (element: HTMLStyleElement) => void;
  constructor(masterElement: HTMLStyleElement, incrementClassHash: () => string, incrementKeyframesHash: () => string) {
    const plainIndex: { [block: string]: string } = {};
    const selectorIndex: { [selector: string]: { [block: string]: string } } = {};
    const keyframesIndex: { [blockList: string]: string } = {};
    const fontFaceIndex: string[] = [];

    const sheet = masterElement.sheet;

    if (!isCSSStyleSheet(sheet)) {
      throw new Error('HTMLStyleElement was not inserted properly into DOM');
    }

    super(
      block => {
        if (plainIndex[block]) {
          return plainIndex[block];
        }

        const className = incrementClassHash();
        plainIndex[block] = className;

        injectSheetRule(sheet, formatClassRule(className, block));

        return className;
      },
      (selector, block) => {
        const index = (selectorIndex[selector] = selectorIndex[selector] || {});
        if (index[block]) {
          return index[block];
        }

        const className = incrementClassHash();
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

    const hydrate = (this.hydrate = element => {
      const css = element.textContent;
      if (css) {
        let rule: RegExpExecArray | null;
        while ((rule = RULE_REGEX.exec(css))) {
          if (rule[1]) {
            incrementClassHash();
            const index = rule[2] ? (selectorIndex[rule[2]] = selectorIndex[rule[2]] || {}) : plainIndex;
            index[rule[3]] = rule[1];
          } else if (rule[4]) {
            incrementKeyframesHash();
            keyframesIndex[rule[5]] = rule[4];
          } else if (rule[6]) {
            fontFaceIndex.push(rule[6]);
          }

          if (element !== masterElement) {
            injectSheetRule(sheet, rule[0]);
          }
        }
      }
    });

    hydrate(masterElement);
  }
}
