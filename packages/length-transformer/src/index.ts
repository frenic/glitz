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

declare module '@glitz/type' {
  type NumberWithFallback<T> = T | number | Array<T | number>;

  interface TransformerProperties {
    // HTML Length
    background?: CSS.PropertiesFallback<string | number>['background'];
    backgroundPosition?: CSS.PropertiesFallback<string | number>['backgroundPosition'];
    backgroundPositionX?: CSS.PropertiesFallback<string | number>['backgroundPositionX'];
    backgroundPositionY?: CSS.PropertiesFallback<string | number>['backgroundPositionY'];
    backgroundSize?: CSS.PropertiesFallback<string | number>['backgroundSize'];
    blockSize?: CSS.PropertiesFallback<string | number>['blockSize'];
    border?: CSS.PropertiesFallback<string | number>['border'];
    borderBlock?: CSS.PropertiesFallback<string | number>['borderBlock'];
    borderBlockEnd?: CSS.PropertiesFallback<string | number>['borderBlockEnd'];
    borderBlockEndWidth?: CSS.PropertiesFallback<string | number>['borderBlockEndWidth'];
    borderBlockStart?: CSS.PropertiesFallback<string | number>['borderBlockStart'];
    borderBlockStartWidth?: CSS.PropertiesFallback<string | number>['borderBlockStartWidth'];
    borderBlockWidth?: CSS.PropertiesFallback<string | number>['borderBlockWidth'];
    borderBottom?: CSS.PropertiesFallback<string | number>['borderBottom'];
    borderBottomLeftRadius?: CSS.PropertiesFallback<string | number>['borderBottomLeftRadius'];
    borderBottomRightRadius?: CSS.PropertiesFallback<string | number>['borderBottomRightRadius'];
    borderBottomWidth?: CSS.PropertiesFallback<string | number>['borderBottomWidth'];
    borderEndEndRadius?: CSS.PropertiesFallback<string | number>['borderEndEndRadius'];
    borderEndStartRadius?: CSS.PropertiesFallback<string | number>['borderEndStartRadius'];
    borderInline?: CSS.PropertiesFallback<string | number>['borderInline'];
    borderInlineEnd?: CSS.PropertiesFallback<string | number>['borderInlineEnd'];
    borderInlineEndWidth?: CSS.PropertiesFallback<string | number>['borderInlineEndWidth'];
    borderInlineStart?: CSS.PropertiesFallback<string | number>['borderInlineStart'];
    borderInlineStartWidth?: CSS.PropertiesFallback<string | number>['borderInlineStartWidth'];
    borderInlineWidth?: CSS.PropertiesFallback<string | number>['borderInlineWidth'];
    borderLeft?: CSS.PropertiesFallback<string | number>['borderLeft'];
    borderLeftWidth?: CSS.PropertiesFallback<string | number>['borderLeftWidth'];
    borderRadius?: CSS.PropertiesFallback<string | number>['borderRadius'];
    borderRight?: CSS.PropertiesFallback<string | number>['borderRight'];
    borderRightWidth?: CSS.PropertiesFallback<string | number>['borderRightWidth'];
    borderSpacing?: CSS.PropertiesFallback<string | number>['borderSpacing'];
    borderStartEndRadius?: CSS.PropertiesFallback<string | number>['borderStartEndRadius'];
    borderStartStartRadius?: CSS.PropertiesFallback<string | number>['borderStartStartRadius'];
    borderTop?: CSS.PropertiesFallback<string | number>['borderTop'];
    borderTopLeftRadius?: CSS.PropertiesFallback<string | number>['borderTopLeftRadius'];
    borderTopRightRadius?: CSS.PropertiesFallback<string | number>['borderTopRightRadius'];
    borderTopWidth?: CSS.PropertiesFallback<string | number>['borderTopWidth'];
    borderWidth?: CSS.PropertiesFallback<string | number>['borderWidth'];
    bottom?: CSS.PropertiesFallback<string | number>['bottom'];
    columnGap?: CSS.PropertiesFallback<string | number>['columnGap'];
    columnRule?: CSS.PropertiesFallback<string | number>['columnRule'];
    columnRuleWidth?: CSS.PropertiesFallback<string | number>['columnRuleWidth'];
    columnWidth?: CSS.PropertiesFallback<string | number>['columnWidth'];
    flexBasis?: CSS.PropertiesFallback<string | number>['flexBasis'];
    fontSize?: CSS.PropertiesFallback<string | number>['fontSize'];
    gap?: CSS.PropertiesFallback<string | number>['gap'];
    gridAutoColumns?: CSS.PropertiesFallback<string | number>['gridAutoColumns'];
    gridAutoRows?: CSS.PropertiesFallback<string | number>['gridAutoRows'];
    gridColumnGap?: CSS.PropertiesFallback<string | number>['gridColumnGap'];
    gridGap?: CSS.PropertiesFallback<string | number>['gridGap'];
    gridRowGap?: CSS.PropertiesFallback<string | number>['gridRowGap'];
    gridTemplateColumns?: CSS.PropertiesFallback<string | number>['gridTemplateColumns'];
    gridTemplateRows?: CSS.PropertiesFallback<string | number>['gridTemplateRows'];
    height?: CSS.PropertiesFallback<string | number>['height'];
    inlineSize?: CSS.PropertiesFallback<string | number>['inlineSize'];
    inset?: CSS.PropertiesFallback<string | number>['inset'];
    insetBlock?: CSS.PropertiesFallback<string | number>['insetBlock'];
    insetBlockEnd?: CSS.PropertiesFallback<string | number>['insetBlockEnd'];
    insetBlockStart?: CSS.PropertiesFallback<string | number>['insetBlockStart'];
    insetInline?: CSS.PropertiesFallback<string | number>['insetInline'];
    insetInlineEnd?: CSS.PropertiesFallback<string | number>['insetInlineEnd'];
    insetInlineStart?: CSS.PropertiesFallback<string | number>['insetInlineStart'];
    left?: CSS.PropertiesFallback<string | number>['left'];
    letterSpacing?: CSS.PropertiesFallback<string | number>['letterSpacing'];
    lineHeightStep?: CSS.PropertiesFallback<string | number>['lineHeightStep'];
    margin?: CSS.PropertiesFallback<string | number>['margin'];
    marginBlock?: CSS.PropertiesFallback<string | number>['marginBlock'];
    marginBlockEnd?: CSS.PropertiesFallback<string | number>['marginBlockEnd'];
    marginBlockStart?: CSS.PropertiesFallback<string | number>['marginBlockStart'];
    marginBottom?: CSS.PropertiesFallback<string | number>['marginBottom'];
    marginInline?: CSS.PropertiesFallback<string | number>['marginInline'];
    marginInlineEnd?: CSS.PropertiesFallback<string | number>['marginInlineEnd'];
    marginInlineStart?: CSS.PropertiesFallback<string | number>['marginInlineStart'];
    marginLeft?: CSS.PropertiesFallback<string | number>['marginLeft'];
    marginRight?: CSS.PropertiesFallback<string | number>['marginRight'];
    marginTop?: CSS.PropertiesFallback<string | number>['marginTop'];
    mask?: CSS.PropertiesFallback<string | number>['mask'];
    maskPosition?: CSS.PropertiesFallback<string | number>['maskPosition'];
    maskSize?: CSS.PropertiesFallback<string | number>['maskSize'];
    maxBlockSize?: CSS.PropertiesFallback<string | number>['maxBlockSize'];
    maxHeight?: CSS.PropertiesFallback<string | number>['maxHeight'];
    maxInlineSize?: CSS.PropertiesFallback<string | number>['maxInlineSize'];
    maxWidth?: CSS.PropertiesFallback<string | number>['maxWidth'];
    minBlockSize?: CSS.PropertiesFallback<string | number>['minBlockSize'];
    minHeight?: CSS.PropertiesFallback<string | number>['minHeight'];
    minInlineSize?: CSS.PropertiesFallback<string | number>['minInlineSize'];
    minWidth?: CSS.PropertiesFallback<string | number>['minWidth'];
    motion?: CSS.PropertiesFallback<string | number>['motion'];
    motionDistance?: CSS.PropertiesFallback<string | number>['motionDistance'];
    objectPosition?: CSS.PropertiesFallback<string | number>['objectPosition'];
    offset?: CSS.PropertiesFallback<string | number>['offset'];
    offsetAnchor?: CSS.PropertiesFallback<string | number>['offsetAnchor'];
    offsetBlock?: CSS.PropertiesFallback<string | number>['offsetBlock'];
    offsetBlockEnd?: CSS.PropertiesFallback<string | number>['offsetBlockEnd'];
    offsetBlockStart?: CSS.PropertiesFallback<string | number>['offsetBlockStart'];
    offsetDistance?: CSS.PropertiesFallback<string | number>['offsetDistance'];
    offsetInline?: CSS.PropertiesFallback<string | number>['offsetInline'];
    offsetInlineEnd?: CSS.PropertiesFallback<string | number>['offsetInlineEnd'];
    offsetInlineStart?: CSS.PropertiesFallback<string | number>['offsetInlineStart'];
    outline?: CSS.PropertiesFallback<string | number>['outline'];
    outlineOffset?: CSS.PropertiesFallback<string | number>['outlineOffset'];
    outlineWidth?: CSS.PropertiesFallback<string | number>['outlineWidth'];
    padding?: CSS.PropertiesFallback<string | number>['padding'];
    paddingBlock?: CSS.PropertiesFallback<string | number>['paddingBlock'];
    paddingBlockEnd?: CSS.PropertiesFallback<string | number>['paddingBlockEnd'];
    paddingBlockStart?: CSS.PropertiesFallback<string | number>['paddingBlockStart'];
    paddingBottom?: CSS.PropertiesFallback<string | number>['paddingBottom'];
    paddingInline?: CSS.PropertiesFallback<string | number>['paddingInline'];
    paddingInlineEnd?: CSS.PropertiesFallback<string | number>['paddingInlineEnd'];
    paddingInlineStart?: CSS.PropertiesFallback<string | number>['paddingInlineStart'];
    paddingLeft?: CSS.PropertiesFallback<string | number>['paddingLeft'];
    paddingRight?: CSS.PropertiesFallback<string | number>['paddingRight'];
    paddingTop?: CSS.PropertiesFallback<string | number>['paddingTop'];
    perspective?: CSS.PropertiesFallback<string | number>['perspective'];
    perspectiveOrigin?: CSS.PropertiesFallback<string | number>['perspectiveOrigin'];
    right?: CSS.PropertiesFallback<string | number>['right'];
    rowGap?: CSS.PropertiesFallback<string | number>['rowGap'];
    scrollMargin?: CSS.PropertiesFallback<string | number>['scrollMargin'];
    scrollMarginBlock?: CSS.PropertiesFallback<string | number>['scrollMarginBlock'];
    scrollMarginBlockEnd?: CSS.PropertiesFallback<string | number>['scrollMarginBlockEnd'];
    scrollMarginBlockStart?: CSS.PropertiesFallback<string | number>['scrollMarginBlockStart'];
    scrollMarginBottom?: CSS.PropertiesFallback<string | number>['scrollMarginBottom'];
    scrollMarginInline?: CSS.PropertiesFallback<string | number>['scrollMarginInline'];
    scrollMarginInlineEnd?: CSS.PropertiesFallback<string | number>['scrollMarginInlineEnd'];
    scrollMarginInlineStart?: CSS.PropertiesFallback<string | number>['scrollMarginInlineStart'];
    scrollMarginLeft?: CSS.PropertiesFallback<string | number>['scrollMarginLeft'];
    scrollMarginRight?: CSS.PropertiesFallback<string | number>['scrollMarginRight'];
    scrollMarginTop?: CSS.PropertiesFallback<string | number>['scrollMarginTop'];
    scrollPadding?: CSS.PropertiesFallback<string | number>['scrollPadding'];
    scrollPaddingBlock?: CSS.PropertiesFallback<string | number>['scrollPaddingBlock'];
    scrollPaddingBlockEnd?: CSS.PropertiesFallback<string | number>['scrollPaddingBlockEnd'];
    scrollPaddingBlockStart?: CSS.PropertiesFallback<string | number>['scrollPaddingBlockStart'];
    scrollPaddingBottom?: CSS.PropertiesFallback<string | number>['scrollPaddingBottom'];
    scrollPaddingInline?: CSS.PropertiesFallback<string | number>['scrollPaddingInline'];
    scrollPaddingInlineEnd?: CSS.PropertiesFallback<string | number>['scrollPaddingInlineEnd'];
    scrollPaddingInlineStart?: CSS.PropertiesFallback<string | number>['scrollPaddingInlineStart'];
    scrollPaddingLeft?: CSS.PropertiesFallback<string | number>['scrollPaddingLeft'];
    scrollPaddingRight?: CSS.PropertiesFallback<string | number>['scrollPaddingRight'];
    scrollPaddingTop?: CSS.PropertiesFallback<string | number>['scrollPaddingTop'];
    scrollSnapCoordinate?: CSS.PropertiesFallback<string | number>['scrollSnapCoordinate'];
    scrollSnapDestination?: CSS.PropertiesFallback<string | number>['scrollSnapDestination'];
    scrollSnapMargin?: CSS.PropertiesFallback<string | number>['scrollSnapMargin'];
    scrollSnapMarginBottom?: CSS.PropertiesFallback<string | number>['scrollSnapMarginBottom'];
    scrollSnapMarginLeft?: CSS.PropertiesFallback<string | number>['scrollSnapMarginLeft'];
    scrollSnapMarginRight?: CSS.PropertiesFallback<string | number>['scrollSnapMarginRight'];
    scrollSnapMarginTop?: CSS.PropertiesFallback<string | number>['scrollSnapMarginTop'];
    shapeMargin?: CSS.PropertiesFallback<string | number>['shapeMargin'];
    textDecoration?: CSS.PropertiesFallback<string | number>['textDecoration'];
    textDecorationThickness?: CSS.PropertiesFallback<string | number>['textDecorationThickness'];
    textDecorationWidth?: CSS.PropertiesFallback<string | number>['textDecorationWidth'];
    textIndent?: CSS.PropertiesFallback<string | number>['textIndent'];
    textUnderlineOffset?: CSS.PropertiesFallback<string | number>['textUnderlineOffset'];
    top?: CSS.PropertiesFallback<string | number>['top'];
    transformOrigin?: CSS.PropertiesFallback<string | number>['transformOrigin'];
    translate?: CSS.PropertiesFallback<string | number>['translate'];
    verticalAlign?: CSS.PropertiesFallback<string | number>['verticalAlign'];
    width?: CSS.PropertiesFallback<string | number>['width'];
    wordSpacing?: CSS.PropertiesFallback<string | number>['wordSpacing'];
    // HTML Time
    animationDelay?: NumberWithFallback<CSS.Properties['animationDelay']>;
    animationDuration?: NumberWithFallback<CSS.Properties['animationDuration']>;
    transition?: NumberWithFallback<CSS.Properties<string | number>['transition']>;
    transitionDelay?: NumberWithFallback<CSS.Properties['transitionDelay']>;
    transitionDuration?: NumberWithFallback<CSS.Properties['transitionDuration']>;
    // SVG Length
    baselineShift?: CSS.PropertiesFallback<string | number>['baselineShift'];
    strokeDashoffset?: CSS.PropertiesFallback<string | number>['strokeDashoffset'];
    strokeWidth?: CSS.PropertiesFallback<string | number>['strokeWidth'];
  }
}
