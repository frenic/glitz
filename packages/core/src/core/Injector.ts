import { ResolvedDeclarationList, ResolvedDeclarations } from '@glitz/type';
import { formatRule, prettifyRule } from '../utils/format';
import { parseDeclarationBlock } from '../utils/parse';

export const ANIMATION_NAME = 'animationName';
export const FONT_FAMILY = 'fontFamily';

export default class Injector {
  public injectClassName: (declarations: ResolvedDeclarations, pseudo?: string) => string;
  public injectKeyframes: (declarationList: ResolvedDeclarationList) => string;
  public injectFontFace: (declarations: ResolvedDeclarations) => string;
  constructor(
    plainIndex: { [block: string]: string },
    pseudoIndex: { [pseudo: string]: { [block: string]: string } },
    keyframesIndex: { [blockList: string]: string },
    fontFaceIndex: { [block: string]: string },
    incrementClassHash: () => string,
    incrementKeyframesHash: () => string,
    injectNewClassRule?: (className: string, block: string, pseudo?: string) => void,
    injectNewKeyframesRule?: (name: string, blockList: string) => void,
    injectNewFontFaceRule?: (block: string) => void,
  ) {
    this.injectClassName = (declarations, pseudo) => {
      const block = parseDeclarationBlock(declarations);
      const index = pseudo ? (pseudoIndex[pseudo] = pseudoIndex[pseudo] || {}) : plainIndex;

      if (index[block]) {
        return index[block];
      }

      const className = incrementClassHash();
      index[block] = className;

      if (injectNewClassRule) {
        injectNewClassRule(className, block, pseudo);
      }

      return className;
    };

    this.injectKeyframes = declarationList => {
      let blockList = '';
      for (const identifier in declarationList) {
        const keyframeBlock = parseDeclarationBlock(declarationList[identifier]);
        blockList += formatRule(identifier, keyframeBlock);
      }

      if (keyframesIndex[blockList]) {
        return keyframesIndex[blockList];
      }

      const name = incrementKeyframesHash();
      keyframesIndex[blockList] = name;

      if (injectNewKeyframesRule) {
        injectNewKeyframesRule(name, blockList);
      }

      return name;
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

      if (fontFaceIndex[block]) {
        return fontFaceIndex[block];
      }

      fontFaceIndex[block] = family;

      if (injectNewFontFaceRule) {
        injectNewFontFaceRule(block);
      }

      return family;
    };
  }
}
