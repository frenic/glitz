import * as CSS from 'csstype';

export interface Style extends FeaturedProperties, PseudoMap {}

export interface Properties extends CSS.PropertiesFallback<string | 0> {}

// To provide proper type errors for `Style` we create an interface of `Style[]`
// and makes sure it's first in order
export interface StyleArray<TStyle = Style> extends Array<TStyle> {}
export type StyleOrStyleArray<TStyle = Style> = StyleArray<TStyle> | TStyle;

export interface Theme {}

export interface UntransformedProperties
  extends Pick<Properties, Exclude<keyof Properties, keyof TransformerProperties>>,
    TransformerProperties {}

// Override properties using module augmentation
interface TransformerProperties {}

type WithThemeFunction<TValue> = TValue | ((theme: Theme) => TValue);

type WithThemeFunctionMap<TProperties> = { [key in keyof TProperties]: WithThemeFunction<TProperties[key]> };

export interface FeaturedProperties
  extends Pick<
      WithThemeFunctionMap<UntransformedProperties>,
      Exclude<keyof UntransformedProperties, keyof ExtendedProperties>
    >,
    ExtendedProperties {
  '@keyframes'?: FeaturedPropertiesList;
  '@font-face'?: FeaturedFontFace;
}

export interface ExtendedProperties {
  // Keyframes
  animationName?: WithThemeFunction<FeaturedPropertiesList | UntransformedProperties['animationName']>;

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
  delay?: WithThemeFunction<UntransformedProperties['animationDelay']>;
  direction?: WithThemeFunction<UntransformedProperties['animationDirection']>;
  duration?: WithThemeFunction<UntransformedProperties['animationDuration']>;
  fillMode?: WithThemeFunction<UntransformedProperties['animationFillMode']>;
  iterationCount?: WithThemeFunction<UntransformedProperties['animationIterationCount']>;
  name?: FeaturedPropertiesList | WithThemeFunction<UntransformedProperties['animationName']>;
  playState?: WithThemeFunction<UntransformedProperties['animationPlayState']>;
  timingFunction?: WithThemeFunction<UntransformedProperties['animationTimingFunction']>;
}

interface BackgroundProperty {
  attachment?: WithThemeFunction<UntransformedProperties['backgroundAttachment']>;
  blendMode?: WithThemeFunction<UntransformedProperties['backgroundBlendMode']>;
  clip?: WithThemeFunction<UntransformedProperties['backgroundClip']>;
  color?: WithThemeFunction<UntransformedProperties['backgroundColor']>;
  image?: WithThemeFunction<UntransformedProperties['backgroundImage']>;
  origin?: WithThemeFunction<UntransformedProperties['backgroundOrigin']>;
  position?: WithThemeFunction<UntransformedProperties['backgroundPosition']>;
  positionX?: WithThemeFunction<UntransformedProperties['backgroundPositionX']>;
  positionY?: WithThemeFunction<UntransformedProperties['backgroundPositionY']>;
  repeat?: WithThemeFunction<UntransformedProperties['backgroundRepeat']>;
  size?: WithThemeFunction<UntransformedProperties['backgroundSize']>;
}

interface BorderProperty {
  collapse?: WithThemeFunction<UntransformedProperties['borderCollapse']>;
  color?: WithThemeFunction<UntransformedProperties['borderColor']>;
  blockEnd?: WithThemeFunction<UntransformedProperties['borderBlockEnd']>;
  blockStart?: WithThemeFunction<UntransformedProperties['borderBlockStart']>;
  inlineEnd?: WithThemeFunction<UntransformedProperties['borderInlineEnd']>;
  inlineStart?: WithThemeFunction<UntransformedProperties['borderInlineStart']>;
  radius?: WithThemeFunction<UntransformedProperties['borderRadius']>;
  spacing?: WithThemeFunction<UntransformedProperties['borderSpacing']>;
  style?: WithThemeFunction<UntransformedProperties['borderStyle']>;
  width?: WithThemeFunction<UntransformedProperties['borderWidth']>;
}

interface BorderBottomProperty {
  color?: WithThemeFunction<UntransformedProperties['borderBottomColor']>;
  style?: WithThemeFunction<UntransformedProperties['borderBottomStyle']>;
  width?: WithThemeFunction<UntransformedProperties['borderBottomWidth']>;
}

interface BorderImageProperty {
  outset?: WithThemeFunction<UntransformedProperties['borderImageOutset']>;
  repeat?: WithThemeFunction<UntransformedProperties['borderImageRepeat']>;
  slice?: WithThemeFunction<UntransformedProperties['borderImageSlice']>;
  source?: WithThemeFunction<UntransformedProperties['borderImageSource']>;
  width?: WithThemeFunction<UntransformedProperties['borderImageWidth']>;
}

interface BorderLeftProperty {
  color?: WithThemeFunction<UntransformedProperties['borderLeftColor']>;
  style?: WithThemeFunction<UntransformedProperties['borderLeftStyle']>;
  width?: WithThemeFunction<UntransformedProperties['borderLeftWidth']>;
}

interface BorderRightProperty {
  color?: WithThemeFunction<UntransformedProperties['borderRightColor']>;
  style?: WithThemeFunction<UntransformedProperties['borderRightStyle']>;
  width?: WithThemeFunction<UntransformedProperties['borderRightWidth']>;
}

interface BorderTopProperty {
  color?: WithThemeFunction<UntransformedProperties['borderTopColor']>;
  style?: WithThemeFunction<UntransformedProperties['borderTopStyle']>;
  width?: WithThemeFunction<UntransformedProperties['borderTopWidth']>;
}

interface FlexProperty {
  basis?: WithThemeFunction<UntransformedProperties['flexBasis']>;
  direction?: WithThemeFunction<UntransformedProperties['flexDirection']>;
  grow?: WithThemeFunction<UntransformedProperties['flexGrow']>;
  shrink?: WithThemeFunction<UntransformedProperties['flexShrink']>;
  wrap?: WithThemeFunction<UntransformedProperties['flexWrap']>;
}

interface FontProperty {
  family?: FontFamilyProperty;
  featureSettings?: WithThemeFunction<UntransformedProperties['fontFeatureSettings']>;
  kerning?: WithThemeFunction<UntransformedProperties['fontKerning']>;
  languageOverride?: WithThemeFunction<UntransformedProperties['fontLanguageOverride']>;
  variationSettings?: WithThemeFunction<UntransformedProperties['fontVariationSettings']>;
  size?: WithThemeFunction<UntransformedProperties['fontSize']>;
  sizeAdjust?: WithThemeFunction<UntransformedProperties['fontSizeAdjust']>;
  stretch?: WithThemeFunction<UntransformedProperties['fontStretch']>;
  style?: WithThemeFunction<UntransformedProperties['fontStyle']>;
  synthesis?: WithThemeFunction<UntransformedProperties['fontSynthesis']>;
  variant?: WithThemeFunction<UntransformedProperties['fontVariant']>;
  weight?: WithThemeFunction<UntransformedProperties['fontWeight']>;
}

interface GridProperty {
  auto?: {
    columns?: WithThemeFunction<UntransformedProperties['gridAutoColumns']>;
    flow?: WithThemeFunction<UntransformedProperties['gridAutoFlow']>;
    rows?: WithThemeFunction<UntransformedProperties['gridAutoRows']>;
  };
  column?: {
    end?: WithThemeFunction<UntransformedProperties['gridColumnEnd']>;
    gap?: WithThemeFunction<UntransformedProperties['gridColumnGap']>;
    start?: WithThemeFunction<UntransformedProperties['gridColumnStart']>;
  };
  row?: {
    end?: WithThemeFunction<UntransformedProperties['gridRowEnd']>;
    gap?: WithThemeFunction<UntransformedProperties['gridRowGap']>;
    start?: WithThemeFunction<UntransformedProperties['gridRowStart']>;
  };
  template?: {
    areas?: WithThemeFunction<UntransformedProperties['gridTemplateAreas']>;
    columns?: WithThemeFunction<UntransformedProperties['gridTemplateColumns']>;
    rows?: WithThemeFunction<UntransformedProperties['gridTemplateRows']>;
  };
}

interface MaskBorderProperty {
  mode?: WithThemeFunction<UntransformedProperties['maskBorderMode']>;
  outset?: WithThemeFunction<UntransformedProperties['maskBorderOutset']>;
  repeat?: WithThemeFunction<UntransformedProperties['maskBorderRepeat']>;
  slice?: WithThemeFunction<UntransformedProperties['maskBorderSlice']>;
  source?: WithThemeFunction<UntransformedProperties['maskBorderSource']>;
  width?: WithThemeFunction<UntransformedProperties['maskBorderWidth']>;
}

interface MaskProperty {
  clip?: WithThemeFunction<UntransformedProperties['maskClip']>;
  composite?: WithThemeFunction<UntransformedProperties['maskComposite']>;
  image?: WithThemeFunction<UntransformedProperties['maskImage']>;
  mode?: WithThemeFunction<UntransformedProperties['maskMode']>;
  origin?: WithThemeFunction<UntransformedProperties['maskOrigin']>;
  position?: WithThemeFunction<UntransformedProperties['maskPosition']>;
  repeat?: WithThemeFunction<UntransformedProperties['maskRepeat']>;
  size?: WithThemeFunction<UntransformedProperties['maskSize']>;
  type?: WithThemeFunction<UntransformedProperties['maskType']>;
}

interface MarginProperty {
  xy?: WithThemeFunction<UntransformedProperties['marginLeft']>;
  x?: WithThemeFunction<UntransformedProperties['marginLeft']>;
  y?: WithThemeFunction<UntransformedProperties['marginTop']>;
  top?: WithThemeFunction<UntransformedProperties['marginTop']>;
  right?: WithThemeFunction<UntransformedProperties['marginRight']>;
  bottom?: WithThemeFunction<UntransformedProperties['marginBottom']>;
  left?: WithThemeFunction<UntransformedProperties['marginLeft']>;
}

interface OffsetProperty {
  anchor?: WithThemeFunction<UntransformedProperties['offsetAnchor']>;
  blockEnd?: WithThemeFunction<UntransformedProperties['offsetBlockEnd']>;
  blockStart?: WithThemeFunction<UntransformedProperties['offsetBlockStart']>;
  inlineEnd?: WithThemeFunction<UntransformedProperties['offsetInlineEnd']>;
  inlineStart?: WithThemeFunction<UntransformedProperties['offsetInlineStart']>;
  distance?: WithThemeFunction<UntransformedProperties['offsetDistance']>;
  path?: WithThemeFunction<UntransformedProperties['offsetPath']>;
  position?: WithThemeFunction<UntransformedProperties['offsetPosition']>;
  rotate?: WithThemeFunction<UntransformedProperties['offsetRotate']>;
}

interface OutlineProperty {
  color?: WithThemeFunction<UntransformedProperties['outlineColor']>;
  offset?: WithThemeFunction<UntransformedProperties['outlineOffset']>;
  style?: WithThemeFunction<UntransformedProperties['outlineStyle']>;
  width?: WithThemeFunction<UntransformedProperties['outlineWidth']>;
}

interface PaddingProperty {
  xy?: WithThemeFunction<UntransformedProperties['paddingLeft']>;
  x?: WithThemeFunction<UntransformedProperties['paddingLeft']>;
  y?: WithThemeFunction<UntransformedProperties['paddingTop']>;
  top?: WithThemeFunction<UntransformedProperties['paddingTop']>;
  right?: WithThemeFunction<UntransformedProperties['paddingRight']>;
  bottom?: WithThemeFunction<UntransformedProperties['paddingBottom']>;
  left?: WithThemeFunction<UntransformedProperties['paddingLeft']>;
}

interface TransitionProperty {
  delay?: WithThemeFunction<UntransformedProperties['transitionDelay']>;
  duration?: WithThemeFunction<UntransformedProperties['transitionDuration']>;
  property?: WithThemeFunction<UntransformedProperties['transitionProperty']>;
  timingFunction?: WithThemeFunction<UntransformedProperties['transitionTimingFunction']>;
}

export type PseudoMap = { [P in CSS.SimplePseudos]?: FeaturedProperties & PseudoMap };

export interface PropertiesList {
  [identifier: string]: Properties;
}

export interface FeaturedPropertiesList {
  [identifier: string]: Style;
}

export interface FontFace extends Pick<CSS.FontFaceFallback, Exclude<keyof CSS.FontFaceFallback, 'fontFamily'>> {}

export interface FeaturedFontFace extends FontFace {
  font?: {
    display?: WithThemeFunction<FontFace['fontDisplay']>;
    featureSettings?: WithThemeFunction<FontFace['fontFeatureSettings']>;
    stretch?: WithThemeFunction<FontFace['fontStretch']>;
    style?: WithThemeFunction<FontFace['fontStyle']>;
    variant?: WithThemeFunction<FontFace['fontVariant']>;
    variationSettings?: WithThemeFunction<FontFace['fontVariationSettings']>;
    weight?: WithThemeFunction<FontFace['fontWeight']>;
  };
}

export type FontFamilyProperty =
  | FeaturedFontFace
  | WithThemeFunction<CSS.StandardLonghandProperties['fontFamily']>
  | WithThemeFunction<Array<FeaturedFontFace | CSS.StandardLonghandProperties['fontFamily']>>;

export type Declarations = { [index: string]: string | number | Array<string | number> };
