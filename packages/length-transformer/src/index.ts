import * as Glitz from '@glitz/type';
import * as CSS from 'csstype';

export type Options = {
  unit?:
    | 'cap'
    | 'ch'
    | 'em'
    | 'ex'
    | 'ic'
    | 'lh'
    | 'rem'
    | 'rlh'
    | 'vh'
    | 'vw'
    | 'vi'
    | 'vb'
    | 'vmin'
    | 'vmax'
    | 'px'
    | 'cm'
    | 'mm'
    | 'Q'
    | 'in'
    | 'pc'
    | 'pt';
};

export function createNumberToLengthTransformer(options: Options = {}) {
  const unit = options.unit || 'px';
  return (original: Glitz.Properties): Glitz.Properties => {
    const declarations: Glitz.Properties = {};
    let property: keyof Glitz.Properties;
    for (property in original) {
      let value = original[property];
      if (lengthProperties.indexOf(property) !== -1) {
        if (typeof value === 'number' && value !== 0) {
          value = value + unit;
        } else if (Array.isArray(value)) {
          const values = [];
          for (const entry of value) {
            if (typeof entry === 'number' && entry !== 0) {
              values.push(entry + unit);
            } else {
              values.push(entry);
            }
          }
          value = values;
        }
      }
      declarations[property] = value;
    }
    return declarations;
  };
}

export default createNumberToLengthTransformer();

const lengthProperties = [
  'blockSize',
  'borderSpacing',
  'bottom',
  'columnWidth',
  'flexBasis',
  'height',
  'inlineSize',
  'left',
  'letterSpacing',
  'lineHeightStep',
  'marginBlockEnd',
  'marginBlockStart',
  'marginBottom',
  'marginInlineEnd',
  'marginInlineStart',
  'marginLeft',
  'marginRight',
  'marginTop',
  'maxBlockSize',
  'maxHeight',
  'maxInlineSize',
  'maxWidth',
  'minBlockSize',
  'minHeight',
  'minInlineSize',
  'minInlineSize',
  'minWidth',
  'offsetBlockEnd',
  'offsetBlockStart',
  'offsetInlineEnd',
  'offsetInlineStart',
  'outlineOffset',
  'paddingBlockEnd',
  'paddingBlockStart',
  'paddingBottom',
  'paddingInlineEnd',
  'paddingInlineStart',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'perspective',
  'right',
  'top',
  'verticalAlign',
  'width',
  'margin',
  'padding',
  'webkitBoxReflect',
  'webkitTextStrokeWidth',
];

declare module '@glitz/type' {
  export interface Properties {
    blockSize?: CSS.StandardLonghandPropertiesFallback<string | number>['blockSize'];
    borderSpacing?: CSS.StandardLonghandPropertiesFallback<string | number>['borderSpacing'];
    bottom?: CSS.StandardLonghandPropertiesFallback<string | number>['bottom'];
    columnWidth?: CSS.StandardLonghandPropertiesFallback<string | number>['columnWidth'];
    flexBasis?: CSS.StandardLonghandPropertiesFallback<string | number>['flexBasis'];
    height?: CSS.StandardLonghandPropertiesFallback<string | number>['height'];
    inlineSize?: CSS.StandardLonghandPropertiesFallback<string | number>['inlineSize'];
    left?: CSS.StandardLonghandPropertiesFallback<string | number>['left'];
    letterSpacing?: CSS.StandardLonghandPropertiesFallback<string | number>['letterSpacing'];
    lineHeightStep?: CSS.StandardLonghandPropertiesFallback<string | number>['lineHeightStep'];
    marginBlockEnd?: CSS.StandardLonghandPropertiesFallback<string | number>['marginBlockEnd'];
    marginBlockStart?: CSS.StandardLonghandPropertiesFallback<string | number>['marginBlockStart'];
    marginBottom?: CSS.StandardLonghandPropertiesFallback<string | number>['marginBottom'];
    marginInlineEnd?: CSS.StandardLonghandPropertiesFallback<string | number>['marginInlineEnd'];
    marginInlineStart?: CSS.StandardLonghandPropertiesFallback<string | number>['marginInlineStart'];
    marginLeft?: CSS.StandardLonghandPropertiesFallback<string | number>['marginLeft'];
    marginRight?: CSS.StandardLonghandPropertiesFallback<string | number>['marginRight'];
    marginTop?: CSS.StandardLonghandPropertiesFallback<string | number>['marginTop'];
    maxBlockSize?: CSS.StandardLonghandPropertiesFallback<string | number>['maxBlockSize'];
    maxHeight?: CSS.StandardLonghandPropertiesFallback<string | number>['maxHeight'];
    maxInlineSize?: CSS.StandardLonghandPropertiesFallback<string | number>['maxInlineSize'];
    maxWidth?: CSS.StandardLonghandPropertiesFallback<string | number>['maxWidth'];
    minBlockSize?: CSS.StandardLonghandPropertiesFallback<string | number>['minBlockSize'];
    minHeight?: CSS.StandardLonghandPropertiesFallback<string | number>['minHeight'];
    minInlineSize?: CSS.StandardLonghandPropertiesFallback<string | number>['minInlineSize'];
    minWidth?: CSS.StandardLonghandPropertiesFallback<string | number>['minWidth'];
    offsetBlockEnd?: CSS.StandardLonghandPropertiesFallback<string | number>['offsetBlockEnd'];
    offsetBlockStart?: CSS.StandardLonghandPropertiesFallback<string | number>['offsetBlockStart'];
    offsetInlineEnd?: CSS.StandardLonghandPropertiesFallback<string | number>['offsetInlineEnd'];
    offsetInlineStart?: CSS.StandardLonghandPropertiesFallback<string | number>['offsetInlineStart'];
    outlineOffset?: CSS.StandardLonghandPropertiesFallback<string | number>['outlineOffset'];
    paddingBlockEnd?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingBlockEnd'];
    paddingBlockStart?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingBlockStart'];
    paddingBottom?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingBottom'];
    paddingInlineEnd?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingInlineEnd'];
    paddingInlineStart?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingInlineStart'];
    paddingLeft?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingLeft'];
    paddingRight?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingRight'];
    paddingTop?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingTop'];
    perspective?: CSS.StandardLonghandPropertiesFallback<string | number>['perspective'];
    right?: CSS.StandardLonghandPropertiesFallback<string | number>['right'];
    top?: CSS.StandardLonghandPropertiesFallback<string | number>['top'];
    verticalAlign?: CSS.StandardLonghandPropertiesFallback<string | number>['verticalAlign'];
    width?: CSS.StandardLonghandPropertiesFallback<string | number>['width'];
    webkitBoxReflect?: CSS.VendorPropertiesFallback<string | number>['webkitBoxReflect'];
    webkitTextStrokeWidth?: CSS.VendorPropertiesFallback<string | number>['webkitTextStrokeWidth'];
  }

  interface FeaturedProperties {
    border?: BorderWithNumber;
    flex?: FlexWithNumber;
    margin?: MarginWithNumber;
    padding?: PaddingWithNumber;
    outline?: OutlineWithNumber;
  }

  interface BorderWithNumber extends Glitz.Omit<Glitz.Border, 'spacing'> {
    spacing?: CSS.StandardLonghandPropertiesFallback<string | number>['borderSpacing'];
  }

  interface FlexWithNumber extends Glitz.Omit<Glitz.Flex, 'basis'> {
    basis?: CSS.StandardLonghandPropertiesFallback<string | number>['flexBasis'];
  }

  interface MarginWithNumber {
    x?: CSS.StandardLonghandPropertiesFallback<string | number>['marginLeft'];
    y?: CSS.StandardLonghandPropertiesFallback<string | number>['marginTop'];
    top?: CSS.StandardLonghandPropertiesFallback<string | number>['marginTop'];
    right?: CSS.StandardLonghandPropertiesFallback<string | number>['marginRight'];
    bottom?: CSS.StandardLonghandPropertiesFallback<string | number>['marginBottom'];
    left?: CSS.StandardLonghandPropertiesFallback<string | number>['marginLeft'];
  }

  interface OutlineWithNumber extends Glitz.Omit<Glitz.Outline, 'offset'> {
    offset?: CSS.StandardLonghandPropertiesFallback<string | number>['outlineOffset'];
  }

  interface PaddingWithNumber {
    x?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingLeft'];
    y?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingTop'];
    top?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingTop'];
    right?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingRight'];
    bottom?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingBottom'];
    left?: CSS.StandardLonghandPropertiesFallback<string | number>['paddingLeft'];
  }
}
