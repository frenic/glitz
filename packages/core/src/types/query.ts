export interface Query {
  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/width
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/height
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/aspect-ratio
  aspectRatio?: string;
  minAspectRatio?: string;
  maxAspectRatio?: string;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/orientation
  orientation?: 'portrait' | 'landscape';

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/resolution
  resolution?: number | string;
  minResolution?: number | string;
  maxResolution?: number | string;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/scan
  scan?: 'interlace' | 'progressive';

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/grid
  grid?: 0 | 1;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/update-frequency
  update?: 'none' | 'slow' | 'fast';

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/overflow-block
  overflowBlock?: 'none' | 'scroll' | 'optional-paged' | 'paged';

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/overflow-inline
  overflowInline?: 'none' | 'scroll';

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color
  color?: number | true;
  minColor?: number | true;
  maxColor?: number | true;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-gamut
  colorGamut?: 'srgb' | 'p3' | 'rec2020';

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-index
  colorIndex?: number | true;
  minColorIndex?: number | true;
  maxColorIndex?: number | true;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/display-mode
  displayMode?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/monochrome
  monochrome?: number | true;
  minMonochrome?: number | true;
  maxMonochrome?: number | true;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/inverted-colors
  invertedColors?: 'none' | 'inverted';

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer
  pointer?: 'none' | 'coarse' | 'fine';

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover
  hover?: 'none' | 'hover';

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/any-pointer
  anyPointer?: 'none' | 'coarse' | 'fine';

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/any-hover
  anyHover?: 'none' | 'hover';

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/light-level
  lightLevel?: 'dim' | 'normal' | 'washed';

  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/scripting
  scripting?: 'none' | 'initial-only' | 'enabled';
}
