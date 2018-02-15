import * as CSS from 'csstype';

export interface Style extends FeaturedProperties, PseudoMap {
  '@keyframes'?: PropertiesList;
  '@font-face'?: FontFace;
}

export interface Properties extends CSS.StandardLonghandPropertiesFallback, CSS.VendorPropertiesFallback {}

type FeaturedProperties = Omit<Properties, keyof ExtendedProperties> &
  ExtendedProperties &
  Omit<CSS.StandardShorthandPropertiesFallback, keyof ShorthandProperties> &
  ShorthandProperties;

interface ExtendedProperties {
  animationName?: PropertiesList | Properties['animationName'];
  fontFamily?:
    | FontFace
    | CSS.StandardLonghandProperties['fontFamily']
    | Array<FontFace | CSS.StandardLonghandProperties['fontFamily']>;
}

interface ShorthandProperties {
  animation?: {
    delay?: CSS.StandardLonghandPropertiesFallback['animationDelay'];
    direction?: CSS.StandardLonghandPropertiesFallback['animationDirection'];
    duration?: CSS.StandardLonghandPropertiesFallback['animationDuration'];
    fillMode?: CSS.StandardLonghandPropertiesFallback['animationFillMode'];
    iterationCount?: CSS.StandardLonghandPropertiesFallback['animationIterationCount'];
    name?: CSS.StandardLonghandPropertiesFallback['animationName'];
    playState?: CSS.StandardLonghandPropertiesFallback['animationPlayState'];
    timingFunction?: CSS.StandardLonghandPropertiesFallback['animationTimingFunction'];
  };
  background?: {
    attachment?: CSS.StandardLonghandPropertiesFallback['backgroundAttachment'];
    blendMode?: CSS.StandardLonghandPropertiesFallback['backgroundBlendMode'];
    clip?: CSS.StandardLonghandPropertiesFallback['backgroundClip'];
    color?: CSS.StandardLonghandPropertiesFallback['backgroundColor'];
    image?: CSS.StandardLonghandPropertiesFallback['backgroundImage'];
    origin?: CSS.StandardLonghandPropertiesFallback['backgroundOrigin'];
    position?: CSS.StandardLonghandPropertiesFallback['backgroundPosition'];
    repeat?: CSS.StandardLonghandPropertiesFallback['backgroundRepeat'];
    size?: CSS.StandardLonghandPropertiesFallback['backgroundSize'];
  };
  border?: {
    color?: CSS.StandardShorthandPropertiesFallback['borderColor'];
    style?: CSS.StandardShorthandPropertiesFallback['borderStyle'];
    width?: CSS.StandardShorthandPropertiesFallback['borderWidth'];
  };
  borderBottom?: {
    color?: CSS.StandardLonghandPropertiesFallback['borderBottomColor'];
    style?: CSS.StandardLonghandPropertiesFallback['borderBottomStyle'];
    width?: CSS.StandardLonghandPropertiesFallback['borderBottomWidth'];
  };
  borderImage?: {
    outset?: CSS.StandardLonghandPropertiesFallback['borderImageOutset'];
    repeat?: CSS.StandardLonghandPropertiesFallback['borderImageRepeat'];
    slice?: CSS.StandardLonghandPropertiesFallback['borderImageSlice'];
    source?: CSS.StandardLonghandPropertiesFallback['borderImageSource'];
    width?: CSS.StandardLonghandPropertiesFallback['borderImageWidth'];
  };
  borderLeft?: {
    color?: CSS.StandardLonghandPropertiesFallback['borderLeftColor'];
    style?: CSS.StandardLonghandPropertiesFallback['borderLeftStyle'];
    width?: CSS.StandardLonghandPropertiesFallback['borderLeftWidth'];
  };
  borderRight?: {
    color?: CSS.StandardLonghandPropertiesFallback['borderRightColor'];
    style?: CSS.StandardLonghandPropertiesFallback['borderRightStyle'];
    width?: CSS.StandardLonghandPropertiesFallback['borderRightWidth'];
  };
  borderTop?: {
    color?: CSS.StandardLonghandPropertiesFallback['borderTopColor'];
    style?: CSS.StandardLonghandPropertiesFallback['borderTopStyle'];
    width?: CSS.StandardLonghandPropertiesFallback['borderTopWidth'];
  };
  flex?: {
    basis?: CSS.StandardLonghandPropertiesFallback['flexBasis'];
    direction?: CSS.StandardLonghandPropertiesFallback['flexDirection'];
    grow?: CSS.StandardLonghandPropertiesFallback['flexGrow'];
    shrink?: CSS.StandardLonghandPropertiesFallback['flexShrink'];
    wrap?: CSS.StandardLonghandPropertiesFallback['flexWrap'];
  };
  font?: {
    family?: CSS.StandardLonghandPropertiesFallback['fontFamily'];
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
  };
  grid?: {
    autoColumns?: CSS.StandardLonghandPropertiesFallback['gridAutoColumns'];
    autoFlow?: CSS.StandardLonghandPropertiesFallback['gridAutoFlow'];
    autoRows?: CSS.StandardLonghandPropertiesFallback['gridAutoRows'];
    column?: CSS.StandardShorthandPropertiesFallback['gridColumn'];
    columnGap?: CSS.StandardLonghandPropertiesFallback['gridColumnGap'];
    row?: CSS.StandardShorthandPropertiesFallback['gridRow'];
    rowGap?: CSS.StandardLonghandPropertiesFallback['gridRowGap'];
    template?: CSS.StandardShorthandPropertiesFallback['gridTemplate'];
  };
  maskBorder?: {
    mode?: CSS.StandardLonghandPropertiesFallback['maskBorderMode'];
    outset?: CSS.StandardLonghandPropertiesFallback['maskBorderOutset'];
    repeat?: CSS.StandardLonghandPropertiesFallback['maskBorderRepeat'];
    slice?: CSS.StandardLonghandPropertiesFallback['maskBorderSlice'];
    source?: CSS.StandardLonghandPropertiesFallback['maskBorderSource'];
    width?: CSS.StandardLonghandPropertiesFallback['maskBorderWidth'];
  };
  mask?: {
    clip?: CSS.StandardLonghandPropertiesFallback['maskClip'];
    composite?: CSS.StandardLonghandPropertiesFallback['maskComposite'];
    image?: CSS.StandardLonghandPropertiesFallback['maskImage'];
    mode?: CSS.StandardLonghandPropertiesFallback['maskMode'];
    origin?: CSS.StandardLonghandPropertiesFallback['maskOrigin'];
    position?: CSS.StandardLonghandPropertiesFallback['maskPosition'];
    repeat?: CSS.StandardLonghandPropertiesFallback['maskRepeat'];
    size?: CSS.StandardLonghandPropertiesFallback['maskSize'];
    type?: CSS.StandardLonghandPropertiesFallback['maskType'];
  };
  margin?: {
    x?: CSS.StandardLonghandPropertiesFallback['marginLeft'];
    y?: CSS.StandardLonghandPropertiesFallback['marginTop'];
    top?: CSS.StandardLonghandPropertiesFallback['marginTop'];
    right?: CSS.StandardLonghandPropertiesFallback['marginRight'];
    bottom?: CSS.StandardLonghandPropertiesFallback['marginBottom'];
    left?: CSS.StandardLonghandPropertiesFallback['marginLeft'];
  };
  offset?: {
    anchor?: CSS.StandardLonghandPropertiesFallback['offsetAnchor'];
    blockEnd?: CSS.StandardLonghandPropertiesFallback['offsetBlockEnd'];
    blockStart?: CSS.StandardLonghandPropertiesFallback['offsetBlockStart'];
    inlineEnd?: CSS.StandardLonghandPropertiesFallback['offsetInlineEnd'];
    inlineStart?: CSS.StandardLonghandPropertiesFallback['offsetInlineStart'];
    distance?: CSS.StandardLonghandPropertiesFallback['offsetDistance'];
    path?: CSS.StandardLonghandPropertiesFallback['offsetPath'];
    position?: CSS.StandardLonghandPropertiesFallback['offsetPosition'];
    rotate?: CSS.StandardLonghandPropertiesFallback['offsetRotate'];
  };
  outline?: {
    color?: CSS.StandardLonghandPropertiesFallback['outlineColor'];
    offset?: CSS.StandardLonghandPropertiesFallback['outlineOffset'];
    style?: CSS.StandardLonghandPropertiesFallback['outlineStyle'];
    width?: CSS.StandardLonghandPropertiesFallback['outlineWidth'];
  };
  padding?: {
    x?: CSS.StandardLonghandPropertiesFallback['paddingLeft'];
    y?: CSS.StandardLonghandPropertiesFallback['paddingTop'];
    top?: CSS.StandardLonghandPropertiesFallback['paddingTop'];
    right?: CSS.StandardLonghandPropertiesFallback['paddingRight'];
    bottom?: CSS.StandardLonghandPropertiesFallback['paddingBottom'];
    left?: CSS.StandardLonghandPropertiesFallback['paddingLeft'];
  };
  transition?: {
    delay?: CSS.StandardLonghandPropertiesFallback['transitionDelay'];
    duration?: CSS.StandardLonghandPropertiesFallback['transitionDuration'];
    property?: CSS.StandardLonghandPropertiesFallback['transitionProperty'];
    timingFunction?: CSS.StandardLonghandPropertiesFallback['transitionTimingFunction'];
  };
}

type PseudoMap = { [P in CSS.SimplePseudos]?: Style };

interface PropertiesList {
  [identifier: string]: Properties;
}

type FontFace = Omit<CSS.FontFaceFallback, 'fontFamily'>;

type Diff<T extends string, U extends string> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;
