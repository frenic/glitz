import { FontFace, Properties, PropertiesList } from '@glitz/type';
import { formatRule } from '../utils/format';
import { parseDeclarationBlock } from '../utils/parse';

export const ANIMATION_NAME = 'animationName';
export const FONT_FAMILY = 'fontFamily';

export default class Injector {
  public injectClassName: (declarations: Properties, pseudo?: string) => string;
  public injectKeyframes: (declarationList: PropertiesList) => string;
  public injectFontFace: (declarations: FontFace) => string;
  constructor(
    plainDictionary: { [block: string]: string },
    pseudoDictionary: { [pseudo: string]: { [block: string]: string } },
    keyframesDictionary: { [blockList: string]: string },
    fontFaceDictionary: { [block: string]: string },
    incrementClassHash: () => string,
    incrementKeyframesHash: () => string,
    incrementFontFaceHash: () => string,
    injectNewClassRule?: (className: string, block: string, pseudo?: string) => void,
    injectNewKeyframesRule?: (name: string, blockList: string) => void,
    injectNewFontFaceRule?: (name: string, block: string) => void,
  ) {
    this.injectClassName = (declarations, pseudo) => {
      const block = parseDeclarationBlock(declarations);
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
    };

    this.injectKeyframes = declarationList => {
      let blockList = '';
      for (const identifier in declarationList) {
        const keyframeBlock = parseDeclarationBlock(declarationList[identifier]);
        blockList += formatRule(identifier, keyframeBlock);
      }
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
    };

    this.injectFontFace = original => {
      if (process.env.NODE_ENV !== 'production') {
        if (FONT_FAMILY in original) {
          console.warn('The CSS property `%s` in font face will be ignored in %O', FONT_FAMILY, original);
        }
      }

      const declarations: FontFace = {};
      let property: keyof FontFace | typeof FONT_FAMILY;
      for (property in original) {
        if (property !== FONT_FAMILY) {
          declarations[property] = original[property];
        }
      }

      const block = parseDeclarationBlock(declarations);
      const existingClassName = fontFaceDictionary[block];
      if (existingClassName) {
        return existingClassName;
      } else {
        const name = incrementFontFaceHash();
        fontFaceDictionary[block] = name;
        if (injectNewFontFaceRule) {
          injectNewFontFaceRule(name, block);
        }
        return name;
      }
    };
  }
}
