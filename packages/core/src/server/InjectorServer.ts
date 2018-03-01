import Injector from '../core/Injector';
import { formatClassRule, formatFontFaceRule, formatKeyframesRule } from '../utils/format';

export default class InjectorServer extends Injector {
  public getStyle: () => void;
  constructor(
    incrementClassHash: () => string,
    incrementKeyframesHash: () => string,
    incrementFontFaceHash: () => string,
  ) {
    const plainDictionary: { [block: string]: string } = {};
    const pseudoDictionary: { [pseudo: string]: { [block: string]: string } } = {};
    const keyframesDictionary: { [block: string]: string } = {};
    const fontFaceDictionary: { [block: string]: string } = {};
    const fontFaceOriginalDictionary: { [block: string]: string } = {};

    super(
      plainDictionary,
      pseudoDictionary,
      keyframesDictionary,
      fontFaceDictionary,
      fontFaceOriginalDictionary,
      incrementClassHash,
      incrementKeyframesHash,
      incrementFontFaceHash,
    );

    this.getStyle = () => {
      let css = '';
      for (const block in plainDictionary) {
        css += formatClassRule(plainDictionary[block], block);
      }
      for (const pseudo in pseudoDictionary) {
        const dictionary = pseudoDictionary[pseudo];
        for (const block in dictionary) {
          css += formatClassRule(dictionary[block], block, pseudo);
        }
      }
      for (const blockList in keyframesDictionary) {
        css += formatKeyframesRule(keyframesDictionary[blockList], blockList);
      }
      for (const block in fontFaceDictionary) {
        css += formatFontFaceRule(block);
      }
      return css;
    };
  }
}
