import { Properties, PropertiesList } from '@glitz/type';
import Injector from '../core/Injector';
import { formatClassRule, formatKeyframesRule } from '../utils/format';
import { createHashCounter } from '../utils/hash';

export default class InjectorServer extends Injector {
  public injectClassRule: (style: Properties, pseudo?: string) => string | void;
  public injectKeyframesRule: (styleList: PropertiesList) => string | void;
  public getStyle: () => void;
  constructor(incrementClassHash = createHashCounter(), incrementKeyframesHash = createHashCounter()) {
    const plainDictionary: { [block: string]: string } = {};
    const pseudoDictionary: { [pseudo: string]: { [block: string]: string } } = {};
    const keyframesDictionary: { [block: string]: string } = {};

    super(plainDictionary, pseudoDictionary, keyframesDictionary, incrementClassHash, incrementKeyframesHash);

    this.getStyle = () => {
      let style = '';
      for (const block in plainDictionary) {
        style += formatClassRule(plainDictionary[block], block);
      }
      for (const pseudo in pseudoDictionary) {
        const dictionary = pseudoDictionary[pseudo];
        for (const block in dictionary) {
          style += formatClassRule(dictionary[block], block, pseudo);
        }
      }
      for (const blockList in keyframesDictionary) {
        style += formatKeyframesRule(keyframesDictionary[blockList], blockList);
      }
      return style;
    };
  }
}
