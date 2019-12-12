import { PreStyleProps } from '@glitz/react';
import { Style } from '@glitz/type';

function remToPx(value: number, baseValue: number) {
  return `${value * baseValue}px`;
}

const FONT_FAMILY_BASE = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  '"Noto Sans"',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
  '"Noto Color Emoji"',
];

const FONT_FAMILY_MONOSPACE = [
  'SFMono-Regular',
  'Menlo',
  'Monaco',
  'Consolas',
  '"Liberation Mono"',
  '"Courier New"',
  'monospace',
];

type Options = {
  baseValue?: 16;
  fontFamilyBase?: Style['fontFamily'];
  fontSizeBase?: Style['fontSize'];
  fontWeightBase?: Style['fontWeight'];
  lineHeightBase?: Style['lineHeight'];
  bodyColor?: Style['color'];
  bodyTextAlign?: Style['textAlign'];
  bodyBg?: Style['backgroundColor'];
  hrMarginY?: Style['marginTop'];
  hrColor?: Style['color'];
  hrOpacity?: Style['opacity'];
  hrHeight?: Style['height'];
  headingsMarginBottom?: Style['marginBottom'];
  headingsFontFamily?: Style['fontFamily'];
  headingsFontStyle?: Style['fontStyle'];
  headingsFontWeight?: Style['fontWeight'];
  headingsLineHeight?: Style['lineHeight'];
  headingsColor?: Style['color'];
  h1FontSize?: Style['fontSize'];
  h2FontSize?: Style['fontSize'];
  h3FontSize?: Style['fontSize'];
  h4FontSize?: Style['fontSize'];
  h5FontSize?: Style['fontSize'];
  h6FontSize?: Style['fontSize'];
  paragraphMarginBottom?: Style['marginBottom'];
  dtFontWeight?: Style['fontWeight'];
  fontWeightBolder?: Style['fontWeight'];
  smallFontSize?: Style['fontSize'];
  subSupFontSize?: Style['fontSize'];
  linkColor?: Style['color'];
  linkDecoration?: Style['textDecoration'];
  linkHoverColor?: Style['color'];
  linkHoverDecoration?: Style['textDecoration'];
  fontFamilyMonospace?: Style['fontFamily'];
  codeFontSize?: Style['fontSize'];
  preColor?: Style['color'];
  codeColor?: Style['color'];
  kbdPaddingX?: Style['paddingLeft'];
  kbdPaddingY?: Style['paddingTop'];
  kbdFontSize?: Style['fontSize'];
  kbdColor?: Style['color'];
  kbdBg?: Style['backgroundColor'];
  tableCellPadding?: Style['paddingTop'];
  tableCaptionColor?: Style['color'];
  labelMarginBottom?: Style['marginBottom'];
  enablePointerCursorForButtons?: boolean;
  legendMarginBottom?: Style['marginBottom'];
  legendFontSize?: Style['fontSize'];
  legendFontWeight?: Style['fontWeight'];
  markPadding?: Style['paddingTop'];
  markBg?: Style['backgroundColor'];
};

// Migrated from https://github.com/twbs/bootstrap/blob/master/scss/_reboot.scss
export default function glitzReboot({
  baseValue = 16,
  fontFamilyBase = FONT_FAMILY_BASE,
  fontSizeBase = remToPx(1, baseValue),
  fontWeightBase = 400,
  lineHeightBase = 1.5,
  bodyColor = '#212529',
  bodyTextAlign,
  bodyBg = '#fff',
  hrMarginY = '1rem',
  hrColor = 'inherit',
  hrOpacity = 0.25,
  hrHeight = '1px',
  headingsMarginBottom = remToPx(0.5, baseValue),
  headingsFontFamily,
  headingsFontStyle,
  headingsFontWeight = 500,
  headingsLineHeight = 1.2,
  headingsColor,
  h1FontSize = remToPx(2.5, baseValue),
  h2FontSize = remToPx(2, baseValue),
  h3FontSize = remToPx(1.75, baseValue),
  h4FontSize = remToPx(1.5, baseValue),
  h5FontSize = remToPx(1.25, baseValue),
  h6FontSize = remToPx(1, baseValue),
  paragraphMarginBottom = remToPx(1, baseValue),
  dtFontWeight = 700,
  fontWeightBolder = 'bolder',
  smallFontSize = remToPx(0.875, baseValue),
  subSupFontSize = '.75em',
  linkColor = '#0d6efd',
  linkDecoration = 'none',
  linkHoverColor = '#024dbc',
  linkHoverDecoration = 'underline',
  fontFamilyMonospace = FONT_FAMILY_MONOSPACE,
  codeFontSize = '.875em',
  preColor,
  codeColor = '#d63384',
  kbdPaddingX = remToPx(0.4, baseValue),
  kbdPaddingY = remToPx(0.2, baseValue),
  kbdFontSize = '.875em',
  kbdColor = '#fff',
  kbdBg = '#212529',
  tableCellPadding = remToPx(0.5, baseValue),
  tableCaptionColor = '#6c757d',
  labelMarginBottom = remToPx(0.5, baseValue),
  enablePointerCursorForButtons,
  legendMarginBottom = remToPx(0.5, baseValue),
  legendFontSize = remToPx(1.5, baseValue),
  legendFontWeight,
  markPadding = '.2em',
  markBg = '#fcf8e3',
}: Options = {}): PreStyleProps {
  const universal = { boxSizing: 'border-box' } as const;

  const heading = {
    margin: { top: 0, bottom: headingsMarginBottom },
    font: { family: headingsFontFamily, style: headingsFontStyle, weight: headingsFontWeight },
    lineHeight: headingsLineHeight,
    color: headingsColor,
  } as const;

  const list = { margin: { top: 0, bottom: remToPx(1, baseValue) } } as const;

  const subSup = { position: 'relative', fontSize: subSupFontSize, lineHeight: 0, verticalAlign: 'baseline' } as const;

  const linkNoHref = { color: 'inherit', textDecoration: 'none' } as const;

  const code = { fontFamily: fontFamilyMonospace, fontSize: '1em' } as const;

  const input = { margin: { xy: 0 }, font: { family: 'inherit', size: 'inherit' }, lineHeight: 'inherit' } as const;

  const button = {
    WebkitAppearance: 'button',
    ...(enablePointerCursorForButtons && { [':not([disabled])' as string]: { cursor: 'pointer' } }),
  } as const;

  const textarea = { WebkitAppearance: 'textarea' } as const;

  return {
    universal: {
      ...universal,
      ':before': universal,
      ':after': universal,
    },
    body: {
      margin: { xy: 0 },
      font: {
        family: fontFamilyBase,
        size: fontSizeBase,
        weight: fontWeightBase,
      },
      lineHeight: lineHeightBase,
      color: bodyColor,
      textAlign: bodyTextAlign,
      backgroundColor: bodyBg,
      WebkitTextSizeAdjust: '100%',
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    },
    // [tabindex="-1"]:focus:not(:focus-visible) {
    //   outline: 0 !important;
    // }
    hr: {
      margin: { x: 0, y: hrMarginY },
      color: hrColor,
      backgroundColor: 'currentColor',
      border: { xy: { width: 0 } },
      opacity: hrOpacity,
      [':not([size])' as string]: { height: hrHeight },
    },
    h1: { ...heading, fontSize: h1FontSize },
    h2: { ...heading, fontSize: h2FontSize },
    h3: { ...heading, fontSize: h3FontSize },
    h4: { ...heading, fontSize: h4FontSize },
    h5: { ...heading, fontSize: h5FontSize },
    h6: { ...heading, fontSize: h6FontSize },
    p: { margin: { top: 0, bottom: paragraphMarginBottom } },
    abbr: {
      ['[title]' as string]: {
        textDecoration: ['underline', 'underline dotted'],
        cursor: 'help',
        textDecorationSkipInk: 'none',
      },
    },
    address: { marginBottom: remToPx(1, baseValue), fontStyle: 'normal', lineHeight: 'inherit' },
    ol: { paddingLeft: remToPx(2, baseValue), ...list },
    ul: { paddingLeft: remToPx(2, baseValue), ...list },
    dl: list,
    // ol ol,
    // ul ul,
    // ol ul,
    // ul ol {
    //   margin-bottom: 0;
    // }
    dt: { fontWeight: dtFontWeight },
    dd: { margin: { bottom: remToPx(0.5, baseValue), left: 0 } },
    blockquote: { margin: { top: 0, x: 0, bottom: remToPx(1, baseValue) } },
    b: { fontWeight: fontWeightBolder },
    strong: { fontWeight: fontWeightBolder },
    small: { fontSize: smallFontSize },
    sub: { ...subSup, bottom: '-.25em' },
    sup: { ...subSup, top: '-.5em' },
    a: {
      color: linkColor,
      textDecoration: linkDecoration,
      ':hover': {
        color: linkHoverColor,
        textDecoration: linkHoverDecoration,
      },
      [':not([href])' as string]: {
        ...linkNoHref,
        ':hover': linkNoHref,
      },
    },
    pre: {
      ...code,
      display: 'block',
      margin: { top: '0', bottom: remToPx(1, baseValue) },
      overflow: 'auto',
      fontSize: codeFontSize,
      color: preColor,
    },
    // pre code {
    //   @include font-size(inherit);
    //   color: inherit;
    //   word-break: normal;
    // }
    code: { ...code, fontSize: codeFontSize, color: codeColor, wordWrap: 'break-word' },
    // a > code {
    //   color: inherit;
    // }
    kbd: {
      ...code,
      padding: { x: kbdPaddingX, y: kbdPaddingY },
      fontSize: kbdFontSize,
      color: kbdColor,
      backgroundColor: kbdBg,
      borderRadius: remToPx(0.2, baseValue),
    },
    // kbd kbd {
    //   padding: 0;
    //   @include font-size(1em);
    //   font-weight: $nested-kbd-font-weight;
    // }
    samp: code,
    figure: { margin: { top: 0, x: 0, bottom: remToPx(1, baseValue) } },
    img: { verticalAlign: 'middle' },
    svg: { overflow: 'hidden', verticalAlign: 'middle' },
    table: { borderCollapse: 'collapse' },
    caption: {
      padding: { y: tableCellPadding },
      color: tableCaptionColor,
      textAlign: 'left',
      captionSide: 'bottom',
    },
    th: { textAlign: 'inherit' },
    label: { display: 'inline-block', marginBottom: labelMarginBottom },
    button: {
      ...input,
      ...button,
      border: { y: { x: { radius: 0 } } },
      ':focus': { outline: { color: '-webkit-focus-ring-color', style: 'auto', width: '5px' } },
      overflow: 'visible',
      ['::-moz-focus-inner' as string]: { padding: { xy: 0 }, border: { xy: { style: 'none' } } },
    },
    input: {
      ...input,
      overflow: 'visible',
      ['[type="button"]' as string]: button,
      ['[type="reset"]' as string]: button,
      ['[type="submit"]' as string]: button,
      ['[list]::-webkit-calendar-picker-indicator' as string]: { display: 'none' },
      ['[type="date"]' as string]: textarea,
      ['[type="time"]' as string]: textarea,
      ['[type="datetime-local"]' as string]: textarea,
      ['[type="month"]' as string]: textarea,
      ['::-webkit-datetime-edit' as string]: { overflow: 'visible', lineHeight: 0 },
      ['[type="search"]' as string]: { outlineOffset: '-2px', WebkitAppearance: 'textfield' },
      ['::-webkit-search-decoration' as string]: { WebkitAppearance: 'none' },
      ['::-webkit-color-swatch-wrapper' as string]: { padding: { xy: 0 } },
      ['::-webkit-search-decoration' as string]: {
        font: {
          style: 'inherit',
          variant: 'inherit',
          weight: 'inherit',
          stretch: 'inherit',
          size: 'inherit',
          family: 'inherit',
        },
        lineHeight: 'inherit',
        WebkitAppearance: 'button',
      },
    },
    select: { ...input, textTransform: 'none', wordWrap: 'normal' },
    optgroup: { ...input },
    textarea: { ...input, overflow: 'auto', resize: 'vertical' },
    fieldset: { minWidth: 0, padding: { xy: 0 }, margin: { xy: 0 }, border: { xy: { width: 0 } } },
    legend: {
      float: 'left',
      width: '100%',
      padding: { xy: 0 },
      marginBottom: legendMarginBottom,
      fontSize: legendFontSize,
      fontWeight: legendFontWeight,
      lineHeight: 'inherit',
      color: 'inherit',
      whiteSpace: 'normal',
    },
    mark: { padding: { xy: markPadding }, backgroundColor: markBg },
    progress: { verticalAlign: 'baseline' },
    output: { display: 'inline-block' },
    summary: { display: 'list-item', cursor: 'pointer' },
    template: { display: 'none' },
    main: { display: 'block' },
    // [hidden] {
    //   display: none !important;
    // }
  };
}
