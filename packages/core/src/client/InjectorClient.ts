// tslint:disable no-conditional-assignment

import Injector from '../core/Injector';
import { injectSheetRule } from '../utils/dom';
import { formatClassRule, formatFontFaceRule, formatKeyframesRule } from '../utils/format';

const CLASS_RULE_REGEX = /\.([a-z0-9]+)(:[^{]+)?\{([^}]+)\}/g;
const KEYFRAMES_REGEX = /@keyframes ([a-z0-9]+)\{((?:[a-z0-9%]+\{[^}]+\})+)\}/g;
const FONT_FACE_REGEX = /@font-face \{(.+);font-family:([^}]+)\}/g;

export default class InjectorClient extends Injector {
  constructor(
    styleElement: HTMLStyleElement,
    incrementClassHash: () => string,
    incrementKeyframesHash: () => string,
    incrementFontFaceHash: () => string,
  ) {
    const plainDictionary: { [block: string]: string } = {};
    const pseudoDictionary: { [pseudo: string]: { [block: string]: string } } = {};
    const keyframesDictionary: { [blockList: string]: string } = {};
    const fontFaceDictionary: { [block: string]: string } = {};

    // Hydrate
    const css = styleElement.textContent;
    if (css) {
      let rule: RegExpExecArray | null;
      while ((rule = CLASS_RULE_REGEX.exec(css))) {
        incrementClassHash();

        if (rule[2]) {
          const dictionary = (pseudoDictionary[rule[2]] = pseudoDictionary[rule[2]] || {});
          dictionary[rule[3]] = rule[1];
        } else {
          plainDictionary[rule[3]] = rule[1];
        }
      }
      while ((rule = KEYFRAMES_REGEX.exec(css))) {
        incrementKeyframesHash();
        keyframesDictionary[rule[2]] = rule[1];
      }
      while ((rule = FONT_FACE_REGEX.exec(css))) {
        incrementFontFaceHash();
        keyframesDictionary[rule[1]] = rule[2];
      }
    }

    const injectNewClassRule = (className: string, block: string, pseudo?: string) => {
      const rule = formatClassRule(className, block, pseudo);
      return injectSheetRule(styleElement, rule);
    };

    const injectNewKeyframesRule = (name: string, blockList: string) => {
      const rule = formatKeyframesRule(name, blockList);
      injectSheetRule(styleElement, rule);
    };

    const injectNewFontFaceRule = (name: string, block: string) => {
      const rule = formatFontFaceRule(name, block);
      injectSheetRule(styleElement, rule);
    };

    super(
      plainDictionary,
      pseudoDictionary,
      keyframesDictionary,
      fontFaceDictionary,
      incrementClassHash,
      incrementKeyframesHash,
      incrementFontFaceHash,
      injectNewClassRule,
      injectNewKeyframesRule,
      injectNewFontFaceRule,
    );
  }
}
