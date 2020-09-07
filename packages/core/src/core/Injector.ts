import { ResolvedDeclarationList, ResolvedDeclarations } from '@glitz/type';
import { formatRule, prettifyRule } from '../utils/format';
import { parseDeclarationBlock } from '../utils/parse';

export const ANIMATION_NAME = 'animationName';
export const FONT_FAMILY = 'fontFamily';

export default class Injector {
  public injectClassName: (declarations: ResolvedDeclarations, selector?: string) => string;
  public injectKeyframes: (declarationList: ResolvedDeclarationList) => string;
  public injectFontFace: (declarations: ResolvedDeclarations) => string;
  constructor(
    plainClassName: (block: string) => string,
    selectorClassName: (selector: string, block: string) => string,
    keyframeName: (blockList: string) => string,
    handleFontFace: (block: string) => void,
  ) {
    this.injectClassName = (declarations, selector) => {
      const block = parseDeclarationBlock(declarations);

      if (selector) {
        return selectorClassName(selector, block);
      } else {
        return plainClassName(block);
      }
    };

    this.injectKeyframes = declarationList => {
      let blockList = '';
      for (const identifier in declarationList) {
        const keyframeBlock = parseDeclarationBlock(declarationList[identifier]);
        blockList += formatRule(identifier, keyframeBlock);
      }

      return keyframeName(blockList);
    };

    this.injectFontFace = original => {
      if (process.env.NODE_ENV !== 'production') {
        if (!(FONT_FAMILY in original)) {
          console.error(
            `The CSS property \`${FONT_FAMILY}\` in font face must be defined:\n\n`,
            prettifyRule(parseDeclarationBlock(original)),
          );
        }
      }

      const declarations: ResolvedDeclarations = {};
      for (const property in original) {
        if (property !== FONT_FAMILY) {
          declarations[property] = original[property];
        }
      }

      const family = original[FONT_FAMILY] as string;
      declarations[FONT_FAMILY] = family;

      const block = parseDeclarationBlock(declarations);

      handleFontFace(block);

      return family;
    };
  }
}
