// tslint:disable no-conditional-assignment

import { Properties, PropertiesList } from '@glitz/type';
import Injector from '../core/Injector';
import { injectSheetRule } from '../utils/dom';
import { formatClassRule, formatKeyframesRule } from '../utils/format';
import { createHashCounter } from '../utils/hash';

const RULE_REGEX = /\.([a-z0-9])(:[^{]+)?\{([^}]+)\}/g;
const KEYFRAMES_REGEX = /@keyframes ([a-z0-9])\{((?:[a-z0-9%]+\{[^}]+\})+)\}/g;

export default class InjectorClient extends Injector {
  public injectClassRule: (style: Properties, pseudo?: string) => string | void;
  public injectKeyframesRule: (styleList: PropertiesList) => string | void;
  constructor(
    styleElement: HTMLStyleElement,
    incrementClassHash = createHashCounter(),
    incrementKeyframesHash = createHashCounter(),
  ) {
    const plainDictionary: { [block: string]: string } = {};
    const pseudoDictionary: { [pseudo: string]: { [block: string]: string } } = {};
    const keyframesDictionary: { [blockList: string]: string } = {};

    // Hydrate
    const css = styleElement.textContent;
    if (css) {
      let rule: RegExpExecArray | null;
      while ((rule = RULE_REGEX.exec(css))) {
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
    }

    const injectNewClassRule = (className: string, block: string, pseudo?: string) => {
      const rule = formatClassRule(className, block, pseudo);
      injectSheetRule(styleElement, rule);
    };

    const injectNewKeyframesRule = (name: string, blockList: string) => {
      const rule = formatKeyframesRule(name, blockList);
      injectSheetRule(styleElement, rule);
    };

    super(
      plainDictionary,
      pseudoDictionary,
      keyframesDictionary,
      incrementClassHash,
      incrementKeyframesHash,
      injectNewClassRule,
      injectNewKeyframesRule,
    );
  }
}
