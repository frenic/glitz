import Injector from '../core/Injector';
import { formatClassRule, formatFontFaceRule, formatKeyframesRule } from '../utils/format';

export default class InjectorServer extends Injector {
  public getStyle: () => void;
  constructor(incrementClassHash: () => string, incrementKeyframesHash: () => string) {
    const plainIndex: { [block: string]: string } = {};
    const selectorIndex: { [selector: string]: { [block: string]: string } } = {};
    const keyframesIndex: { [block: string]: string } = {};
    const fontFaceIndex: { [block: string]: string } = {};

    super(plainIndex, selectorIndex, keyframesIndex, fontFaceIndex, incrementClassHash, incrementKeyframesHash);

    this.getStyle = () => {
      let css = '';
      for (const block in fontFaceIndex) {
        css += formatFontFaceRule(block);
      }
      for (const blockList in keyframesIndex) {
        css += formatKeyframesRule(keyframesIndex[blockList], blockList);
      }
      for (const block in plainIndex) {
        css += formatClassRule(plainIndex[block], block);
      }
      for (const selector in selectorIndex) {
        const index = selectorIndex[selector];
        for (const block in index) {
          css += formatClassRule(index[block], block, selector);
        }
      }
      return css;
    };
  }
}
