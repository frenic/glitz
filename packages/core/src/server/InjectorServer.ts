import Injector from '../core/Injector';
import { createInjectorIndexes, InjectorIndexes } from '../utils/create-index';
import { formatClassRule, formatFontFaceRule, formatKeyframesRule, formatSupportsRule } from '../utils/format';
import { HashCounter } from '../utils/hash';

export default class InjectorServer extends Injector {
  public getStyle: (stream?: boolean) => string;
  public hydrateClassName: (body: string, className: string, selector?: string, condition?: string) => void;
  public hydrateKeyframes: (body: string, name: string) => void;
  public hydrateFontFace: (rule: string) => void;
  public clone: (classNameHashClone: HashCounter, keyframesHashClone: HashCounter) => InjectorServer;
  constructor(
    classNameHash: HashCounter,
    keyframesHash: HashCounter,
    postInjection = false,
    fullIndexes: InjectorIndexes = createInjectorIndexes(),
    hydrationIndex: InjectorIndexes = createInjectorIndexes(),
  ) {
    const [getFullIndex, keyframesFullIndex, fontFaceFullIndex, cloneFullIndex] = fullIndexes;

    const [getHydrationIndex, keyframesHydrationIndex, fontFaceHydrationIndex, cloneHydrationIndex] = hydrationIndex;

    const [
      getResultIndex,
      keyframesResultIndex,
      fontFaceResultIndex,
      {},
      plainResultIndex,
      plainSupportsResultIndex,
      selectorResultIndex,
      selectorSupportsResultIndex,
    ] = createInjectorIndexes();

    const [
      getStreamIndex,
      keyframesStreamIndex,
      fontFaceStreamIndex,
      {},
      plainStreamIndex,
      plainSupportsStreamIndex,
      selectorStreamIndex,
      selectorSupportsStreamIndex,
    ] = createInjectorIndexes();

    let globalsResult = '';
    let globalsStream = '';

    super(
      (block, selector, condition) => {
        postInjection = true;
        const full = getFullIndex(selector, condition);

        if (full[block]) {
          return full[block];
        }

        const className = classNameHash();

        const result = getResultIndex(selector, condition);
        const stream = getStreamIndex(selector, condition);
        full[block] = result[block] = stream[block] = className;

        return className;
      },
      blockList => {
        postInjection = true;
        if (keyframesFullIndex[blockList]) {
          return keyframesFullIndex[blockList];
        }

        const name = keyframesHash();
        keyframesFullIndex[blockList] = keyframesResultIndex[blockList] = keyframesStreamIndex[blockList] = name;

        return name;
      },
      block => {
        postInjection = true;
        if (fontFaceFullIndex.indexOf(block) === -1) {
          fontFaceFullIndex.push(block);
          fontFaceResultIndex.push(block);
          fontFaceStreamIndex.push(block);
        }
      },
      rule => {
        globalsResult += rule;
        globalsStream += rule;
      },
    );

    this.getStyle = (stream = false) => {
      let result = '';

      if (stream) {
        result += globalsStream;
        globalsStream = '';
      } else {
        result += globalsResult;
      }

      const fontFaces = stream ? fontFaceStreamIndex : fontFaceResultIndex;
      for (const block of fontFaces) {
        result += formatFontFaceRule(block);
      }

      if (stream) {
        fontFaceStreamIndex.length = 0;
      }

      const keyframes = stream ? keyframesStreamIndex : keyframesResultIndex;
      for (const blockList in keyframes) {
        result += formatKeyframesRule(keyframes[blockList], blockList);

        if (stream) {
          delete keyframesStreamIndex[blockList];
        }
      }

      const plains = stream ? plainStreamIndex : plainResultIndex;
      for (const block in plains) {
        result += formatClassRule(plains[block], block);

        if (stream) {
          delete plainStreamIndex[block];
        }
      }

      const supportsBlocks: Record<string, string> = {};

      const plainSupports = stream ? plainSupportsStreamIndex : plainSupportsResultIndex;
      for (const condition in plainSupports) {
        for (const block in plainSupports[condition]) {
          // result += formatSupportsRule(condition, formatClassRule(plainSupports[condition][block], block));
          supportsBlocks[condition] ??= '';
          supportsBlocks[condition] += formatClassRule(plainSupports[condition][block], block);
        }

        if (stream) {
          delete plainSupportsStreamIndex[condition];
        }
      }

      const selectors = stream ? selectorStreamIndex : selectorResultIndex;
      for (const selector in selectors) {
        const index = selectors[selector];
        for (const block in index) {
          result += formatClassRule(index[block], block, selector);
        }

        if (stream) {
          delete selectorStreamIndex[selector];
        }
      }

      const selectorSupports = stream ? selectorSupportsStreamIndex : selectorSupportsResultIndex;
      for (const condition in selectorSupports) {
        for (const selector in selectorSupports[condition]) {
          const index = selectorSupports[condition][selector];
          for (const block in index) {
            supportsBlocks[condition] ??= '';
            supportsBlocks[condition] += formatClassRule(index[block], block, selector);
          }
        }

        if (stream) {
          delete selectorSupportsStreamIndex[condition];
        }
      }

      for (const condition in supportsBlocks) {
        result += formatSupportsRule(condition, supportsBlocks[condition]);
      }

      return result;
    };

    function createPreActionCheck(action: string) {
      return () => {
        if (postInjection) {
          throw new Error(`${action} is prohibited after injections`);
        }
      };
    }

    const preHydrationCheck = createPreActionCheck('Hydration');

    this.hydrateClassName = (body, className, selector, condition) => {
      preHydrationCheck();
      classNameHash();
      const full = getFullIndex(selector, condition);
      const hydration = getHydrationIndex(selector, condition);
      full[body] = hydration[body] = className;
    };

    this.hydrateKeyframes = (body, name) => {
      preHydrationCheck();
      keyframesHash();
      keyframesFullIndex[body] = name;
      keyframesHydrationIndex[body] = name;
    };

    this.hydrateFontFace = rule => {
      preHydrationCheck();
      fontFaceFullIndex.push(rule);
      fontFaceHydrationIndex.push(rule);
    };

    const preCloningCheck = createPreActionCheck('Cloning');

    this.clone = (classNameHashClone, keyframesHashClone) => {
      preCloningCheck();

      return new InjectorServer(
        classNameHashClone,
        keyframesHashClone,
        postInjection,
        cloneFullIndex(),
        cloneHydrationIndex(),
      );
    };
  }
}
