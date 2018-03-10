import * as CSS from 'csstype';

export interface Style extends FeaturedProperties, PseudoMap {}

export interface Properties extends CSS.PropertiesFallback<string | 0> {}

export interface UntransformedProperties extends Omit<Properties, keyof TransformerProperties>, TransformerProperties {}

// Override properties using module augmentation
interface TransformerProperties {}

export interface FeaturedProperties
  extends Omit<UntransformedProperties, keyof ExtendedProperties>,
    ExtendedProperties {
  '@keyframes'?: UntransformedPropertiesList;
  '@font-face'?: FontFace;
}

export interface ExtendedProperties {
  // Keyframes
  animationName?: UntransformedPropertiesList | UntransformedProperties['animationName'];

  // Font face
  fontFamily?: FontFamilyProperty;

  // Shorthand objects
  animation?: AnimationProperty;
  background?: BackgroundProperty;
  border?: BorderProperty;
  borderBottom?: BorderBottomProperty;
  borderImage?: BorderImageProperty;
  borderLeft?: BorderLeftProperty;
  borderRight?: BorderRightProperty;
  borderTop?: BorderTopProperty;
  flex?: FlexProperty;
  font?: FontProperty;
  grid?: GridProperty;
  maskBorder?: MaskBorderProperty;
  mask?: MaskProperty;
  margin?: MarginProperty;
  offset?: OffsetProperty;
  outline?: OutlineProperty;
  padding?: PaddingProperty;
  transition?: TransitionProperty;
}

interface AnimationProperty {
  delay?: UntransformedProperties['animationDelay'];
  direction?: UntransformedProperties['animationDirection'];
  duration?: UntransformedProperties['animationDuration'];
  fillMode?: UntransformedProperties['animationFillMode'];
  iterationCount?: UntransformedProperties['animationIterationCount'];
  name?: UntransformedPropertiesList | UntransformedProperties['animationName'];
  playState?: UntransformedProperties['animationPlayState'];
  timingFunction?: UntransformedProperties['animationTimingFunction'];
}

interface BackgroundProperty {
  attachment?: UntransformedProperties['backgroundAttachment'];
  blendMode?: UntransformedProperties['backgroundBlendMode'];
  clip?: UntransformedProperties['backgroundClip'];
  color?: UntransformedProperties['backgroundColor'];
  image?: UntransformedProperties['backgroundImage'];
  origin?: UntransformedProperties['backgroundOrigin'];
  position?: UntransformedProperties['backgroundPosition'];
  positionX?: UntransformedProperties['backgroundPositionX'];
  positionY?: UntransformedProperties['backgroundPositionY'];
  repeat?: UntransformedProperties['backgroundRepeat'];
  size?: UntransformedProperties['backgroundSize'];
}

interface BorderProperty {
  collapse?: UntransformedProperties['borderCollapse'];
  color?: UntransformedProperties['borderColor'];
  blockEnd?: UntransformedProperties['borderBlockEnd'];
  blockStart?: UntransformedProperties['borderBlockStart'];
  inlineEnd?: UntransformedProperties['borderInlineEnd'];
  inlineStart?: UntransformedProperties['borderInlineStart'];
  radius?: UntransformedProperties['borderRadius'];
  spacing?: UntransformedProperties['borderSpacing'];
  style?: UntransformedProperties['borderStyle'];
  width?: UntransformedProperties['borderWidth'];
}

interface BorderBottomProperty {
  color?: UntransformedProperties['borderBottomColor'];
  style?: UntransformedProperties['borderBottomStyle'];
  width?: UntransformedProperties['borderBottomWidth'];
}

interface BorderImageProperty {
  outset?: UntransformedProperties['borderImageOutset'];
  repeat?: UntransformedProperties['borderImageRepeat'];
  slice?: UntransformedProperties['borderImageSlice'];
  source?: UntransformedProperties['borderImageSource'];
  width?: UntransformedProperties['borderImageWidth'];
}

interface BorderLeftProperty {
  color?: UntransformedProperties['borderLeftColor'];
  style?: UntransformedProperties['borderLeftStyle'];
  width?: UntransformedProperties['borderLeftWidth'];
}

interface BorderRightProperty {
  color?: UntransformedProperties['borderRightColor'];
  style?: UntransformedProperties['borderRightStyle'];
  width?: UntransformedProperties['borderRightWidth'];
}

interface BorderTopProperty {
  color?: UntransformedProperties['borderTopColor'];
  style?: UntransformedProperties['borderTopStyle'];
  width?: UntransformedProperties['borderTopWidth'];
}

interface FlexProperty {
  basis?: UntransformedProperties['flexBasis'];
  direction?: UntransformedProperties['flexDirection'];
  grow?: UntransformedProperties['flexGrow'];
  shrink?: UntransformedProperties['flexShrink'];
  wrap?: UntransformedProperties['flexWrap'];
}

interface FontProperty {
  family?: FontFamilyProperty;
  featureSettings?: UntransformedProperties['fontFeatureSettings'];
  kerning?: UntransformedProperties['fontKerning'];
  languageOverride?: UntransformedProperties['fontLanguageOverride'];
  variationSettings?: UntransformedProperties['fontVariationSettings'];
  size?: UntransformedProperties['fontSize'];
  sizeAdjust?: UntransformedProperties['fontSizeAdjust'];
  stretch?: UntransformedProperties['fontStretch'];
  style?: UntransformedProperties['fontStyle'];
  synthesis?: UntransformedProperties['fontSynthesis'];
  variant?: UntransformedProperties['fontVariant'];
  weight?: UntransformedProperties['fontWeight'];
}

interface GridProperty {
  autoColumns?: UntransformedProperties['gridAutoColumns'];
  autoFlow?: UntransformedProperties['gridAutoFlow'];
  autoRows?: UntransformedProperties['gridAutoRows'];
  column?: UntransformedProperties['gridColumn'];
  columnGap?: UntransformedProperties['gridColumnGap'];
  row?: UntransformedProperties['gridRow'];
  rowGap?: UntransformedProperties['gridRowGap'];
  template?: UntransformedProperties['gridTemplate'];
}

interface MaskBorderProperty {
  mode?: UntransformedProperties['maskBorderMode'];
  outset?: UntransformedProperties['maskBorderOutset'];
  repeat?: UntransformedProperties['maskBorderRepeat'];
  slice?: UntransformedProperties['maskBorderSlice'];
  source?: UntransformedProperties['maskBorderSource'];
  width?: UntransformedProperties['maskBorderWidth'];
}

interface MaskProperty {
  clip?: UntransformedProperties['maskClip'];
  composite?: UntransformedProperties['maskComposite'];
  image?: UntransformedProperties['maskImage'];
  mode?: UntransformedProperties['maskMode'];
  origin?: UntransformedProperties['maskOrigin'];
  position?: UntransformedProperties['maskPosition'];
  repeat?: UntransformedProperties['maskRepeat'];
  size?: UntransformedProperties['maskSize'];
  type?: UntransformedProperties['maskType'];
}

interface MarginProperty {
  x?: UntransformedProperties['marginLeft'];
  y?: UntransformedProperties['marginTop'];
  top?: UntransformedProperties['marginTop'];
  right?: UntransformedProperties['marginRight'];
  bottom?: UntransformedProperties['marginBottom'];
  left?: UntransformedProperties['marginLeft'];
}

interface OffsetProperty {
  anchor?: UntransformedProperties['offsetAnchor'];
  blockEnd?: UntransformedProperties['offsetBlockEnd'];
  blockStart?: UntransformedProperties['offsetBlockStart'];
  inlineEnd?: UntransformedProperties['offsetInlineEnd'];
  inlineStart?: UntransformedProperties['offsetInlineStart'];
  distance?: UntransformedProperties['offsetDistance'];
  path?: UntransformedProperties['offsetPath'];
  position?: UntransformedProperties['offsetPosition'];
  rotate?: UntransformedProperties['offsetRotate'];
}

interface OutlineProperty {
  color?: UntransformedProperties['outlineColor'];
  offset?: UntransformedProperties['outlineOffset'];
  style?: UntransformedProperties['outlineStyle'];
  width?: UntransformedProperties['outlineWidth'];
}

interface PaddingProperty {
  x?: UntransformedProperties['paddingLeft'];
  y?: UntransformedProperties['paddingTop'];
  top?: UntransformedProperties['paddingTop'];
  right?: UntransformedProperties['paddingRight'];
  bottom?: UntransformedProperties['paddingBottom'];
  left?: UntransformedProperties['paddingLeft'];
}

interface TransitionProperty {
  delay?: UntransformedProperties['transitionDelay'];
  duration?: UntransformedProperties['transitionDuration'];
  property?: UntransformedProperties['transitionProperty'];
  timingFunction?: UntransformedProperties['transitionTimingFunction'];
}

export type PseudoMap = { [P in CSS.SimplePseudos]?: FeaturedProperties & PseudoMap };

export interface PropertiesList {
  [identifier: string]: Properties;
}

export interface UntransformedPropertiesList {
  [identifier: string]: UntransformedProperties;
}

export type FontFamilyProperty =
  | FontFace
  | CSS.StandardLonghandProperties['fontFamily']
  | Array<FontFace | CSS.StandardLonghandProperties['fontFamily']>;

export type FontFace = Omit<CSS.FontFaceFallback, 'fontFamily'>;

type Diff<T extends string, U extends string> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;
