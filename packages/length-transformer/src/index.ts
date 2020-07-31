import * as Glitz from '@glitz/type';
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
    background?: Glitz.Properties<LengthAndTime, LengthAndTime>['background'];
    backgroundPosition?: Glitz.Properties<LengthAndTime, LengthAndTime>['backgroundPosition'];
    backgroundPositionX?: Glitz.Properties<LengthAndTime, LengthAndTime>['backgroundPositionX'];
    backgroundPositionY?: Glitz.Properties<LengthAndTime, LengthAndTime>['backgroundPositionY'];
    backgroundSize?: Glitz.Properties<LengthAndTime, LengthAndTime>['backgroundSize'];
    blockSize?: Glitz.Properties<LengthAndTime, LengthAndTime>['blockSize'];
    border?: Glitz.Properties<LengthAndTime, LengthAndTime>['border'];
    borderBlock?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderBlock'];
    borderBlockEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderBlockEnd'];
    borderBlockEndWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderBlockEndWidth'];
    borderBlockStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderBlockStart'];
    borderBlockStartWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderBlockStartWidth'];
    borderBlockWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderBlockWidth'];
    borderBottom?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderBottom'];
    borderBottomLeftRadius?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderBottomLeftRadius'];
    borderBottomRightRadius?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderBottomRightRadius'];
    borderBottomWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderBottomWidth'];
    borderEndEndRadius?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderEndEndRadius'];
    borderEndStartRadius?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderEndStartRadius'];
    borderInline?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderInline'];
    borderInlineEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderInlineEnd'];
    borderInlineEndWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderInlineEndWidth'];
    borderInlineStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderInlineStart'];
    borderInlineStartWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderInlineStartWidth'];
    borderInlineWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderInlineWidth'];
    borderLeft?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderLeft'];
    borderLeftWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderLeftWidth'];
    borderRadius?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderRadius'];
    borderRight?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderRight'];
    borderRightWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderRightWidth'];
    borderSpacing?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderSpacing'];
    borderStartEndRadius?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderStartEndRadius'];
    borderStartStartRadius?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderStartStartRadius'];
    borderTop?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderTop'];
    borderTopLeftRadius?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderTopLeftRadius'];
    borderTopRightRadius?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderTopRightRadius'];
    borderTopWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderTopWidth'];
    borderWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['borderWidth'];
    bottom?: Glitz.Properties<LengthAndTime, LengthAndTime>['bottom'];
    columnGap?: Glitz.Properties<LengthAndTime, LengthAndTime>['columnGap'];
    columnRule?: Glitz.Properties<LengthAndTime, LengthAndTime>['columnRule'];
    columnRuleWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['columnRuleWidth'];
    columnWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['columnWidth'];
    flexBasis?: Glitz.Properties<LengthAndTime, LengthAndTime>['flexBasis'];
    fontSize?: Glitz.Properties<LengthAndTime, LengthAndTime>['fontSize'];
    gap?: Glitz.Properties<LengthAndTime, LengthAndTime>['gap'];
    gridAutoColumns?: Glitz.Properties<LengthAndTime, LengthAndTime>['gridAutoColumns'];
    gridAutoRows?: Glitz.Properties<LengthAndTime, LengthAndTime>['gridAutoRows'];
    gridColumnGap?: Glitz.Properties<LengthAndTime, LengthAndTime>['gridColumnGap'];
    gridGap?: Glitz.Properties<LengthAndTime, LengthAndTime>['gridGap'];
    gridRowGap?: Glitz.Properties<LengthAndTime, LengthAndTime>['gridRowGap'];
    gridTemplateColumns?: Glitz.Properties<LengthAndTime, LengthAndTime>['gridTemplateColumns'];
    gridTemplateRows?: Glitz.Properties<LengthAndTime, LengthAndTime>['gridTemplateRows'];
    height?: Glitz.Properties<LengthAndTime, LengthAndTime>['height'];
    inlineSize?: Glitz.Properties<LengthAndTime, LengthAndTime>['inlineSize'];
    inset?: Glitz.Properties<LengthAndTime, LengthAndTime>['inset'];
    insetBlock?: Glitz.Properties<LengthAndTime, LengthAndTime>['insetBlock'];
    insetBlockEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['insetBlockEnd'];
    insetBlockStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['insetBlockStart'];
    insetInline?: Glitz.Properties<LengthAndTime, LengthAndTime>['insetInline'];
    insetInlineEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['insetInlineEnd'];
    insetInlineStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['insetInlineStart'];
    left?: Glitz.Properties<LengthAndTime, LengthAndTime>['left'];
    letterSpacing?: Glitz.Properties<LengthAndTime, LengthAndTime>['letterSpacing'];
    lineHeightStep?: Glitz.Properties<LengthAndTime, LengthAndTime>['lineHeightStep'];
    margin?: Glitz.Properties<LengthAndTime, LengthAndTime>['margin'];
    marginBlock?: Glitz.Properties<LengthAndTime, LengthAndTime>['marginBlock'];
    marginBlockEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['marginBlockEnd'];
    marginBlockStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['marginBlockStart'];
    marginBottom?: Glitz.Properties<LengthAndTime, LengthAndTime>['marginBottom'];
    marginInline?: Glitz.Properties<LengthAndTime, LengthAndTime>['marginInline'];
    marginInlineEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['marginInlineEnd'];
    marginInlineStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['marginInlineStart'];
    marginLeft?: Glitz.Properties<LengthAndTime, LengthAndTime>['marginLeft'];
    marginRight?: Glitz.Properties<LengthAndTime, LengthAndTime>['marginRight'];
    marginTop?: Glitz.Properties<LengthAndTime, LengthAndTime>['marginTop'];
    mask?: Glitz.Properties<LengthAndTime, LengthAndTime>['mask'];
    maskPosition?: Glitz.Properties<LengthAndTime, LengthAndTime>['maskPosition'];
    maskSize?: Glitz.Properties<LengthAndTime, LengthAndTime>['maskSize'];
    maxBlockSize?: Glitz.Properties<LengthAndTime, LengthAndTime>['maxBlockSize'];
    maxHeight?: Glitz.Properties<LengthAndTime, LengthAndTime>['maxHeight'];
    maxInlineSize?: Glitz.Properties<LengthAndTime, LengthAndTime>['maxInlineSize'];
    maxWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['maxWidth'];
    minBlockSize?: Glitz.Properties<LengthAndTime, LengthAndTime>['minBlockSize'];
    minHeight?: Glitz.Properties<LengthAndTime, LengthAndTime>['minHeight'];
    minInlineSize?: Glitz.Properties<LengthAndTime, LengthAndTime>['minInlineSize'];
    minWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['minWidth'];
    motion?: Glitz.Properties<LengthAndTime, LengthAndTime>['motion'];
    motionDistance?: Glitz.Properties<LengthAndTime, LengthAndTime>['motionDistance'];
    objectPosition?: Glitz.Properties<LengthAndTime, LengthAndTime>['objectPosition'];
    offset?: Glitz.Properties<LengthAndTime, LengthAndTime>['offset'];
    offsetAnchor?: Glitz.Properties<LengthAndTime, LengthAndTime>['offsetAnchor'];
    offsetBlock?: Glitz.Properties<LengthAndTime, LengthAndTime>['offsetBlock'];
    offsetBlockEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['offsetBlockEnd'];
    offsetBlockStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['offsetBlockStart'];
    offsetDistance?: Glitz.Properties<LengthAndTime, LengthAndTime>['offsetDistance'];
    offsetInline?: Glitz.Properties<LengthAndTime, LengthAndTime>['offsetInline'];
    offsetInlineEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['offsetInlineEnd'];
    offsetInlineStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['offsetInlineStart'];
    outline?: Glitz.Properties<LengthAndTime, LengthAndTime>['outline'];
    outlineOffset?: Glitz.Properties<LengthAndTime, LengthAndTime>['outlineOffset'];
    outlineWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['outlineWidth'];
    padding?: Glitz.Properties<LengthAndTime, LengthAndTime>['padding'];
    paddingBlock?: Glitz.Properties<LengthAndTime, LengthAndTime>['paddingBlock'];
    paddingBlockEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['paddingBlockEnd'];
    paddingBlockStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['paddingBlockStart'];
    paddingBottom?: Glitz.Properties<LengthAndTime, LengthAndTime>['paddingBottom'];
    paddingInline?: Glitz.Properties<LengthAndTime, LengthAndTime>['paddingInline'];
    paddingInlineEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['paddingInlineEnd'];
    paddingInlineStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['paddingInlineStart'];
    paddingLeft?: Glitz.Properties<LengthAndTime, LengthAndTime>['paddingLeft'];
    paddingRight?: Glitz.Properties<LengthAndTime, LengthAndTime>['paddingRight'];
    paddingTop?: Glitz.Properties<LengthAndTime, LengthAndTime>['paddingTop'];
    perspective?: Glitz.Properties<LengthAndTime, LengthAndTime>['perspective'];
    perspectiveOrigin?: Glitz.Properties<LengthAndTime, LengthAndTime>['perspectiveOrigin'];
    right?: Glitz.Properties<LengthAndTime, LengthAndTime>['right'];
    rowGap?: Glitz.Properties<LengthAndTime, LengthAndTime>['rowGap'];
    scrollMargin?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollMargin'];
    scrollMarginBlock?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollMarginBlock'];
    scrollMarginBlockEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollMarginBlockEnd'];
    scrollMarginBlockStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollMarginBlockStart'];
    scrollMarginBottom?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollMarginBottom'];
    scrollMarginInline?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollMarginInline'];
    scrollMarginInlineEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollMarginInlineEnd'];
    scrollMarginInlineStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollMarginInlineStart'];
    scrollMarginLeft?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollMarginLeft'];
    scrollMarginRight?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollMarginRight'];
    scrollMarginTop?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollMarginTop'];
    scrollPadding?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollPadding'];
    scrollPaddingBlock?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollPaddingBlock'];
    scrollPaddingBlockEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollPaddingBlockEnd'];
    scrollPaddingBlockStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollPaddingBlockStart'];
    scrollPaddingBottom?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollPaddingBottom'];
    scrollPaddingInline?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollPaddingInline'];
    scrollPaddingInlineEnd?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollPaddingInlineEnd'];
    scrollPaddingInlineStart?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollPaddingInlineStart'];
    scrollPaddingLeft?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollPaddingLeft'];
    scrollPaddingRight?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollPaddingRight'];
    scrollPaddingTop?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollPaddingTop'];
    scrollSnapCoordinate?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollSnapCoordinate'];
    scrollSnapDestination?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollSnapDestination'];
    scrollSnapMargin?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollSnapMargin'];
    scrollSnapMarginBottom?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollSnapMarginBottom'];
    scrollSnapMarginLeft?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollSnapMarginLeft'];
    scrollSnapMarginRight?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollSnapMarginRight'];
    scrollSnapMarginTop?: Glitz.Properties<LengthAndTime, LengthAndTime>['scrollSnapMarginTop'];
    shapeMargin?: Glitz.Properties<LengthAndTime, LengthAndTime>['shapeMargin'];
    textDecoration?: Glitz.Properties<LengthAndTime, LengthAndTime>['textDecoration'];
    textDecorationThickness?: Glitz.Properties<LengthAndTime, LengthAndTime>['textDecorationThickness'];
    textDecorationWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['textDecorationWidth'];
    textIndent?: Glitz.Properties<LengthAndTime, LengthAndTime>['textIndent'];
    textUnderlineOffset?: Glitz.Properties<LengthAndTime, LengthAndTime>['textUnderlineOffset'];
    top?: Glitz.Properties<LengthAndTime, LengthAndTime>['top'];
    transformOrigin?: Glitz.Properties<LengthAndTime, LengthAndTime>['transformOrigin'];
    translate?: Glitz.Properties<LengthAndTime, LengthAndTime>['translate'];
    verticalAlign?: Glitz.Properties<LengthAndTime, LengthAndTime>['verticalAlign'];
    width?: Glitz.Properties<LengthAndTime, LengthAndTime>['width'];
    wordSpacing?: Glitz.Properties<LengthAndTime, LengthAndTime>['wordSpacing'];
    // HTML Time
    animationDelay?: Glitz.Properties<LengthAndTime, LengthAndTime>['animationDelay'];
    animationDuration?: Glitz.Properties<LengthAndTime, LengthAndTime>['animationDuration'];
    transition?: Glitz.Properties<LengthAndTime, LengthAndTime>['transition'];
    transitionDelay?: Glitz.Properties<LengthAndTime, LengthAndTime>['transitionDelay'];
    transitionDuration?: Glitz.Properties<LengthAndTime, LengthAndTime>['transitionDuration'];
    // SVG Length
    baselineShift?: Glitz.Properties<LengthAndTime, LengthAndTime>['baselineShift'];
    strokeDashoffset?: Glitz.Properties<LengthAndTime, LengthAndTime>['strokeDashoffset'];
    strokeWidth?: Glitz.Properties<LengthAndTime, LengthAndTime>['strokeWidth'];
  }
}
