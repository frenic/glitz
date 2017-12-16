import { Properties, PropertiesList } from '../types/style';
import { formatRule } from '../utils/format';
import { parseDeclarationBlock } from '../utils/parse';

export default class InjectorClient {
  public injectClassRule: (style: Properties, pseudo?: string) => string | void;
  public injectKeyframesRule: (styleList: PropertiesList) => string | void;
  constructor(
    plainDictionary: { [block: string]: string },
    pseudoDictionary: { [pseudo: string]: { [block: string]: string } },
    keyframesDictionary: { [blockList: string]: string },
    incrementClassHash: () => string,
    incrementKeyframesHash: () => string,
    injectNewClassRule?: (className: string, block: string, pseudo?: string) => void,
    injectNewKeyframesRule?: (name: string, blockList: string) => void,
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
  }
}
