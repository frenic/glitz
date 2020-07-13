import * as Glitz from '@glitz/type';
import * as CSS from 'csstype';
import { lengthSafeProperties, TimeProperties, timeSafeProperties } from './properties';

export type LengthUnit =
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

export type TimeUnit = 'ms' | 's';

export type Options = {
  defaultUnit?: LengthUnit;
} & { [property in Exclude<keyof Glitz.ResolvedProperties, TimeProperties>]?: LengthUnit } &
  { [property in TimeProperties]?: TimeUnit };

const defaultTimeUnit = 'ms';

export function createNumberToLengthTransformer(options: Options = {}) {
  const defaultLengthUnit = options.defaultUnit || 'px';

  const convert = (property: string, value: string | number) =>
    typeof value === 'number' &&
    // Don't add unit for `0` lengths
    !(lengthSafeProperties[property] === 0 && value === 0)
      ? value +
        (options[property as keyof Glitz.ResolvedProperties] ||
          (timeSafeProperties[property] === 0 ? defaultTimeUnit : defaultLengthUnit))
      : value;

  return (declarations: Glitz.ResolvedDeclarations): Glitz.ResolvedDeclarations => {
    const transformed: Glitz.ResolvedDeclarations = {};
    for (const property in declarations) {
      let value = declarations[property];

      if (property in options || lengthSafeProperties[property] === 0 || timeSafeProperties[property] === 0) {
        if (Array.isArray(value)) {
          const values = [];

          for (const entry of value) {
            values.push(convert(property, entry));
          }

          value = values;
        } else {
          value = convert(property, value);
        }
      }

      transformed[property] = value;
    }
    return transformed;
  };
}

export default createNumberToLengthTransformer();

declare module '@glitz/type' {
  type LengthAndTime = (string & {}) | (number & {});

  interface TransformerProperties {
    // HTML Length
    background?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['background'];
    backgroundPosition?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['backgroundPosition'];
    backgroundPositionX?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['backgroundPositionX'];
    backgroundPositionY?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['backgroundPositionY'];
    backgroundSize?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['backgroundSize'];
    blockSize?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['blockSize'];
    border?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['border'];
    borderBlock?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderBlock'];
    borderBlockEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderBlockEnd'];
    borderBlockEndWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderBlockEndWidth'];
    borderBlockStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderBlockStart'];
    borderBlockStartWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderBlockStartWidth'];
    borderBlockWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderBlockWidth'];
    borderBottom?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderBottom'];
    borderBottomLeftRadius?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderBottomLeftRadius'];
    borderBottomRightRadius?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderBottomRightRadius'];
    borderBottomWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderBottomWidth'];
    borderEndEndRadius?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderEndEndRadius'];
    borderEndStartRadius?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderEndStartRadius'];
    borderInline?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderInline'];
    borderInlineEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderInlineEnd'];
    borderInlineEndWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderInlineEndWidth'];
    borderInlineStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderInlineStart'];
    borderInlineStartWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderInlineStartWidth'];
    borderInlineWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderInlineWidth'];
    borderLeft?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderLeft'];
    borderLeftWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderLeftWidth'];
    borderRadius?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderRadius'];
    borderRight?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderRight'];
    borderRightWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderRightWidth'];
    borderSpacing?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderSpacing'];
    borderStartEndRadius?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderStartEndRadius'];
    borderStartStartRadius?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderStartStartRadius'];
    borderTop?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderTop'];
    borderTopLeftRadius?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderTopLeftRadius'];
    borderTopRightRadius?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderTopRightRadius'];
    borderTopWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderTopWidth'];
    borderWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['borderWidth'];
    bottom?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['bottom'];
    columnGap?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['columnGap'];
    columnRule?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['columnRule'];
    columnRuleWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['columnRuleWidth'];
    columnWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['columnWidth'];
    flexBasis?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['flexBasis'];
    fontSize?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['fontSize'];
    gap?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['gap'];
    gridAutoColumns?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['gridAutoColumns'];
    gridAutoRows?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['gridAutoRows'];
    gridColumnGap?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['gridColumnGap'];
    gridGap?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['gridGap'];
    gridRowGap?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['gridRowGap'];
    gridTemplateColumns?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['gridTemplateColumns'];
    gridTemplateRows?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['gridTemplateRows'];
    height?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['height'];
    inlineSize?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['inlineSize'];
    inset?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['inset'];
    insetBlock?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['insetBlock'];
    insetBlockEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['insetBlockEnd'];
    insetBlockStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['insetBlockStart'];
    insetInline?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['insetInline'];
    insetInlineEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['insetInlineEnd'];
    insetInlineStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['insetInlineStart'];
    left?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['left'];
    letterSpacing?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['letterSpacing'];
    lineHeightStep?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['lineHeightStep'];
    margin?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['margin'];
    marginBlock?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['marginBlock'];
    marginBlockEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['marginBlockEnd'];
    marginBlockStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['marginBlockStart'];
    marginBottom?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['marginBottom'];
    marginInline?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['marginInline'];
    marginInlineEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['marginInlineEnd'];
    marginInlineStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['marginInlineStart'];
    marginLeft?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['marginLeft'];
    marginRight?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['marginRight'];
    marginTop?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['marginTop'];
    mask?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['mask'];
    maskPosition?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['maskPosition'];
    maskSize?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['maskSize'];
    maxBlockSize?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['maxBlockSize'];
    maxHeight?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['maxHeight'];
    maxInlineSize?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['maxInlineSize'];
    maxWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['maxWidth'];
    minBlockSize?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['minBlockSize'];
    minHeight?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['minHeight'];
    minInlineSize?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['minInlineSize'];
    minWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['minWidth'];
    motion?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['motion'];
    motionDistance?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['motionDistance'];
    objectPosition?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['objectPosition'];
    offset?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['offset'];
    offsetAnchor?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['offsetAnchor'];
    offsetBlock?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['offsetBlock'];
    offsetBlockEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['offsetBlockEnd'];
    offsetBlockStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['offsetBlockStart'];
    offsetDistance?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['offsetDistance'];
    offsetInline?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['offsetInline'];
    offsetInlineEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['offsetInlineEnd'];
    offsetInlineStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['offsetInlineStart'];
    outline?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['outline'];
    outlineOffset?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['outlineOffset'];
    outlineWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['outlineWidth'];
    padding?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['padding'];
    paddingBlock?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['paddingBlock'];
    paddingBlockEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['paddingBlockEnd'];
    paddingBlockStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['paddingBlockStart'];
    paddingBottom?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['paddingBottom'];
    paddingInline?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['paddingInline'];
    paddingInlineEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['paddingInlineEnd'];
    paddingInlineStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['paddingInlineStart'];
    paddingLeft?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['paddingLeft'];
    paddingRight?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['paddingRight'];
    paddingTop?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['paddingTop'];
    perspective?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['perspective'];
    perspectiveOrigin?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['perspectiveOrigin'];
    right?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['right'];
    rowGap?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['rowGap'];
    scrollMargin?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollMargin'];
    scrollMarginBlock?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollMarginBlock'];
    scrollMarginBlockEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollMarginBlockEnd'];
    scrollMarginBlockStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollMarginBlockStart'];
    scrollMarginBottom?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollMarginBottom'];
    scrollMarginInline?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollMarginInline'];
    scrollMarginInlineEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollMarginInlineEnd'];
    scrollMarginInlineStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollMarginInlineStart'];
    scrollMarginLeft?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollMarginLeft'];
    scrollMarginRight?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollMarginRight'];
    scrollMarginTop?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollMarginTop'];
    scrollPadding?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollPadding'];
    scrollPaddingBlock?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollPaddingBlock'];
    scrollPaddingBlockEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollPaddingBlockEnd'];
    scrollPaddingBlockStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollPaddingBlockStart'];
    scrollPaddingBottom?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollPaddingBottom'];
    scrollPaddingInline?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollPaddingInline'];
    scrollPaddingInlineEnd?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollPaddingInlineEnd'];
    scrollPaddingInlineStart?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollPaddingInlineStart'];
    scrollPaddingLeft?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollPaddingLeft'];
    scrollPaddingRight?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollPaddingRight'];
    scrollPaddingTop?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollPaddingTop'];
    scrollSnapCoordinate?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollSnapCoordinate'];
    scrollSnapDestination?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollSnapDestination'];
    scrollSnapMargin?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollSnapMargin'];
    scrollSnapMarginBottom?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollSnapMarginBottom'];
    scrollSnapMarginLeft?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollSnapMarginLeft'];
    scrollSnapMarginRight?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollSnapMarginRight'];
    scrollSnapMarginTop?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['scrollSnapMarginTop'];
    shapeMargin?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['shapeMargin'];
    textDecoration?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['textDecoration'];
    textDecorationThickness?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['textDecorationThickness'];
    textDecorationWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['textDecorationWidth'];
    textIndent?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['textIndent'];
    textUnderlineOffset?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['textUnderlineOffset'];
    top?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['top'];
    transformOrigin?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['transformOrigin'];
    translate?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['translate'];
    verticalAlign?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['verticalAlign'];
    width?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['width'];
    wordSpacing?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['wordSpacing'];
    // HTML Time
    animationDelay?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['animationDelay'];
    animationDuration?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['animationDuration'];
    transition?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['transition'];
    transitionDelay?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['transitionDelay'];
    transitionDuration?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['transitionDuration'];
    // SVG Length
    baselineShift?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['baselineShift'];
    strokeDashoffset?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['strokeDashoffset'];
    strokeWidth?: CSS.PropertiesFallback<LengthAndTime, LengthAndTime>['strokeWidth'];
  }
}
