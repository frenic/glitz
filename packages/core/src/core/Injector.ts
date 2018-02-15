import { FontFace, Properties, PropertiesList } from '@glitz/type';
import { formatRule } from '../utils/format';
import { parseDeclarationBlock } from '../utils/parse';

export default class Injector {
  public injectClassRule: (style: Properties, pseudo?: string) => string | void;
  public injectKeyframesRule: (styleList: PropertiesList) => string | void;
  public injectFontFaceRule: (style: FontFace) => string | void;
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
    injectNewFontFaceRule?: (block: string) => void,
  ) {
    this.injectClassRule = (style, pseudo) => {
      const block = parseDeclarationBlock(style);
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

    this.injectKeyframesRule = styleList => {
      let blockList = '';
      for (const identifier in styleList) {
        const keyframeBlock = parseDeclarationBlock(styleList[identifier]);
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

    this.injectFontFaceRule = style => {
      if (process.env.NODE_ENV !== 'production') {
        if ('fontFamily' in style) {
          console.error('Defined font family for font faces are ignored');
        }
      }
      delete (style as any).fontFamily;
      const block = parseDeclarationBlock(style);
      if (block) {
        const existingClassName = fontFaceDictionary[block];
        if (existingClassName) {
          return existingClassName;
        } else {
          style = { ...style };
          const name = incrementFontFaceHash();
          (style as any).fontFamily = name;
          fontFaceDictionary[block] = name;
          if (injectNewFontFaceRule) {
            injectNewFontFaceRule(parseDeclarationBlock(style));
          }
          return name;
        }
      }
      return '';
    };
  }
}
