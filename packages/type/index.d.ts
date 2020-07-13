import * as CSS from 'csstype';
export { PropertyValue } from 'csstype';

export type Style = Selectors &
  Omit<Merge<FeaturedProperties, ExtendedProperties>, ExcludedShorthands> & {
    '@keyframes'?: KeyframesProperty;
    '@font-face'?: FontFaceProperty;
  };

export interface Theme {}

export interface TransformerProperties {}

export type ResolvedProperties = Merge<CSS.PropertiesFallback, TransformerProperties>;

export type FeaturedProperties = {
  [property in keyof ResolvedProperties]:
    | ResolvedProperties[property]
    | ((theme: Theme) => ResolvedProperties[property]);
};

export type ResolvedValue = string | number | Array<string | number>;

export interface ResolvedDeclarations {
  [key: string]: ResolvedValue;
}

export interface ResolvedDeclarationList {
  [identifier: string]: ResolvedDeclarations;
}

export type CommonValue = string | number | undefined | Array<string | number | undefined>;

export type CommonStyle = {
  [key: string]: CommonStyle | CommonValue | ((theme: Theme) => CommonValue);
};

export interface CommonDeclarations {
  [key: string]: CommonValue;
}

export interface Keyframes {
  [identifier: string]: Style;
}

export type KeyframesProperty = FeaturedProperties['animationName'] | Keyframes;

export type FontFace = Omit<CSS.AtRule.FontFaceFallback, 'fontFamily'> & {
  fontFamily: CSS.AtRule.FontFace['fontFamily'];
};

export type FontFaceProperty =
  | FontFace
  | FeaturedProperties['fontFamily']
  | Array<FontFace | FeaturedProperties['fontFamily']>;

export interface ExtendedProperties {
  // Keyframes
  animationName?: KeyframesProperty;

  // Font face
  fontFamily?: FontFaceProperty;

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
  gridAuto?: GridAutoProperty;
  gridColumn?: GridColumnProperty;
  gridRow?: GridRowProperty;
  gridTemplate?: GridTemplateProperty;
  maskBorder?: MaskBorderProperty;
  mask?: MaskProperty;
  margin?: MarginProperty;
  offset?: OffsetProperty;
  outline?: OutlineProperty;
  padding?: PaddingProperty;
  transition?: TransitionProperty;
}

type Merge<TSource, TTarget> = Omit<TSource, keyof TTarget> & TTarget;

interface AnimationProperty {
  delay?: FeaturedProperties['animationDelay'];
  direction?: FeaturedProperties['animationDirection'];
  duration?: FeaturedProperties['animationDuration'];
  fillMode?: FeaturedProperties['animationFillMode'];
  iterationCount?: FeaturedProperties['animationIterationCount'];
  name?: KeyframesProperty;
  playState?: FeaturedProperties['animationPlayState'];
  timingFunction?: FeaturedProperties['animationTimingFunction'];
}

interface BackgroundProperty {
  attachment?: FeaturedProperties['backgroundAttachment'];
  blendMode?: FeaturedProperties['backgroundBlendMode'];
  clip?: FeaturedProperties['backgroundClip'];
  color?: FeaturedProperties['backgroundColor'];
  image?: FeaturedProperties['backgroundImage'];
  origin?: FeaturedProperties['backgroundOrigin'];
  position?: FeaturedProperties['backgroundPosition'];
  positionX?: FeaturedProperties['backgroundPositionX'];
  positionY?: FeaturedProperties['backgroundPositionY'];
  repeat?: FeaturedProperties['backgroundRepeat'];
  size?: FeaturedProperties['backgroundSize'];
}

interface BorderProperty {
  collapse?: FeaturedProperties['borderCollapse'];
  blockEnd?: FeaturedProperties['borderBlockEnd'];
  blockStart?: FeaturedProperties['borderBlockStart'];
  inlineEnd?: FeaturedProperties['borderInlineEnd'];
  inlineStart?: FeaturedProperties['borderInlineStart'];
  radius?: FeaturedProperties['borderRadius'];
  spacing?: FeaturedProperties['borderSpacing'];
  top?: BorderTopProperty;
  right?: BorderRightProperty;
  bottom?: BorderBottomProperty;
  left?: BorderLeftProperty;
  xy?: BorderLeftProperty;
  x?: BorderLeftProperty;
  y?: BorderTopProperty;
}

interface BorderImageProperty {
  outset?: FeaturedProperties['borderImageOutset'];
  repeat?: FeaturedProperties['borderImageRepeat'];
  slice?: FeaturedProperties['borderImageSlice'];
  source?: FeaturedProperties['borderImageSource'];
  width?: FeaturedProperties['borderImageWidth'];
}

interface BorderLeftProperty {
  color?: FeaturedProperties['borderLeftColor'];
  style?: FeaturedProperties['borderLeftStyle'];
  width?: FeaturedProperties['borderLeftWidth'];
}

interface BorderRightProperty {
  color?: FeaturedProperties['borderRightColor'];
  style?: FeaturedProperties['borderRightStyle'];
  width?: FeaturedProperties['borderRightWidth'];
}

interface BorderYRadius {
  right?: { radius?: FeaturedProperties['borderTopRightRadius'] };
  left?: { radius?: FeaturedProperties['borderTopLeftRadius'] };
  x?: { radius?: FeaturedProperties['borderTopLeftRadius'] };
}

interface BorderBottomProperty extends BorderYRadius {
  color?: FeaturedProperties['borderBottomColor'];
  style?: FeaturedProperties['borderBottomStyle'];
  width?: FeaturedProperties['borderBottomWidth'];
}

interface BorderTopProperty extends BorderYRadius {
  color?: FeaturedProperties['borderTopColor'];
  style?: FeaturedProperties['borderTopStyle'];
  width?: FeaturedProperties['borderTopWidth'];
}

interface FlexProperty {
  basis?: FeaturedProperties['flexBasis'];
  direction?: FeaturedProperties['flexDirection'];
  grow?: FeaturedProperties['flexGrow'];
  shrink?: FeaturedProperties['flexShrink'];
  wrap?: FeaturedProperties['flexWrap'];
}

interface FontProperty {
  family?: FontFaceProperty;
  featureSettings?: FeaturedProperties['fontFeatureSettings'];
  kerning?: FeaturedProperties['fontKerning'];
  languageOverride?: FeaturedProperties['fontLanguageOverride'];
  variationSettings?: FeaturedProperties['fontVariationSettings'];
  size?: FeaturedProperties['fontSize'];
  sizeAdjust?: FeaturedProperties['fontSizeAdjust'];
  stretch?: FeaturedProperties['fontStretch'];
  style?: FeaturedProperties['fontStyle'];
  synthesis?: FeaturedProperties['fontSynthesis'];
  variant?: FeaturedProperties['fontVariant'];
  weight?: FeaturedProperties['fontWeight'];
}

interface GridProperty {
  auto?: GridAutoProperty;
  column?: GridColumnProperty;
  row?: GridRowProperty;
  template?: GridTemplateProperty;
}

interface GridAutoProperty {
  columns?: FeaturedProperties['gridAutoColumns'];
  flow?: FeaturedProperties['gridAutoFlow'];
  rows?: FeaturedProperties['gridAutoRows'];
}

interface GridColumnProperty {
  end?: FeaturedProperties['gridColumnEnd'];
  gap?: FeaturedProperties['gridColumnGap'];
  start?: FeaturedProperties['gridColumnStart'];
}

interface GridRowProperty {
  end?: FeaturedProperties['gridRowEnd'];
  gap?: FeaturedProperties['gridRowGap'];
  start?: FeaturedProperties['gridRowStart'];
}

interface GridTemplateProperty {
  areas?: FeaturedProperties['gridTemplateAreas'];
  columns?: FeaturedProperties['gridTemplateColumns'];
  rows?: FeaturedProperties['gridTemplateRows'];
}

interface MaskBorderProperty {
  mode?: FeaturedProperties['maskBorderMode'];
  outset?: FeaturedProperties['maskBorderOutset'];
  repeat?: FeaturedProperties['maskBorderRepeat'];
  slice?: FeaturedProperties['maskBorderSlice'];
  source?: FeaturedProperties['maskBorderSource'];
  width?: FeaturedProperties['maskBorderWidth'];
}

interface MaskProperty {
  clip?: FeaturedProperties['maskClip'];
  composite?: FeaturedProperties['maskComposite'];
  image?: FeaturedProperties['maskImage'];
  mode?: FeaturedProperties['maskMode'];
  origin?: FeaturedProperties['maskOrigin'];
  position?: FeaturedProperties['maskPosition'];
  repeat?: FeaturedProperties['maskRepeat'];
  size?: FeaturedProperties['maskSize'];
  type?: FeaturedProperties['maskType'];
}

interface MarginProperty {
  xy?: FeaturedProperties['marginLeft'];
  x?: FeaturedProperties['marginLeft'];
  y?: FeaturedProperties['marginTop'];
  top?: FeaturedProperties['marginTop'];
  right?: FeaturedProperties['marginRight'];
  bottom?: FeaturedProperties['marginBottom'];
  left?: FeaturedProperties['marginLeft'];
}

interface OffsetProperty {
  anchor?: FeaturedProperties['offsetAnchor'];
  blockEnd?: FeaturedProperties['offsetBlockEnd'];
  blockStart?: FeaturedProperties['offsetBlockStart'];
  inlineEnd?: FeaturedProperties['offsetInlineEnd'];
  inlineStart?: FeaturedProperties['offsetInlineStart'];
  distance?: FeaturedProperties['offsetDistance'];
  path?: FeaturedProperties['offsetPath'];
  rotate?: FeaturedProperties['offsetRotate'];
}

interface OutlineProperty {
  color?: FeaturedProperties['outlineColor'];
  offset?: FeaturedProperties['outlineOffset'];
  style?: FeaturedProperties['outlineStyle'];
  width?: FeaturedProperties['outlineWidth'];
}

interface PaddingProperty {
  xy?: FeaturedProperties['paddingLeft'];
  x?: FeaturedProperties['paddingLeft'];
  y?: FeaturedProperties['paddingTop'];
  top?: FeaturedProperties['paddingTop'];
  right?: FeaturedProperties['paddingRight'];
  bottom?: FeaturedProperties['paddingBottom'];
  left?: FeaturedProperties['paddingLeft'];
}

interface TransitionProperty {
  delay?: FeaturedProperties['transitionDelay'];
  duration?: FeaturedProperties['transitionDuration'];
  property?: FeaturedProperties['transitionProperty'];
  timingFunction?: FeaturedProperties['transitionTimingFunction'];
}

type ExcludedShorthands = 'borderColor' | 'borderStyle' | 'borderWidth';

type Selectors = { [P in CSS.SimplePseudos | CSS.HtmlAttributes | CSS.SvgAttributes]?: Style };
