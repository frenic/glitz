import Injector from '../core/Injector';
import { formatClassRule, formatFontFaceRule, formatKeyframesRule } from '../utils/format';

export default class InjectorServer extends Injector {
  public getStyleResult: () => string;
  public getStyleStream: () => string;
  public hydrateClassName: (body: string, className: string, suffix?: string) => void;
  public hydrateKeyframes: (body: string, name: string) => void;
  public hydrateFontFace: (body: string) => void;
  constructor(incrementClassHash: () => string, incrementKeyframesHash: () => string) {
    const plainFullIndex: { [block: string]: string } = {};
    const selectorFullIndex: { [selector: string]: { [block: string]: string } } = {};
    const keyframesFullIndex: { [block: string]: string } = {};
    const fontFaceFullIndex: string[] = [];

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
        if (plainFullIndex[block]) {
          return plainFullIndex[block];
        }

        const className = incrementClassHash();
        plainFullIndex[block] = plainResultIndex[block] = plainStreamIndex[block] = className;

        return className;
      },
      (selector, block) => {
        const full = (selectorFullIndex[selector] = selectorFullIndex[selector] || {});

        if (full[block]) {
          return full[block];
        }

        const className = incrementClassHash();

        const result = (selectorResultIndex[selector] = selectorResultIndex[selector] || {});
        const stream = (selectorStreamIndex[selector] = selectorStreamIndex[selector] || {});
        full[block] = result[block] = stream[block] = className;

        return className;
      },
      blockList => {
        if (keyframesFullIndex[blockList]) {
          return keyframesFullIndex[blockList];
        }

        const name = incrementKeyframesHash();
        keyframesFullIndex[blockList] = keyframesResultIndex[blockList] = keyframesStreamIndex[blockList] = name;

        return name;
      },
      block => {
        if (fontFaceFullIndex.indexOf(block) === -1) {
          fontFaceFullIndex.push(block);
          fontFaceResultIndex.push(block);
          fontFaceStreamIndex.push(block);
        }
      },
    );

    this.getStyleResult = () => {
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

    this.hydrateClassName = (body, className, suffix) => {
      const index = suffix ? (selectorFullIndex[suffix] = selectorFullIndex[suffix] || {}) : plainFullIndex;
      index[body] = className;
    };

    this.hydrateKeyframes = (body, name) => {
      keyframesFullIndex[body] = name;
    };

    this.hydrateFontFace = body => {
      fontFaceFullIndex.push(body);
    };
  }
}
