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
} & { [property in Exclude<keyof Glitz.UntransformedProperties, TimeProperties>]?: LengthUnit } &
  { [property in TimeProperties]?: TimeUnit };

const defaultTimeUnit = 'ms';

export function createNumberToLengthTransformer(options: Options = {}) {
  const defaultLengthUnit = options.defaultUnit || 'px';

  const convert = <TValue>(property: keyof Glitz.UntransformedProperties, value: TValue) =>
    typeof value === 'number' &&
    // Don't add unit for `0` lengths
    !(lengthSafeProperties[property] === 0 && value === 0)
      ? value + (options[property] || (timeSafeProperties[property] === 0 ? defaultTimeUnit : defaultLengthUnit))
      : value;

  return (declarations: Glitz.UntransformedProperties): Glitz.Properties => {
    const transformed: Glitz.Properties = {};
    let property: keyof Glitz.UntransformedProperties;
    for (property in declarations) {
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

      (transformed as any)[property] = value;
    }
    return transformed;
  };
}

export default createNumberToLengthTransformer();

type StringNumber = (string & {}) | (number & {});
type PropertiesWithNumber = CSS.PropertiesFallback<StringNumber, StringNumber>;

declare module '@glitz/type' {
  interface TransformerProperties {
    // HTML Length
    background?: PropertiesWithNumber['background'];
    backgroundPosition?: PropertiesWithNumber['backgroundPosition'];
    backgroundPositionX?: PropertiesWithNumber['backgroundPositionX'];
    backgroundPositionY?: PropertiesWithNumber['backgroundPositionY'];
    backgroundSize?: PropertiesWithNumber['backgroundSize'];
    blockSize?: PropertiesWithNumber['blockSize'];
    border?: PropertiesWithNumber['border'];
    borderBlock?: PropertiesWithNumber['borderBlock'];
    borderBlockEnd?: PropertiesWithNumber['borderBlockEnd'];
    borderBlockEndWidth?: PropertiesWithNumber['borderBlockEndWidth'];
    borderBlockStart?: PropertiesWithNumber['borderBlockStart'];
    borderBlockStartWidth?: PropertiesWithNumber['borderBlockStartWidth'];
    borderBlockWidth?: PropertiesWithNumber['borderBlockWidth'];
    borderBottom?: PropertiesWithNumber['borderBottom'];
    borderBottomLeftRadius?: PropertiesWithNumber['borderBottomLeftRadius'];
    borderBottomRightRadius?: PropertiesWithNumber['borderBottomRightRadius'];
    borderBottomWidth?: PropertiesWithNumber['borderBottomWidth'];
    borderEndEndRadius?: PropertiesWithNumber['borderEndEndRadius'];
    borderEndStartRadius?: PropertiesWithNumber['borderEndStartRadius'];
    borderInline?: PropertiesWithNumber['borderInline'];
    borderInlineEnd?: PropertiesWithNumber['borderInlineEnd'];
    borderInlineEndWidth?: PropertiesWithNumber['borderInlineEndWidth'];
    borderInlineStart?: PropertiesWithNumber['borderInlineStart'];
    borderInlineStartWidth?: PropertiesWithNumber['borderInlineStartWidth'];
    borderInlineWidth?: PropertiesWithNumber['borderInlineWidth'];
    borderLeft?: PropertiesWithNumber['borderLeft'];
    borderLeftWidth?: PropertiesWithNumber['borderLeftWidth'];
    borderRadius?: PropertiesWithNumber['borderRadius'];
    borderRight?: PropertiesWithNumber['borderRight'];
    borderRightWidth?: PropertiesWithNumber['borderRightWidth'];
    borderSpacing?: PropertiesWithNumber['borderSpacing'];
    borderStartEndRadius?: PropertiesWithNumber['borderStartEndRadius'];
    borderStartStartRadius?: PropertiesWithNumber['borderStartStartRadius'];
    borderTop?: PropertiesWithNumber['borderTop'];
    borderTopLeftRadius?: PropertiesWithNumber['borderTopLeftRadius'];
    borderTopRightRadius?: PropertiesWithNumber['borderTopRightRadius'];
    borderTopWidth?: PropertiesWithNumber['borderTopWidth'];
    borderWidth?: PropertiesWithNumber['borderWidth'];
    bottom?: PropertiesWithNumber['bottom'];
    columnGap?: PropertiesWithNumber['columnGap'];
    columnRule?: PropertiesWithNumber['columnRule'];
    columnRuleWidth?: PropertiesWithNumber['columnRuleWidth'];
    columnWidth?: PropertiesWithNumber['columnWidth'];
    flexBasis?: PropertiesWithNumber['flexBasis'];
    fontSize?: PropertiesWithNumber['fontSize'];
    gap?: PropertiesWithNumber['gap'];
    gridAutoColumns?: PropertiesWithNumber['gridAutoColumns'];
    gridAutoRows?: PropertiesWithNumber['gridAutoRows'];
    gridColumnGap?: PropertiesWithNumber['gridColumnGap'];
    gridGap?: PropertiesWithNumber['gridGap'];
    gridRowGap?: PropertiesWithNumber['gridRowGap'];
    gridTemplateColumns?: PropertiesWithNumber['gridTemplateColumns'];
    gridTemplateRows?: PropertiesWithNumber['gridTemplateRows'];
    height?: PropertiesWithNumber['height'];
    inlineSize?: PropertiesWithNumber['inlineSize'];
    inset?: PropertiesWithNumber['inset'];
    insetBlock?: PropertiesWithNumber['insetBlock'];
    insetBlockEnd?: PropertiesWithNumber['insetBlockEnd'];
    insetBlockStart?: PropertiesWithNumber['insetBlockStart'];
    insetInline?: PropertiesWithNumber['insetInline'];
    insetInlineEnd?: PropertiesWithNumber['insetInlineEnd'];
    insetInlineStart?: PropertiesWithNumber['insetInlineStart'];
    left?: PropertiesWithNumber['left'];
    letterSpacing?: PropertiesWithNumber['letterSpacing'];
    lineHeightStep?: PropertiesWithNumber['lineHeightStep'];
    margin?: PropertiesWithNumber['margin'];
    marginBlock?: PropertiesWithNumber['marginBlock'];
    marginBlockEnd?: PropertiesWithNumber['marginBlockEnd'];
    marginBlockStart?: PropertiesWithNumber['marginBlockStart'];
    marginBottom?: PropertiesWithNumber['marginBottom'];
    marginInline?: PropertiesWithNumber['marginInline'];
    marginInlineEnd?: PropertiesWithNumber['marginInlineEnd'];
    marginInlineStart?: PropertiesWithNumber['marginInlineStart'];
    marginLeft?: PropertiesWithNumber['marginLeft'];
    marginRight?: PropertiesWithNumber['marginRight'];
    marginTop?: PropertiesWithNumber['marginTop'];
    mask?: PropertiesWithNumber['mask'];
    maskPosition?: PropertiesWithNumber['maskPosition'];
    maskSize?: PropertiesWithNumber['maskSize'];
    maxBlockSize?: PropertiesWithNumber['maxBlockSize'];
    maxHeight?: PropertiesWithNumber['maxHeight'];
    maxInlineSize?: PropertiesWithNumber['maxInlineSize'];
    maxWidth?: PropertiesWithNumber['maxWidth'];
    minBlockSize?: PropertiesWithNumber['minBlockSize'];
    minHeight?: PropertiesWithNumber['minHeight'];
    minInlineSize?: PropertiesWithNumber['minInlineSize'];
    minWidth?: PropertiesWithNumber['minWidth'];
    motion?: PropertiesWithNumber['motion'];
    motionDistance?: PropertiesWithNumber['motionDistance'];
    objectPosition?: PropertiesWithNumber['objectPosition'];
    offset?: PropertiesWithNumber['offset'];
    offsetAnchor?: PropertiesWithNumber['offsetAnchor'];
    offsetBlock?: PropertiesWithNumber['offsetBlock'];
    offsetBlockEnd?: PropertiesWithNumber['offsetBlockEnd'];
    offsetBlockStart?: PropertiesWithNumber['offsetBlockStart'];
    offsetDistance?: PropertiesWithNumber['offsetDistance'];
    offsetInline?: PropertiesWithNumber['offsetInline'];
    offsetInlineEnd?: PropertiesWithNumber['offsetInlineEnd'];
    offsetInlineStart?: PropertiesWithNumber['offsetInlineStart'];
    outline?: PropertiesWithNumber['outline'];
    outlineOffset?: PropertiesWithNumber['outlineOffset'];
    outlineWidth?: PropertiesWithNumber['outlineWidth'];
    padding?: PropertiesWithNumber['padding'];
    paddingBlock?: PropertiesWithNumber['paddingBlock'];
    paddingBlockEnd?: PropertiesWithNumber['paddingBlockEnd'];
    paddingBlockStart?: PropertiesWithNumber['paddingBlockStart'];
    paddingBottom?: PropertiesWithNumber['paddingBottom'];
    paddingInline?: PropertiesWithNumber['paddingInline'];
    paddingInlineEnd?: PropertiesWithNumber['paddingInlineEnd'];
    paddingInlineStart?: PropertiesWithNumber['paddingInlineStart'];
    paddingLeft?: PropertiesWithNumber['paddingLeft'];
    paddingRight?: PropertiesWithNumber['paddingRight'];
    paddingTop?: PropertiesWithNumber['paddingTop'];
    perspective?: PropertiesWithNumber['perspective'];
    perspectiveOrigin?: PropertiesWithNumber['perspectiveOrigin'];
    right?: PropertiesWithNumber['right'];
    rowGap?: PropertiesWithNumber['rowGap'];
    scrollMargin?: PropertiesWithNumber['scrollMargin'];
    scrollMarginBlock?: PropertiesWithNumber['scrollMarginBlock'];
    scrollMarginBlockEnd?: PropertiesWithNumber['scrollMarginBlockEnd'];
    scrollMarginBlockStart?: PropertiesWithNumber['scrollMarginBlockStart'];
    scrollMarginBottom?: PropertiesWithNumber['scrollMarginBottom'];
    scrollMarginInline?: PropertiesWithNumber['scrollMarginInline'];
    scrollMarginInlineEnd?: PropertiesWithNumber['scrollMarginInlineEnd'];
    scrollMarginInlineStart?: PropertiesWithNumber['scrollMarginInlineStart'];
    scrollMarginLeft?: PropertiesWithNumber['scrollMarginLeft'];
    scrollMarginRight?: PropertiesWithNumber['scrollMarginRight'];
    scrollMarginTop?: PropertiesWithNumber['scrollMarginTop'];
    scrollPadding?: PropertiesWithNumber['scrollPadding'];
    scrollPaddingBlock?: PropertiesWithNumber['scrollPaddingBlock'];
    scrollPaddingBlockEnd?: PropertiesWithNumber['scrollPaddingBlockEnd'];
    scrollPaddingBlockStart?: PropertiesWithNumber['scrollPaddingBlockStart'];
    scrollPaddingBottom?: PropertiesWithNumber['scrollPaddingBottom'];
    scrollPaddingInline?: PropertiesWithNumber['scrollPaddingInline'];
    scrollPaddingInlineEnd?: PropertiesWithNumber['scrollPaddingInlineEnd'];
    scrollPaddingInlineStart?: PropertiesWithNumber['scrollPaddingInlineStart'];
    scrollPaddingLeft?: PropertiesWithNumber['scrollPaddingLeft'];
    scrollPaddingRight?: PropertiesWithNumber['scrollPaddingRight'];
    scrollPaddingTop?: PropertiesWithNumber['scrollPaddingTop'];
    scrollSnapCoordinate?: PropertiesWithNumber['scrollSnapCoordinate'];
    scrollSnapDestination?: PropertiesWithNumber['scrollSnapDestination'];
    scrollSnapMargin?: PropertiesWithNumber['scrollSnapMargin'];
    scrollSnapMarginBottom?: PropertiesWithNumber['scrollSnapMarginBottom'];
    scrollSnapMarginLeft?: PropertiesWithNumber['scrollSnapMarginLeft'];
    scrollSnapMarginRight?: PropertiesWithNumber['scrollSnapMarginRight'];
    scrollSnapMarginTop?: PropertiesWithNumber['scrollSnapMarginTop'];
    shapeMargin?: PropertiesWithNumber['shapeMargin'];
    textDecoration?: PropertiesWithNumber['textDecoration'];
    textDecorationThickness?: PropertiesWithNumber['textDecorationThickness'];
    textDecorationWidth?: PropertiesWithNumber['textDecorationWidth'];
    textIndent?: PropertiesWithNumber['textIndent'];
    textUnderlineOffset?: PropertiesWithNumber['textUnderlineOffset'];
    top?: PropertiesWithNumber['top'];
    transformOrigin?: PropertiesWithNumber['transformOrigin'];
    translate?: PropertiesWithNumber['translate'];
    verticalAlign?: PropertiesWithNumber['verticalAlign'];
    width?: PropertiesWithNumber['width'];
    wordSpacing?: PropertiesWithNumber['wordSpacing'];
    // HTML Time
    animationDelay?: PropertiesWithNumber['animationDelay'];
    animationDuration?: PropertiesWithNumber['animationDuration'];
    transition?: PropertiesWithNumber['transition'];
    transitionDelay?: PropertiesWithNumber['transitionDelay'];
    transitionDuration?: PropertiesWithNumber['transitionDuration'];
    // SVG Length
    baselineShift?: PropertiesWithNumber['baselineShift'];
    strokeDashoffset?: PropertiesWithNumber['strokeDashoffset'];
    strokeWidth?: PropertiesWithNumber['strokeWidth'];
  }
}
