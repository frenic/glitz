import { FontFace, Properties, PropertiesList } from '@glitz/type';
import { formatRule } from '../utils/format';
import { parseDeclarationBlock } from '../utils/parse';

export default class Injector {
  public injectClassRule: (declarations: Properties, pseudo?: string) => string;
  public injectKeyframesRule: (declarationList: PropertiesList) => string;
  public injectFontFaceRule: (declarations: FontFace) => string;
  constructor(
    plainDictionary: { [block: string]: string },
    pseudoDictionary: { [pseudo: string]: { [block: string]: string } },
    keyframesDictionary: { [blockList: string]: string },
    fontFaceDictionary: { [block: string]: string },
    fontFaceOriginalDictionary: { [block: string]: string },
    incrementClassHash: () => string,
    incrementKeyframesHash: () => string,
    incrementFontFaceHash: () => string,
    injectNewClassRule?: (className: string, block: string, pseudo?: string) => void,
    injectNewKeyframesRule?: (name: string, blockList: string) => void,
    injectNewFontFaceRule?: (block: string) => void,
  ) {
    this.injectClassRule = (declarations, pseudo) => {
      const block = parseDeclarationBlock(declarations);
      if (block) {
        const dictionary = pseudo ? (pseudoDictionary[pseudo] = pseudoDictionary[pseudo] || {}) : plainDictionary;
        const existingClassName = dictionary[block];
        if (existingClassName) {
          return existingClassName;
        } else {
          const className = incrementClassHash();
          dictionary[block] = className;
          if (injectNewClassRule) {
            injectNewClassRule(className, block, pseudo);
          }
          return className;
        }
      }
      return '';
    };

    this.injectKeyframesRule = declarationList => {
      let blockList = '';
      for (const identifier in declarationList) {
        const keyframeBlock = parseDeclarationBlock(declarationList[identifier]);
        blockList += formatRule(identifier, keyframeBlock);
      }
      if (blockList) {
        const existingName = keyframesDictionary[blockList];
        if (existingName) {
          return existingName;
        } else {
          const name = incrementKeyframesHash();
          keyframesDictionary[blockList] = name;
          if (injectNewKeyframesRule) {
            injectNewKeyframesRule(name, blockList);
          }
          return name;
        }
      }
      return '';
    };

    this.injectFontFaceRule = originalDeclarations => {
      if (process.env.NODE_ENV !== 'production') {
        if ('fontFamily' in originalDeclarations) {
          console.warn('The CSS property `font-family` font face will be ignored in %O', originalDeclarations);
        }
      }
      delete (originalDeclarations as any).fontFamily;
      const originalBlock = parseDeclarationBlock(originalDeclarations);
      if (originalBlock) {
        const existingClassName = fontFaceOriginalDictionary[originalBlock];
        if (existingClassName) {
          return existingClassName;
        } else {
          const name = incrementFontFaceHash();
          const declarations = { ...originalDeclarations, fontFamily: name };
          const block = parseDeclarationBlock(declarations);
          fontFaceDictionary[block] = fontFaceOriginalDictionary[originalBlock] = name;
          if (injectNewFontFaceRule) {
            injectNewFontFaceRule(block);
          }
          return name;
        }
      }
      return '';
    };
  }
}
