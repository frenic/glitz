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
  type NumberWithFallback<T> = T | (number & {}) | Array<T | (number & {})>;
  type Length = (string & {}) | (number & {});

  interface TransformerProperties {
    // Length
    background?: CSS.PropertiesFallback<Length>['background'];
    backgroundPosition?: CSS.PropertiesFallback<Length>['backgroundPosition'];
    backgroundPositionX?: CSS.PropertiesFallback<Length>['backgroundPositionX'];
    backgroundPositionY?: CSS.PropertiesFallback<Length>['backgroundPositionY'];
    backgroundSize?: CSS.PropertiesFallback<Length>['backgroundSize'];
    blockSize?: CSS.PropertiesFallback<Length>['blockSize'];
    border?: CSS.PropertiesFallback<Length>['border'];
    borderBlockEnd?: CSS.PropertiesFallback<Length>['borderBlockEnd'];
    borderBlockEndWidth?: CSS.PropertiesFallback<Length>['borderBlockEndWidth'];
    borderBlockStart?: CSS.PropertiesFallback<Length>['borderBlockStart'];
    borderBlockStartWidth?: CSS.PropertiesFallback<Length>['borderBlockStartWidth'];
    borderBottom?: CSS.PropertiesFallback<Length>['borderBottom'];
    borderBottomLeftRadius?: CSS.PropertiesFallback<Length>['borderBottomLeftRadius'];
    borderBottomRightRadius?: CSS.PropertiesFallback<Length>['borderBottomRightRadius'];
    borderBottomWidth?: CSS.PropertiesFallback<Length>['borderBottomWidth'];
    borderInlineEnd?: CSS.PropertiesFallback<Length>['borderInlineEnd'];
    borderInlineEndWidth?: CSS.PropertiesFallback<Length>['borderInlineEndWidth'];
    borderInlineStart?: CSS.PropertiesFallback<Length>['borderInlineStart'];
    borderInlineStartWidth?: CSS.PropertiesFallback<Length>['borderInlineStartWidth'];
    borderLeft?: CSS.PropertiesFallback<Length>['borderLeft'];
    borderLeftWidth?: CSS.PropertiesFallback<Length>['borderLeftWidth'];
    borderRadius?: CSS.PropertiesFallback<Length>['borderRadius'];
    borderRight?: CSS.PropertiesFallback<Length>['borderRight'];
    borderRightWidth?: CSS.PropertiesFallback<Length>['borderRightWidth'];
    borderSpacing?: CSS.PropertiesFallback<Length>['borderSpacing'];
    borderTop?: CSS.PropertiesFallback<Length>['borderTop'];
    borderTopLeftRadius?: CSS.PropertiesFallback<Length>['borderTopLeftRadius'];
    borderTopRightRadius?: CSS.PropertiesFallback<Length>['borderTopRightRadius'];
    borderTopWidth?: CSS.PropertiesFallback<Length>['borderTopWidth'];
    borderWidth?: CSS.PropertiesFallback<Length>['borderWidth'];
    bottom?: CSS.PropertiesFallback<Length>['bottom'];
    boxShadow?: CSS.PropertiesFallback<Length>['boxShadow'];
    columnGap?: CSS.PropertiesFallback<Length>['columnGap'];
    columnRule?: CSS.PropertiesFallback<Length>['columnRule'];
    columnRuleWidth?: CSS.PropertiesFallback<Length>['columnRuleWidth'];
    columnWidth?: CSS.PropertiesFallback<Length>['columnWidth'];
    flexBasis?: CSS.PropertiesFallback<Length>['flexBasis'];
    fontSize?: CSS.PropertiesFallback<Length>['fontSize'];
    gridAutoColumns?: CSS.PropertiesFallback<Length>['gridAutoColumns'];
    gridAutoRows?: CSS.PropertiesFallback<Length>['gridAutoRows'];
    gridColumnGap?: CSS.PropertiesFallback<Length>['gridColumnGap'];
    gridGap?: CSS.PropertiesFallback<Length>['gridGap'];
    gridRowGap?: CSS.PropertiesFallback<Length>['gridRowGap'];
    gridTemplateColumns?: CSS.PropertiesFallback<Length>['gridTemplateColumns'];
    gridTemplateRows?: CSS.PropertiesFallback<Length>['gridTemplateRows'];
    height?: CSS.PropertiesFallback<Length>['height'];
    inlineSize?: CSS.PropertiesFallback<Length>['inlineSize'];
    left?: CSS.PropertiesFallback<Length>['left'];
    letterSpacing?: CSS.PropertiesFallback<Length>['letterSpacing'];
    lineHeightStep?: CSS.PropertiesFallback<Length>['lineHeightStep'];
    margin?: CSS.PropertiesFallback<Length>['margin'];
    marginBlockEnd?: CSS.PropertiesFallback<Length>['marginBlockEnd'];
    marginBlockStart?: CSS.PropertiesFallback<Length>['marginBlockStart'];
    marginBottom?: CSS.PropertiesFallback<Length>['marginBottom'];
    marginInlineEnd?: CSS.PropertiesFallback<Length>['marginInlineEnd'];
    marginInlineStart?: CSS.PropertiesFallback<Length>['marginInlineStart'];
    marginLeft?: CSS.PropertiesFallback<Length>['marginLeft'];
    marginRight?: CSS.PropertiesFallback<Length>['marginRight'];
    marginTop?: CSS.PropertiesFallback<Length>['marginTop'];
    mask?: CSS.PropertiesFallback<Length>['mask'];
    maskPosition?: CSS.PropertiesFallback<Length>['maskPosition'];
    maskSize?: CSS.PropertiesFallback<Length>['maskSize'];
    maxBlockSize?: CSS.PropertiesFallback<Length>['maxBlockSize'];
    maxHeight?: CSS.PropertiesFallback<Length>['maxHeight'];
    maxInlineSize?: CSS.PropertiesFallback<Length>['maxInlineSize'];
    maxWidth?: CSS.PropertiesFallback<Length>['maxWidth'];
    minBlockSize?: CSS.PropertiesFallback<Length>['minBlockSize'];
    minHeight?: CSS.PropertiesFallback<Length>['minHeight'];
    minInlineSize?: CSS.PropertiesFallback<Length>['minInlineSize'];
    minWidth?: CSS.PropertiesFallback<Length>['minWidth'];
    offset?: CSS.PropertiesFallback<Length>['offset'];
    offsetBlockEnd?: CSS.PropertiesFallback<Length>['offsetBlockEnd'];
    offsetBlockStart?: CSS.PropertiesFallback<Length>['offsetBlockStart'];
    offsetDistance?: CSS.PropertiesFallback<Length>['offsetDistance'];
    offsetInlineEnd?: CSS.PropertiesFallback<Length>['offsetInlineEnd'];
    offsetInlineStart?: CSS.PropertiesFallback<Length>['offsetInlineStart'];
    offsetPosition?: CSS.PropertiesFallback<Length>['offsetPosition'];
    outline?: CSS.PropertiesFallback<Length>['outline'];
    outlineOffset?: CSS.PropertiesFallback<Length>['outlineOffset'];
    outlineWidth?: CSS.PropertiesFallback<Length>['outlineWidth'];
    padding?: CSS.PropertiesFallback<Length>['padding'];
    paddingBlockEnd?: CSS.PropertiesFallback<Length>['paddingBlockEnd'];
    paddingBlockStart?: CSS.PropertiesFallback<Length>['paddingBlockStart'];
    paddingBottom?: CSS.PropertiesFallback<Length>['paddingBottom'];
    paddingInlineEnd?: CSS.PropertiesFallback<Length>['paddingInlineEnd'];
    paddingInlineStart?: CSS.PropertiesFallback<Length>['paddingInlineStart'];
    paddingLeft?: CSS.PropertiesFallback<Length>['paddingLeft'];
    paddingRight?: CSS.PropertiesFallback<Length>['paddingRight'];
    paddingTop?: CSS.PropertiesFallback<Length>['paddingTop'];
    perspective?: CSS.PropertiesFallback<Length>['perspective'];
    perspectiveOrigin?: CSS.PropertiesFallback<Length>['perspectiveOrigin'];
    right?: CSS.PropertiesFallback<Length>['right'];
    scrollSnapCoordinate?: CSS.PropertiesFallback<Length>['scrollSnapCoordinate'];
    scrollSnapDestination?: CSS.PropertiesFallback<Length>['scrollSnapDestination'];
    shapeMargin?: CSS.PropertiesFallback<Length>['shapeMargin'];
    textIndent?: CSS.PropertiesFallback<Length>['textIndent'];
    textShadow?: CSS.PropertiesFallback<Length>['textShadow'];
    top?: CSS.PropertiesFallback<Length>['top'];
    transformOrigin?: CSS.PropertiesFallback<Length>['transformOrigin'];
    verticalAlign?: CSS.PropertiesFallback<Length>['verticalAlign'];
    width?: CSS.PropertiesFallback<Length>['width'];
    wordSpacing?: CSS.PropertiesFallback<Length>['wordSpacing'];
    // Time
    animationDelay?: NumberWithFallback<CSS.Properties['animationDelay']>;
    animationDuration?: NumberWithFallback<CSS.Properties['animationDuration']>;
    transitionDelay?: NumberWithFallback<CSS.Properties['transitionDelay']>;
    transitionDuration?: NumberWithFallback<CSS.Properties['transitionDuration']>;
  }
}
