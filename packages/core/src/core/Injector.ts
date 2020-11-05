import { ResolvedDeclarationList, ResolvedDeclarations } from '../style';
import { formatRule, prettifyRule } from '../utils/format';
import { parseDeclarationBlock } from '../utils/parse';

export const ANIMATION_NAME = 'animationName';
export const FONT_FAMILY = 'fontFamily';

export default class Injector {
  public injectClassName: (declarations: ResolvedDeclarations, selector?: string) => string;
  public injectKeyframes: (declarationList: ResolvedDeclarationList) => string;
  public injectFontFace: (declarations: ResolvedDeclarations) => string;
  public injectGlobals: (declarations: ResolvedDeclarations, selector: string) => void;
  constructor(
    className: (block: string, selector?: string) => string,
    keyframes: (blockList: string) => string,
    fontFace: (block: string) => void,
    globals: (rule: string) => void,
  ) {
    this.injectClassName = (declarations, selector) => {
      return className(parseDeclarationBlock(declarations), selector);
    };

    this.injectKeyframes = declarationList => {
      let blockList = '';
      for (const identifier in declarationList) {
        blockList += formatRule(identifier, parseDeclarationBlock(declarationList[identifier]));
      }

      return keyframes(blockList);
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

      fontFace(parseDeclarationBlock(declarations));

      return family;
    };

    this.injectGlobals = (declarations, selector) => {
      const rule = formatRule(selector, parseDeclarationBlock(declarations));
      globals(rule);
    };
  }
}
