import { Style } from '@glitz/core';
import { create, StyledComponent } from './create';

function createPredefined(component: string) {
  return (style: Style) => create(component, style);
}

export function assignPredefined<TTarget>(target: TTarget) {
  for (const element of predefinedElements) {
    (target as any)[element.charAt(0).toUpperCase() + element.slice(1)] = create(element);
    (target as any)[element] = createPredefined(element);
  }
  return target as TTarget & PredefinedStyled;
}

export type PredefinedFunction<TProps> = (style: Style) => StyledComponent<TProps>;

export interface PredefinedStyled {
  A: StyledComponent<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
  Abbr: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Address: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Area: StyledComponent<React.AreaHTMLAttributes<HTMLAreaElement>>;
  Article: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Aside: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Audio: StyledComponent<React.AudioHTMLAttributes<HTMLAudioElement>>;
  B: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Base: StyledComponent<React.BaseHTMLAttributes<HTMLBaseElement>>;
  Bdi: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Bdo: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Big: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Blockquote: StyledComponent<React.BlockquoteHTMLAttributes<HTMLElement>>;
  Body: StyledComponent<React.HTMLAttributes<HTMLBodyElement>>;
  Br: StyledComponent<React.HTMLAttributes<HTMLBRElement>>;
  Button: StyledComponent<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  Canvas: StyledComponent<React.CanvasHTMLAttributes<HTMLCanvasElement>>;
  Caption: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Cite: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Code: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Col: StyledComponent<React.ColHTMLAttributes<HTMLTableColElement>>;
  Colgroup: StyledComponent<React.ColgroupHTMLAttributes<HTMLTableColElement>>;
  Data: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Datalist: StyledComponent<React.HTMLAttributes<HTMLDataListElement>>;
  Dd: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Del: StyledComponent<React.DelHTMLAttributes<HTMLElement>>;
  Details: StyledComponent<React.DetailsHTMLAttributes<HTMLElement>>;
  Dfn: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Dialog: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Div: StyledComponent<React.HTMLAttributes<HTMLDivElement>>;
  Dl: StyledComponent<React.HTMLAttributes<HTMLDListElement>>;
  Dt: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Em: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Embed: StyledComponent<React.EmbedHTMLAttributes<HTMLEmbedElement>>;
  Fieldset: StyledComponent<React.FieldsetHTMLAttributes<HTMLFieldSetElement>>;
  Figcaption: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Figure: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Footer: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Form: StyledComponent<React.FormHTMLAttributes<HTMLFormElement>>;
  H1: StyledComponent<React.HTMLAttributes<HTMLHeadingElement>>;
  H2: StyledComponent<React.HTMLAttributes<HTMLHeadingElement>>;
  H3: StyledComponent<React.HTMLAttributes<HTMLHeadingElement>>;
  H4: StyledComponent<React.HTMLAttributes<HTMLHeadingElement>>;
  H5: StyledComponent<React.HTMLAttributes<HTMLHeadingElement>>;
  H6: StyledComponent<React.HTMLAttributes<HTMLHeadingElement>>;
  Head: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Header: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Hgroup: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Hr: StyledComponent<React.HTMLAttributes<HTMLHRElement>>;
  Html: StyledComponent<React.HtmlHTMLAttributes<HTMLHtmlElement>>;
  I: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Iframe: StyledComponent<React.IframeHTMLAttributes<HTMLIFrameElement>>;
  Img: StyledComponent<React.ImgHTMLAttributes<HTMLImageElement>>;
  Input: StyledComponent<React.InputHTMLAttributes<HTMLInputElement>>;
  Ins: StyledComponent<React.InsHTMLAttributes<HTMLModElement>>;
  Kbd: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Keygen: StyledComponent<React.KeygenHTMLAttributes<HTMLElement>>;
  Label: StyledComponent<React.LabelHTMLAttributes<HTMLLabelElement>>;
  Legend: StyledComponent<React.HTMLAttributes<HTMLLegendElement>>;
  Li: StyledComponent<React.LiHTMLAttributes<HTMLLIElement>>;
  Link: StyledComponent<React.LinkHTMLAttributes<HTMLLinkElement>>;
  Main: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Map: StyledComponent<React.MapHTMLAttributes<HTMLMapElement>>;
  Mark: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Menu: StyledComponent<React.MenuHTMLAttributes<HTMLElement>>;
  Menuitem: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Meta: StyledComponent<React.MetaHTMLAttributes<HTMLMetaElement>>;
  Meter: StyledComponent<React.MeterHTMLAttributes<HTMLElement>>;
  Nav: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Noscript: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Object: StyledComponent<React.ObjectHTMLAttributes<HTMLObjectElement>>;
  Ol: StyledComponent<React.OlHTMLAttributes<HTMLOListElement>>;
  Optgroup: StyledComponent<React.OptgroupHTMLAttributes<HTMLOptGroupElement>>;
  Option: StyledComponent<React.OptionHTMLAttributes<HTMLOptionElement>>;
  Output: StyledComponent<React.OutputHTMLAttributes<HTMLElement>>;
  P: StyledComponent<React.HTMLAttributes<HTMLParagraphElement>>;
  Param: StyledComponent<React.ParamHTMLAttributes<HTMLParamElement>>;
  Picture: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Pre: StyledComponent<React.HTMLAttributes<HTMLPreElement>>;
  Progress: StyledComponent<React.ProgressHTMLAttributes<HTMLProgressElement>>;
  Q: StyledComponent<React.QuoteHTMLAttributes<HTMLQuoteElement>>;
  Rp: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Rt: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Ruby: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  S: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Samp: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Script: StyledComponent<React.ScriptHTMLAttributes<HTMLScriptElement>>;
  Section: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Select: StyledComponent<React.SelectHTMLAttributes<HTMLSelectElement>>;
  Small: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Source: StyledComponent<React.SourceHTMLAttributes<HTMLSourceElement>>;
  Span: StyledComponent<React.HTMLAttributes<HTMLSpanElement>>;
  Strong: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Style: StyledComponent<React.StyleHTMLAttributes<HTMLStyleElement>>;
  Sub: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Summary: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Sup: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Table: StyledComponent<React.TableHTMLAttributes<HTMLTableElement>>;
  Tbody: StyledComponent<React.HTMLAttributes<HTMLTableSectionElement>>;
  Td: StyledComponent<React.TdHTMLAttributes<HTMLTableDataCellElement>>;
  Textarea: StyledComponent<React.TextareaHTMLAttributes<HTMLTextAreaElement>>;
  Tfoot: StyledComponent<React.HTMLAttributes<HTMLTableSectionElement>>;
  Th: StyledComponent<React.ThHTMLAttributes<HTMLTableHeaderCellElement>>;
  Thead: StyledComponent<React.HTMLAttributes<HTMLTableSectionElement>>;
  Time: StyledComponent<React.TimeHTMLAttributes<HTMLElement>>;
  Title: StyledComponent<React.HTMLAttributes<HTMLTitleElement>>;
  Tr: StyledComponent<React.HTMLAttributes<HTMLTableRowElement>>;
  Track: StyledComponent<React.TrackHTMLAttributes<HTMLTrackElement>>;
  U: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Ul: StyledComponent<React.HTMLAttributes<HTMLUListElement>>;
  Var: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Video: StyledComponent<React.VideoHTMLAttributes<HTMLVideoElement>>;
  Wbr: StyledComponent<React.HTMLAttributes<HTMLElement>>;
  Svg: StyledComponent<React.SVGAttributes<SVGElement>>;
  Animate: StyledComponent<React.SVGAttributes<SVGElement>>;
  Circle: StyledComponent<React.SVGAttributes<SVGElement>>;
  Defs: StyledComponent<React.SVGAttributes<SVGElement>>;
  Ellipse: StyledComponent<React.SVGAttributes<SVGElement>>;
  G: StyledComponent<React.SVGAttributes<SVGElement>>;
  Image: StyledComponent<React.SVGAttributes<SVGElement>>;
  Line: StyledComponent<React.SVGAttributes<SVGElement>>;
  LinearGradient: StyledComponent<React.SVGAttributes<SVGElement>>;
  Mask: StyledComponent<React.SVGAttributes<SVGElement>>;
  Path: StyledComponent<React.SVGAttributes<SVGElement>>;
  Pattern: StyledComponent<React.SVGAttributes<SVGElement>>;
  Polygon: StyledComponent<React.SVGAttributes<SVGElement>>;
  Polyline: StyledComponent<React.SVGAttributes<SVGElement>>;
  RadialGradient: StyledComponent<React.SVGAttributes<SVGElement>>;
  Rect: StyledComponent<React.SVGAttributes<SVGElement>>;
  Stop: StyledComponent<React.SVGAttributes<SVGElement>>;
  Symbol: StyledComponent<React.SVGAttributes<SVGElement>>;
  Text: StyledComponent<React.SVGAttributes<SVGElement>>;
  Tspan: StyledComponent<React.SVGAttributes<SVGElement>>;
  Use: StyledComponent<React.SVGAttributes<SVGElement>>;

  a: PredefinedFunction<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
  abbr: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  address: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  area: PredefinedFunction<React.AreaHTMLAttributes<HTMLAreaElement>>;
  article: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  aside: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  audio: PredefinedFunction<React.AudioHTMLAttributes<HTMLAudioElement>>;
  b: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  base: PredefinedFunction<React.BaseHTMLAttributes<HTMLBaseElement>>;
  bdi: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  bdo: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  big: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  blockquote: PredefinedFunction<React.BlockquoteHTMLAttributes<HTMLElement>>;
  body: PredefinedFunction<React.HTMLAttributes<HTMLBodyElement>>;
  br: PredefinedFunction<React.HTMLAttributes<HTMLBRElement>>;
  button: PredefinedFunction<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  canvas: PredefinedFunction<React.CanvasHTMLAttributes<HTMLCanvasElement>>;
  caption: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  cite: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  code: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  col: PredefinedFunction<React.ColHTMLAttributes<HTMLTableColElement>>;
  colgroup: PredefinedFunction<React.ColgroupHTMLAttributes<HTMLTableColElement>>;
  data: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  datalist: PredefinedFunction<React.HTMLAttributes<HTMLDataListElement>>;
  dd: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  del: PredefinedFunction<React.DelHTMLAttributes<HTMLElement>>;
  details: PredefinedFunction<React.DetailsHTMLAttributes<HTMLElement>>;
  dfn: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  dialog: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  div: PredefinedFunction<React.HTMLAttributes<HTMLDivElement>>;
  dl: PredefinedFunction<React.HTMLAttributes<HTMLDListElement>>;
  dt: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  em: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  embed: PredefinedFunction<React.EmbedHTMLAttributes<HTMLEmbedElement>>;
  fieldset: PredefinedFunction<React.FieldsetHTMLAttributes<HTMLFieldSetElement>>;
  figcaption: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  figure: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  footer: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  form: PredefinedFunction<React.FormHTMLAttributes<HTMLFormElement>>;
  h1: PredefinedFunction<React.HTMLAttributes<HTMLHeadingElement>>;
  h2: PredefinedFunction<React.HTMLAttributes<HTMLHeadingElement>>;
  h3: PredefinedFunction<React.HTMLAttributes<HTMLHeadingElement>>;
  h4: PredefinedFunction<React.HTMLAttributes<HTMLHeadingElement>>;
  h5: PredefinedFunction<React.HTMLAttributes<HTMLHeadingElement>>;
  h6: PredefinedFunction<React.HTMLAttributes<HTMLHeadingElement>>;
  head: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  header: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  hgroup: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  hr: PredefinedFunction<React.HTMLAttributes<HTMLHRElement>>;
  html: PredefinedFunction<React.HtmlHTMLAttributes<HTMLHtmlElement>>;
  i: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  iframe: PredefinedFunction<React.IframeHTMLAttributes<HTMLIFrameElement>>;
  img: PredefinedFunction<React.ImgHTMLAttributes<HTMLImageElement>>;
  input: PredefinedFunction<React.InputHTMLAttributes<HTMLInputElement>>;
  ins: PredefinedFunction<React.InsHTMLAttributes<HTMLModElement>>;
  kbd: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  keygen: PredefinedFunction<React.KeygenHTMLAttributes<HTMLElement>>;
  label: PredefinedFunction<React.LabelHTMLAttributes<HTMLLabelElement>>;
  legend: PredefinedFunction<React.HTMLAttributes<HTMLLegendElement>>;
  li: PredefinedFunction<React.LiHTMLAttributes<HTMLLIElement>>;
  link: PredefinedFunction<React.LinkHTMLAttributes<HTMLLinkElement>>;
  main: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  map: PredefinedFunction<React.MapHTMLAttributes<HTMLMapElement>>;
  mark: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  menu: PredefinedFunction<React.MenuHTMLAttributes<HTMLElement>>;
  menuitem: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  meta: PredefinedFunction<React.MetaHTMLAttributes<HTMLMetaElement>>;
  meter: PredefinedFunction<React.MeterHTMLAttributes<HTMLElement>>;
  nav: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  noscript: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  object: PredefinedFunction<React.ObjectHTMLAttributes<HTMLObjectElement>>;
  ol: PredefinedFunction<React.OlHTMLAttributes<HTMLOListElement>>;
  optgroup: PredefinedFunction<React.OptgroupHTMLAttributes<HTMLOptGroupElement>>;
  option: PredefinedFunction<React.OptionHTMLAttributes<HTMLOptionElement>>;
  output: PredefinedFunction<React.OutputHTMLAttributes<HTMLElement>>;
  p: PredefinedFunction<React.HTMLAttributes<HTMLParagraphElement>>;
  param: PredefinedFunction<React.ParamHTMLAttributes<HTMLParamElement>>;
  picture: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  pre: PredefinedFunction<React.HTMLAttributes<HTMLPreElement>>;
  progress: PredefinedFunction<React.ProgressHTMLAttributes<HTMLProgressElement>>;
  q: PredefinedFunction<React.QuoteHTMLAttributes<HTMLQuoteElement>>;
  rp: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  rt: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  ruby: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  s: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  samp: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  script: PredefinedFunction<React.ScriptHTMLAttributes<HTMLScriptElement>>;
  section: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  select: PredefinedFunction<React.SelectHTMLAttributes<HTMLSelectElement>>;
  small: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  source: PredefinedFunction<React.SourceHTMLAttributes<HTMLSourceElement>>;
  span: PredefinedFunction<React.HTMLAttributes<HTMLSpanElement>>;
  strong: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  style: PredefinedFunction<React.StyleHTMLAttributes<HTMLStyleElement>>;
  sub: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  summary: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  sup: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  table: PredefinedFunction<React.TableHTMLAttributes<HTMLTableElement>>;
  tbody: PredefinedFunction<React.HTMLAttributes<HTMLTableSectionElement>>;
  td: PredefinedFunction<React.TdHTMLAttributes<HTMLTableDataCellElement>>;
  textarea: PredefinedFunction<React.TextareaHTMLAttributes<HTMLTextAreaElement>>;
  tfoot: PredefinedFunction<React.HTMLAttributes<HTMLTableSectionElement>>;
  th: PredefinedFunction<React.ThHTMLAttributes<HTMLTableHeaderCellElement>>;
  thead: PredefinedFunction<React.HTMLAttributes<HTMLTableSectionElement>>;
  time: PredefinedFunction<React.TimeHTMLAttributes<HTMLElement>>;
  title: PredefinedFunction<React.HTMLAttributes<HTMLTitleElement>>;
  tr: PredefinedFunction<React.HTMLAttributes<HTMLTableRowElement>>;
  track: PredefinedFunction<React.TrackHTMLAttributes<HTMLTrackElement>>;
  u: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  ul: PredefinedFunction<React.HTMLAttributes<HTMLUListElement>>;
  var: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  video: PredefinedFunction<React.VideoHTMLAttributes<HTMLVideoElement>>;
  wbr: PredefinedFunction<React.HTMLAttributes<HTMLElement>>;
  svg: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  animate: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  circle: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  defs: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  ellipse: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  g: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  image: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  line: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  linearGradient: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  mask: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  path: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  pattern: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  polygon: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  polyline: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  radialGradient: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  rect: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  stop: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  symbol: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  text: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  tspan: PredefinedFunction<React.SVGAttributes<SVGElement>>;
  use: PredefinedFunction<React.SVGAttributes<SVGElement>>;
}

const predefinedElements: Array<keyof PredefinedStyled> = [
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'big',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'keygen',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'menuitem',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
  'svg',
  'animate',
  'circle',
  'defs',
  'ellipse',
  'g',
  'image',
  'line',
  'linearGradient',
  'mask',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'stop',
  'symbol',
  'text',
  'tspan',
  'use',
];
