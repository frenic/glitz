import * as CSS from 'csstype';

export interface Style extends FeaturedProperties, PseudoMap {}

export interface Properties extends CSS.StandardLonghandPropertiesFallback, CSS.VendorPropertiesFallback {}

export interface FeaturedProperties
  extends Omit<Properties, keyof ExtendedProperties>,
    ExtendedProperties,
    Omit<CSS.StandardShorthandPropertiesFallback, keyof ShorthandProperties>,
    ShorthandProperties {
  '@keyframes'?: PropertiesList;
  '@font-face'?: FontFace;
}

export interface ExtendedProperties {
  animationName?: PropertiesList | Properties['animationName'];
  fontFamily?: FontFamily;
}

export interface ShorthandProperties {
  animation?: Animation;
  background?: Background;
  border?: Border;
  borderBottom?: BorderBottom;
  borderImage?: BorderImage;
  borderLeft?: BorderLeft;
  borderRight?: BorderRight;
  borderTop?: BorderTop;
  flex?: Flex;
  font?: Font;
  grid?: Grid;
  maskBorder?: MaskBorder;
  mask?: Mask;
  margin?: Margin;
  offset?: Offset;
  outline?: Outline;
  padding?: Padding;
  transition?: Transition;
}

interface Animation {
  delay?: CSS.StandardLonghandPropertiesFallback['animationDelay'];
  direction?: CSS.StandardLonghandPropertiesFallback['animationDirection'];
  duration?: CSS.StandardLonghandPropertiesFallback['animationDuration'];
  fillMode?: CSS.StandardLonghandPropertiesFallback['animationFillMode'];
  iterationCount?: CSS.StandardLonghandPropertiesFallback['animationIterationCount'];
  name?: PropertiesList | CSS.StandardLonghandPropertiesFallback['animationName'];
  playState?: CSS.StandardLonghandPropertiesFallback['animationPlayState'];
  timingFunction?: CSS.StandardLonghandPropertiesFallback['animationTimingFunction'];
}

interface Background {
  attachment?: CSS.StandardLonghandPropertiesFallback['backgroundAttachment'];
  blendMode?: CSS.StandardLonghandPropertiesFallback['backgroundBlendMode'];
  clip?: CSS.StandardLonghandPropertiesFallback['backgroundClip'];
  color?: CSS.StandardLonghandPropertiesFallback['backgroundColor'];
  image?: CSS.StandardLonghandPropertiesFallback['backgroundImage'];
  origin?: CSS.StandardLonghandPropertiesFallback['backgroundOrigin'];
  position?: CSS.StandardLonghandPropertiesFallback['backgroundPosition'];
  repeat?: CSS.StandardLonghandPropertiesFallback['backgroundRepeat'];
  size?: CSS.StandardLonghandPropertiesFallback['backgroundSize'];
}

interface Border {
  collapse?: CSS.StandardLonghandPropertiesFallback['borderCollapse'];
  color?: CSS.StandardShorthandPropertiesFallback['borderColor'];
  blockEnd?: CSS.StandardShorthandPropertiesFallback['borderBlockEnd'];
  blockStart?: CSS.StandardShorthandPropertiesFallback['borderBlockStart'];
  inlineEnd?: CSS.StandardShorthandPropertiesFallback['borderInlineEnd'];
  inlineStart?: CSS.StandardShorthandPropertiesFallback['borderInlineStart'];
  radius?: CSS.StandardShorthandPropertiesFallback['borderRadius'];
  spacing?: CSS.StandardLonghandPropertiesFallback['borderSpacing'];
  style?: CSS.StandardShorthandPropertiesFallback['borderStyle'];
  width?: CSS.StandardShorthandPropertiesFallback['borderWidth'];
}

interface BorderBottom {
  color?: CSS.StandardLonghandPropertiesFallback['borderBottomColor'];
  style?: CSS.StandardLonghandPropertiesFallback['borderBottomStyle'];
  width?: CSS.StandardLonghandPropertiesFallback['borderBottomWidth'];
}

interface BorderImage {
  outset?: CSS.StandardLonghandPropertiesFallback['borderImageOutset'];
  repeat?: CSS.StandardLonghandPropertiesFallback['borderImageRepeat'];
  slice?: CSS.StandardLonghandPropertiesFallback['borderImageSlice'];
  source?: CSS.StandardLonghandPropertiesFallback['borderImageSource'];
  width?: CSS.StandardLonghandPropertiesFallback['borderImageWidth'];
}

interface BorderLeft {
  color?: CSS.StandardLonghandPropertiesFallback['borderLeftColor'];
  style?: CSS.StandardLonghandPropertiesFallback['borderLeftStyle'];
  width?: CSS.StandardLonghandPropertiesFallback['borderLeftWidth'];
}

interface BorderRight {
  color?: CSS.StandardLonghandPropertiesFallback['borderRightColor'];
  style?: CSS.StandardLonghandPropertiesFallback['borderRightStyle'];
  width?: CSS.StandardLonghandPropertiesFallback['borderRightWidth'];
}

interface BorderTop {
  color?: CSS.StandardLonghandPropertiesFallback['borderTopColor'];
  style?: CSS.StandardLonghandPropertiesFallback['borderTopStyle'];
  width?: CSS.StandardLonghandPropertiesFallback['borderTopWidth'];
}

interface Flex {
  basis?: CSS.StandardLonghandPropertiesFallback['flexBasis'];
  direction?: CSS.StandardLonghandPropertiesFallback['flexDirection'];
  grow?: CSS.StandardLonghandPropertiesFallback['flexGrow'];
  shrink?: CSS.StandardLonghandPropertiesFallback['flexShrink'];
  wrap?: CSS.StandardLonghandPropertiesFallback['flexWrap'];
}

interface Font {
  family?: FontFamily;
  featureSettings?: CSS.StandardLonghandPropertiesFallback['fontFeatureSettings'];
  kerning?: CSS.StandardLonghandPropertiesFallback['fontKerning'];
  languageOverride?: CSS.StandardLonghandPropertiesFallback['fontLanguageOverride'];
  variationSettings?: CSS.StandardLonghandPropertiesFallback['fontVariationSettings'];
  size?: CSS.StandardLonghandPropertiesFallback['fontSize'];
  sizeAdjust?: CSS.StandardLonghandPropertiesFallback['fontSizeAdjust'];
  stretch?: CSS.StandardLonghandPropertiesFallback['fontStretch'];
  style?: CSS.StandardLonghandPropertiesFallback['fontStyle'];
  synthesis?: CSS.StandardLonghandPropertiesFallback['fontSynthesis'];
  variant?: CSS.StandardLonghandPropertiesFallback['fontVariant'];
  weight?: CSS.StandardLonghandPropertiesFallback['fontWeight'];
}

interface Grid {
  autoColumns?: CSS.StandardLonghandPropertiesFallback['gridAutoColumns'];
  autoFlow?: CSS.StandardLonghandPropertiesFallback['gridAutoFlow'];
  autoRows?: CSS.StandardLonghandPropertiesFallback['gridAutoRows'];
  column?: CSS.StandardShorthandPropertiesFallback['gridColumn'];
  columnGap?: CSS.StandardLonghandPropertiesFallback['gridColumnGap'];
  row?: CSS.StandardShorthandPropertiesFallback['gridRow'];
  rowGap?: CSS.StandardLonghandPropertiesFallback['gridRowGap'];
  template?: CSS.StandardShorthandPropertiesFallback['gridTemplate'];
}

interface MaskBorder {
  mode?: CSS.StandardLonghandPropertiesFallback['maskBorderMode'];
  outset?: CSS.StandardLonghandPropertiesFallback['maskBorderOutset'];
  repeat?: CSS.StandardLonghandPropertiesFallback['maskBorderRepeat'];
  slice?: CSS.StandardLonghandPropertiesFallback['maskBorderSlice'];
  source?: CSS.StandardLonghandPropertiesFallback['maskBorderSource'];
  width?: CSS.StandardLonghandPropertiesFallback['maskBorderWidth'];
}

interface Mask {
  clip?: CSS.StandardLonghandPropertiesFallback['maskClip'];
  composite?: CSS.StandardLonghandPropertiesFallback['maskComposite'];
  image?: CSS.StandardLonghandPropertiesFallback['maskImage'];
  mode?: CSS.StandardLonghandPropertiesFallback['maskMode'];
  origin?: CSS.StandardLonghandPropertiesFallback['maskOrigin'];
  position?: CSS.StandardLonghandPropertiesFallback['maskPosition'];
  repeat?: CSS.StandardLonghandPropertiesFallback['maskRepeat'];
  size?: CSS.StandardLonghandPropertiesFallback['maskSize'];
  type?: CSS.StandardLonghandPropertiesFallback['maskType'];
}

interface Margin {
  x?: CSS.StandardLonghandPropertiesFallback['marginLeft'];
  y?: CSS.StandardLonghandPropertiesFallback['marginTop'];
  top?: CSS.StandardLonghandPropertiesFallback['marginTop'];
  right?: CSS.StandardLonghandPropertiesFallback['marginRight'];
  bottom?: CSS.StandardLonghandPropertiesFallback['marginBottom'];
  left?: CSS.StandardLonghandPropertiesFallback['marginLeft'];
}

interface Offset {
  anchor?: CSS.StandardLonghandPropertiesFallback['offsetAnchor'];
  blockEnd?: CSS.StandardLonghandPropertiesFallback['offsetBlockEnd'];
  blockStart?: CSS.StandardLonghandPropertiesFallback['offsetBlockStart'];
  inlineEnd?: CSS.StandardLonghandPropertiesFallback['offsetInlineEnd'];
  inlineStart?: CSS.StandardLonghandPropertiesFallback['offsetInlineStart'];
  distance?: CSS.StandardLonghandPropertiesFallback['offsetDistance'];
  path?: CSS.StandardLonghandPropertiesFallback['offsetPath'];
  position?: CSS.StandardLonghandPropertiesFallback['offsetPosition'];
  rotate?: CSS.StandardLonghandPropertiesFallback['offsetRotate'];
}

interface Outline {
  color?: CSS.StandardLonghandPropertiesFallback['outlineColor'];
  offset?: CSS.StandardLonghandPropertiesFallback['outlineOffset'];
  style?: CSS.StandardLonghandPropertiesFallback['outlineStyle'];
  width?: CSS.StandardLonghandPropertiesFallback['outlineWidth'];
}

interface Padding {
  x?: CSS.StandardLonghandPropertiesFallback['paddingLeft'];
  y?: CSS.StandardLonghandPropertiesFallback['paddingTop'];
  top?: CSS.StandardLonghandPropertiesFallback['paddingTop'];
  right?: CSS.StandardLonghandPropertiesFallback['paddingRight'];
  bottom?: CSS.StandardLonghandPropertiesFallback['paddingBottom'];
  left?: CSS.StandardLonghandPropertiesFallback['paddingLeft'];
}

interface Transition {
  delay?: CSS.StandardLonghandPropertiesFallback['transitionDelay'];
  duration?: CSS.StandardLonghandPropertiesFallback['transitionDuration'];
  property?: CSS.StandardLonghandPropertiesFallback['transitionProperty'];
  timingFunction?: CSS.StandardLonghandPropertiesFallback['transitionTimingFunction'];
}

export type PseudoMap = { [P in CSS.SimplePseudos]?: FeaturedProperties & PseudoMap };

export interface PropertiesList {
  [identifier: string]: Properties;
}

export type FontFamily =
  | FontFace
  | CSS.StandardLonghandProperties['fontFamily']
  | Array<FontFace | CSS.StandardLonghandProperties['fontFamily']>;

export type FontFace = Omit<CSS.FontFaceFallback, 'fontFamily'>;

type Diff<T extends string, U extends string> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;
