import Injector from '../core/Injector';
import { formatClassRule, formatFontFaceRule, formatKeyframesRule } from '../utils/format';

export default class InjectorServer extends Injector {
  public getStyle: () => string;
  public getStyleStream: () => string;
  constructor(incrementClassHash: () => string, incrementKeyframesHash: () => string) {
    const plainResultIndex: { [block: string]: string } = {};
    const selectorResultIndex: { [selector: string]: { [block: string]: string } } = {};
    const keyframesResultIndex: { [block: string]: string } = {};
    const fontFaceResultIndex: string[] = [];

    const plainStreamIndex: { [block: string]: string } = {};
    const selectorStreamIndex: { [selector: string]: { [block: string]: string } } = {};
    const keyframesStreamIndex: { [block: string]: string } = {};
    const fontFaceStreamIndex: string[] = [];

    super(
      block => {
        if (plainResultIndex[block]) {
          return plainResultIndex[block];
        }

        const className = incrementClassHash();
        plainResultIndex[block] = className;
        plainStreamIndex[block] = className;
        return className;
      },
      (selector, block) => {
        const result = (selectorResultIndex[selector] = selectorResultIndex[selector] || {});
        if (result[block]) {
          return result[block];
        }

        const className = incrementClassHash();
        result[block] = className;

        const stream = (selectorStreamIndex[selector] = selectorStreamIndex[selector] || {});
        stream[block] = className;

        return className;
      },
      blockList => {
        if (keyframesResultIndex[blockList]) {
          return keyframesResultIndex[blockList];
        }

        const name = incrementKeyframesHash();
        keyframesResultIndex[blockList] = name;
        keyframesStreamIndex[blockList] = name;
        return name;
      },
      block => {
        if (fontFaceResultIndex.indexOf(block) === -1) {
          fontFaceResultIndex.push(block);
          fontFaceStreamIndex.push(block);
        }
      },
    );

    this.getStyle = () => {
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
  }
}
