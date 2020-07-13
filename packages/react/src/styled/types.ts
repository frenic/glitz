import { Style } from '@glitz/type';
import * as React from 'react';
import { SECRET_COMPOSE } from './constants';
import { ExternalProps, WithRefProp } from './create';
import { StyledDecorator } from './decorator';

// To provide proper type errors for `Style` we create an interface of `Style[]`
// and makes sure it's first in order
// export interface StyleArray extends Array<Style> {}
// export type StyleOrStyleArray = StyleArray | Style;

export type StyledProps = {
  compose: (style?: StyledDecorator | Style[] | Style) => Style | Style[];
};

export type StyledElementProps = {
  className?: string;
};

export interface StyledComponent<TProps> extends React.ForwardRefExoticComponent<ExternalProps<TProps>> {
  [SECRET_COMPOSE](style?: Style[]): StyledComponent<TProps>;
}

export interface StyledComponentWithRef<TProps, TInstance>
  extends React.ForwardRefExoticComponent<WithRefProp<ExternalProps<TProps>, TInstance>> {
  [SECRET_COMPOSE](style?: Style[]): StyledComponentWithRef<TProps, TInstance>;
}

export type StyledFunction<TProps, TInstance> = (style: Style) => StyledComponentWithRef<TProps, TInstance>;

export interface StyledElementComponents {
  // HTML
  A: StyledComponentWithRef<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
  Abbr: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Address: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Area: StyledComponentWithRef<React.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
  Article: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Aside: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Audio: StyledComponentWithRef<React.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
  B: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Base: StyledComponentWithRef<React.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
  Bdi: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Bdo: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Big: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Blockquote: StyledComponentWithRef<React.BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
  Body: StyledComponentWithRef<React.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
  Br: StyledComponentWithRef<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
  Button: StyledComponentWithRef<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
  Canvas: StyledComponentWithRef<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
  Caption: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Cite: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Code: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Col: StyledComponentWithRef<React.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  Colgroup: StyledComponentWithRef<React.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  Data: StyledComponentWithRef<React.DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
  Datalist: StyledComponentWithRef<React.HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
  Dd: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Del: StyledComponentWithRef<React.DelHTMLAttributes<HTMLElement>, HTMLElement>;
  Details: StyledComponentWithRef<React.DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
  Dfn: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Dialog: StyledComponentWithRef<React.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
  Div: StyledComponentWithRef<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  Dl: StyledComponentWithRef<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
  Dt: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Em: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Embed: StyledComponentWithRef<React.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
  Fieldset: StyledComponentWithRef<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
  Figcaption: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Figure: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Footer: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Form: StyledComponentWithRef<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
  H1: StyledComponentWithRef<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  H2: StyledComponentWithRef<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  H3: StyledComponentWithRef<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  H4: StyledComponentWithRef<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  H5: StyledComponentWithRef<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  H6: StyledComponentWithRef<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  Head: StyledComponentWithRef<React.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
  Header: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Hgroup: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Hr: StyledComponentWithRef<React.HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
  Html: StyledComponentWithRef<React.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
  I: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Iframe: StyledComponentWithRef<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
  Img: StyledComponentWithRef<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
  Input: StyledComponentWithRef<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  Ins: StyledComponentWithRef<React.InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
  Kbd: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Keygen: StyledComponentWithRef<React.KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
  Label: StyledComponentWithRef<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
  Legend: StyledComponentWithRef<React.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
  Li: StyledComponentWithRef<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
  Link: StyledComponentWithRef<React.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
  Main: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Map: StyledComponentWithRef<React.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
  Mark: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Menu: StyledComponentWithRef<React.MenuHTMLAttributes<HTMLElement>, HTMLElement>;
  Menuitem: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Meta: StyledComponentWithRef<React.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
  Meter: StyledComponentWithRef<React.MeterHTMLAttributes<HTMLElement>, HTMLElement>;
  Nav: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Noindex: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Noscript: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Object: StyledComponentWithRef<React.ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
  Ol: StyledComponentWithRef<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
  Optgroup: StyledComponentWithRef<React.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
  Option: StyledComponentWithRef<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
  Output: StyledComponentWithRef<React.OutputHTMLAttributes<HTMLElement>, HTMLElement>;
  P: StyledComponentWithRef<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
  Param: StyledComponentWithRef<React.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
  Picture: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Pre: StyledComponentWithRef<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
  Progress: StyledComponentWithRef<React.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
  Q: StyledComponentWithRef<React.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
  Rp: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Rt: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Ruby: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  S: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Samp: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Script: StyledComponentWithRef<React.ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
  Section: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Select: StyledComponentWithRef<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
  Small: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Source: StyledComponentWithRef<React.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
  Span: StyledComponentWithRef<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  Strong: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Style: StyledComponentWithRef<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
  Sub: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Summary: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Sup: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Table: StyledComponentWithRef<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
  Template: StyledComponentWithRef<React.HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
  Tbody: StyledComponentWithRef<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  Td: StyledComponentWithRef<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
  Textarea: StyledComponentWithRef<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
  Tfoot: StyledComponentWithRef<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  Th: StyledComponentWithRef<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
  Thead: StyledComponentWithRef<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  Time: StyledComponentWithRef<React.TimeHTMLAttributes<HTMLElement>, HTMLElement>;
  Title: StyledComponentWithRef<React.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
  Tr: StyledComponentWithRef<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
  Track: StyledComponentWithRef<React.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
  U: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Ul: StyledComponentWithRef<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
  Var: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Video: StyledComponentWithRef<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
  Wbr: StyledComponentWithRef<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  Webview: StyledComponentWithRef<React.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;

  // SVG
  Svg: StyledComponentWithRef<React.SVGAttributes<SVGSVGElement>, SVGSVGElement>;

  Animate: StyledComponentWithRef<React.SVGAttributes<SVGElement>, SVGElement>; // TODO: It is SVGAnimateElement but is not in TypeScript's lib.dom.d.ts for now.
  AnimateMotion: StyledComponentWithRef<React.SVGAttributes<SVGElement>, SVGElement>;
  AnimateTransform: StyledComponentWithRef<React.SVGAttributes<SVGElement>, SVGElement>; // TODO: It is SVGAnimateTransformElement but is not in TypeScript's lib.dom.d.ts for now.
  Circle: StyledComponentWithRef<React.SVGAttributes<SVGCircleElement>, SVGCircleElement>;
  ClipPath: StyledComponentWithRef<React.SVGAttributes<SVGClipPathElement>, SVGClipPathElement>;
  Defs: StyledComponentWithRef<React.SVGAttributes<SVGDefsElement>, SVGDefsElement>;
  Desc: StyledComponentWithRef<React.SVGAttributes<SVGDescElement>, SVGDescElement>;
  Ellipse: StyledComponentWithRef<React.SVGAttributes<SVGEllipseElement>, SVGEllipseElement>;
  FeBlend: StyledComponentWithRef<React.SVGAttributes<SVGFEBlendElement>, SVGFEBlendElement>;
  FeColorMatrix: StyledComponentWithRef<React.SVGAttributes<SVGFEColorMatrixElement>, SVGFEColorMatrixElement>;
  FeComponentTransfer: StyledComponentWithRef<
    React.SVGAttributes<SVGFEComponentTransferElement>,
    SVGFEComponentTransferElement
  >;
  FeComposite: StyledComponentWithRef<React.SVGAttributes<SVGFECompositeElement>, SVGFECompositeElement>;
  FeConvolveMatrix: StyledComponentWithRef<React.SVGAttributes<SVGFEConvolveMatrixElement>, SVGFEConvolveMatrixElement>;
  FeDiffuseLighting: StyledComponentWithRef<
    React.SVGAttributes<SVGFEDiffuseLightingElement>,
    SVGFEDiffuseLightingElement
  >;
  FeDisplacementMap: StyledComponentWithRef<
    React.SVGAttributes<SVGFEDisplacementMapElement>,
    SVGFEDisplacementMapElement
  >;
  FeDistantLight: StyledComponentWithRef<React.SVGAttributes<SVGFEDistantLightElement>, SVGFEDistantLightElement>;
  FeDropShadow: StyledComponentWithRef<React.SVGAttributes<SVGFEDropShadowElement>, SVGFEDropShadowElement>;
  FeFlood: StyledComponentWithRef<React.SVGAttributes<SVGFEFloodElement>, SVGFEFloodElement>;
  FeFuncA: StyledComponentWithRef<React.SVGAttributes<SVGFEFuncAElement>, SVGFEFuncAElement>;
  FeFuncB: StyledComponentWithRef<React.SVGAttributes<SVGFEFuncBElement>, SVGFEFuncBElement>;
  FeFuncG: StyledComponentWithRef<React.SVGAttributes<SVGFEFuncGElement>, SVGFEFuncGElement>;
  FeFuncR: StyledComponentWithRef<React.SVGAttributes<SVGFEFuncRElement>, SVGFEFuncRElement>;
  FeGaussianBlur: StyledComponentWithRef<React.SVGAttributes<SVGFEGaussianBlurElement>, SVGFEGaussianBlurElement>;
  FeImage: StyledComponentWithRef<React.SVGAttributes<SVGFEImageElement>, SVGFEImageElement>;
  FeMerge: StyledComponentWithRef<React.SVGAttributes<SVGFEMergeElement>, SVGFEMergeElement>;
  FeMergeNode: StyledComponentWithRef<React.SVGAttributes<SVGFEMergeNodeElement>, SVGFEMergeNodeElement>;
  FeMorphology: StyledComponentWithRef<React.SVGAttributes<SVGFEMorphologyElement>, SVGFEMorphologyElement>;
  FeOffset: StyledComponentWithRef<React.SVGAttributes<SVGFEOffsetElement>, SVGFEOffsetElement>;
  FePointLight: StyledComponentWithRef<React.SVGAttributes<SVGFEPointLightElement>, SVGFEPointLightElement>;
  FeSpecularLighting: StyledComponentWithRef<
    React.SVGAttributes<SVGFESpecularLightingElement>,
    SVGFESpecularLightingElement
  >;
  FeSpotLight: StyledComponentWithRef<React.SVGAttributes<SVGFESpotLightElement>, SVGFESpotLightElement>;
  FeTile: StyledComponentWithRef<React.SVGAttributes<SVGFETileElement>, SVGFETileElement>;
  FeTurbulence: StyledComponentWithRef<React.SVGAttributes<SVGFETurbulenceElement>, SVGFETurbulenceElement>;
  Filter: StyledComponentWithRef<React.SVGAttributes<SVGFilterElement>, SVGFilterElement>;
  ForeignObject: StyledComponentWithRef<React.SVGAttributes<SVGForeignObjectElement>, SVGForeignObjectElement>;
  G: StyledComponentWithRef<React.SVGAttributes<SVGGElement>, SVGGElement>;
  Image: StyledComponentWithRef<React.SVGAttributes<SVGImageElement>, SVGImageElement>;
  Line: StyledComponentWithRef<React.SVGAttributes<SVGLineElement>, SVGLineElement>;
  LinearGradient: StyledComponentWithRef<React.SVGAttributes<SVGLinearGradientElement>, SVGLinearGradientElement>;
  Marker: StyledComponentWithRef<React.SVGAttributes<SVGMarkerElement>, SVGMarkerElement>;
  Mask: StyledComponentWithRef<React.SVGAttributes<SVGMaskElement>, SVGMaskElement>;
  Metadata: StyledComponentWithRef<React.SVGAttributes<SVGMetadataElement>, SVGMetadataElement>;
  Mpath: StyledComponentWithRef<React.SVGAttributes<SVGElement>, SVGElement>;
  Path: StyledComponentWithRef<React.SVGAttributes<SVGPathElement>, SVGPathElement>;
  Pattern: StyledComponentWithRef<React.SVGAttributes<SVGPatternElement>, SVGPatternElement>;
  Polygon: StyledComponentWithRef<React.SVGAttributes<SVGPolygonElement>, SVGPolygonElement>;
  Polyline: StyledComponentWithRef<React.SVGAttributes<SVGPolylineElement>, SVGPolylineElement>;
  RadialGradient: StyledComponentWithRef<React.SVGAttributes<SVGRadialGradientElement>, SVGRadialGradientElement>;
  Rect: StyledComponentWithRef<React.SVGAttributes<SVGRectElement>, SVGRectElement>;
  Stop: StyledComponentWithRef<React.SVGAttributes<SVGStopElement>, SVGStopElement>;
  Switch: StyledComponentWithRef<React.SVGAttributes<SVGSwitchElement>, SVGSwitchElement>;
  Symbol: StyledComponentWithRef<React.SVGAttributes<SVGSymbolElement>, SVGSymbolElement>;
  Text: StyledComponentWithRef<React.SVGAttributes<SVGTextElement>, SVGTextElement>;
  TextPath: StyledComponentWithRef<React.SVGAttributes<SVGTextPathElement>, SVGTextPathElement>;
  Tspan: StyledComponentWithRef<React.SVGAttributes<SVGTSpanElement>, SVGTSpanElement>;
  Use: StyledComponentWithRef<React.SVGAttributes<SVGUseElement>, SVGUseElement>;
  View: StyledComponentWithRef<React.SVGAttributes<SVGViewElement>, SVGViewElement>;
}

export interface StyledElementFunctions {
  // HTML
  a: StyledFunction<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
  abbr: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  address: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  area: StyledFunction<React.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
  article: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  aside: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  audio: StyledFunction<React.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
  b: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  base: StyledFunction<React.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
  bdi: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  bdo: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  big: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  blockquote: StyledFunction<React.BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
  body: StyledFunction<React.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
  br: StyledFunction<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
  button: StyledFunction<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
  canvas: StyledFunction<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
  caption: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  cite: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  code: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  col: StyledFunction<React.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  colgroup: StyledFunction<React.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  data: StyledFunction<React.DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
  datalist: StyledFunction<React.HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
  dd: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  del: StyledFunction<React.DelHTMLAttributes<HTMLElement>, HTMLElement>;
  details: StyledFunction<React.DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
  dfn: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  dialog: StyledFunction<React.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
  div: StyledFunction<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  dl: StyledFunction<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
  dt: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  em: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  embed: StyledFunction<React.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
  fieldset: StyledFunction<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
  figcaption: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  figure: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  footer: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  form: StyledFunction<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
  h1: StyledFunction<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h2: StyledFunction<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h3: StyledFunction<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h4: StyledFunction<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h5: StyledFunction<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h6: StyledFunction<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  head: StyledFunction<React.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
  header: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  hgroup: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  hr: StyledFunction<React.HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
  html: StyledFunction<React.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
  i: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  iframe: StyledFunction<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
  img: StyledFunction<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
  input: StyledFunction<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  ins: StyledFunction<React.InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
  kbd: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  keygen: StyledFunction<React.KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
  label: StyledFunction<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
  legend: StyledFunction<React.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
  li: StyledFunction<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
  link: StyledFunction<React.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
  main: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  map: StyledFunction<React.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
  mark: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  menu: StyledFunction<React.MenuHTMLAttributes<HTMLElement>, HTMLElement>;
  menuitem: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  meta: StyledFunction<React.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
  meter: StyledFunction<React.MeterHTMLAttributes<HTMLElement>, HTMLElement>;
  nav: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  noindex: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  noscript: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  object: StyledFunction<React.ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
  ol: StyledFunction<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
  optgroup: StyledFunction<React.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
  option: StyledFunction<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
  output: StyledFunction<React.OutputHTMLAttributes<HTMLElement>, HTMLElement>;
  p: StyledFunction<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
  param: StyledFunction<React.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
  picture: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  pre: StyledFunction<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
  progress: StyledFunction<React.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
  q: StyledFunction<React.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
  rp: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  rt: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  ruby: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  s: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  samp: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  script: StyledFunction<React.ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
  section: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  select: StyledFunction<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
  small: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  source: StyledFunction<React.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
  span: StyledFunction<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  strong: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  style: StyledFunction<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
  sub: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  summary: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  sup: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  table: StyledFunction<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
  template: StyledFunction<React.HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
  tbody: StyledFunction<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  td: StyledFunction<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
  textarea: StyledFunction<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
  tfoot: StyledFunction<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  th: StyledFunction<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
  thead: StyledFunction<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  time: StyledFunction<React.TimeHTMLAttributes<HTMLElement>, HTMLElement>;
  title: StyledFunction<React.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
  tr: StyledFunction<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
  track: StyledFunction<React.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
  u: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  ul: StyledFunction<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
  var: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  video: StyledFunction<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
  wbr: StyledFunction<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  webview: StyledFunction<React.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;

  // SVG
  svg: StyledFunction<React.SVGAttributes<SVGSVGElement>, SVGSVGElement>;

  animate: StyledFunction<React.SVGAttributes<SVGElement>, SVGElement>; // TODO: It is SVGAnimateElement but is not in TypeScript's lib.dom.d.ts for now.
  animateMotion: StyledFunction<React.SVGAttributes<SVGElement>, SVGElement>;
  animateTransform: StyledFunction<React.SVGAttributes<SVGElement>, SVGElement>; // TODO: It is SVGAnimateTransformElement but is not in TypeScript's lib.dom.d.ts for now.
  circle: StyledFunction<React.SVGAttributes<SVGCircleElement>, SVGCircleElement>;
  clipPath: StyledFunction<React.SVGAttributes<SVGClipPathElement>, SVGClipPathElement>;
  defs: StyledFunction<React.SVGAttributes<SVGDefsElement>, SVGDefsElement>;
  desc: StyledFunction<React.SVGAttributes<SVGDescElement>, SVGDescElement>;
  ellipse: StyledFunction<React.SVGAttributes<SVGEllipseElement>, SVGEllipseElement>;
  feBlend: StyledFunction<React.SVGAttributes<SVGFEBlendElement>, SVGFEBlendElement>;
  feColorMatrix: StyledFunction<React.SVGAttributes<SVGFEColorMatrixElement>, SVGFEColorMatrixElement>;
  feComponentTransfer: StyledFunction<
    React.SVGAttributes<SVGFEComponentTransferElement>,
    SVGFEComponentTransferElement
  >;
  feComposite: StyledFunction<React.SVGAttributes<SVGFECompositeElement>, SVGFECompositeElement>;
  feConvolveMatrix: StyledFunction<React.SVGAttributes<SVGFEConvolveMatrixElement>, SVGFEConvolveMatrixElement>;
  feDiffuseLighting: StyledFunction<React.SVGAttributes<SVGFEDiffuseLightingElement>, SVGFEDiffuseLightingElement>;
  feDisplacementMap: StyledFunction<React.SVGAttributes<SVGFEDisplacementMapElement>, SVGFEDisplacementMapElement>;
  feDistantLight: StyledFunction<React.SVGAttributes<SVGFEDistantLightElement>, SVGFEDistantLightElement>;
  feDropShadow: StyledFunction<React.SVGAttributes<SVGFEDropShadowElement>, SVGFEDropShadowElement>;
  feFlood: StyledFunction<React.SVGAttributes<SVGFEFloodElement>, SVGFEFloodElement>;
  feFuncA: StyledFunction<React.SVGAttributes<SVGFEFuncAElement>, SVGFEFuncAElement>;
  feFuncB: StyledFunction<React.SVGAttributes<SVGFEFuncBElement>, SVGFEFuncBElement>;
  feFuncG: StyledFunction<React.SVGAttributes<SVGFEFuncGElement>, SVGFEFuncGElement>;
  feFuncR: StyledFunction<React.SVGAttributes<SVGFEFuncRElement>, SVGFEFuncRElement>;
  feGaussianBlur: StyledFunction<React.SVGAttributes<SVGFEGaussianBlurElement>, SVGFEGaussianBlurElement>;
  feImage: StyledFunction<React.SVGAttributes<SVGFEImageElement>, SVGFEImageElement>;
  feMerge: StyledFunction<React.SVGAttributes<SVGFEMergeElement>, SVGFEMergeElement>;
  feMergeNode: StyledFunction<React.SVGAttributes<SVGFEMergeNodeElement>, SVGFEMergeNodeElement>;
  feMorphology: StyledFunction<React.SVGAttributes<SVGFEMorphologyElement>, SVGFEMorphologyElement>;
  feOffset: StyledFunction<React.SVGAttributes<SVGFEOffsetElement>, SVGFEOffsetElement>;
  fePointLight: StyledFunction<React.SVGAttributes<SVGFEPointLightElement>, SVGFEPointLightElement>;
  feSpecularLighting: StyledFunction<React.SVGAttributes<SVGFESpecularLightingElement>, SVGFESpecularLightingElement>;
  feSpotLight: StyledFunction<React.SVGAttributes<SVGFESpotLightElement>, SVGFESpotLightElement>;
  feTile: StyledFunction<React.SVGAttributes<SVGFETileElement>, SVGFETileElement>;
  feTurbulence: StyledFunction<React.SVGAttributes<SVGFETurbulenceElement>, SVGFETurbulenceElement>;
  filter: StyledFunction<React.SVGAttributes<SVGFilterElement>, SVGFilterElement>;
  foreignObject: StyledFunction<React.SVGAttributes<SVGForeignObjectElement>, SVGForeignObjectElement>;
  g: StyledFunction<React.SVGAttributes<SVGGElement>, SVGGElement>;
  image: StyledFunction<React.SVGAttributes<SVGImageElement>, SVGImageElement>;
  line: StyledFunction<React.SVGAttributes<SVGLineElement>, SVGLineElement>;
  linearGradient: StyledFunction<React.SVGAttributes<SVGLinearGradientElement>, SVGLinearGradientElement>;
  marker: StyledFunction<React.SVGAttributes<SVGMarkerElement>, SVGMarkerElement>;
  mask: StyledFunction<React.SVGAttributes<SVGMaskElement>, SVGMaskElement>;
  metadata: StyledFunction<React.SVGAttributes<SVGMetadataElement>, SVGMetadataElement>;
  mpath: StyledFunction<React.SVGAttributes<SVGElement>, SVGElement>;
  path: StyledFunction<React.SVGAttributes<SVGPathElement>, SVGPathElement>;
  pattern: StyledFunction<React.SVGAttributes<SVGPatternElement>, SVGPatternElement>;
  polygon: StyledFunction<React.SVGAttributes<SVGPolygonElement>, SVGPolygonElement>;
  polyline: StyledFunction<React.SVGAttributes<SVGPolylineElement>, SVGPolylineElement>;
  radialGradient: StyledFunction<React.SVGAttributes<SVGRadialGradientElement>, SVGRadialGradientElement>;
  rect: StyledFunction<React.SVGAttributes<SVGRectElement>, SVGRectElement>;
  stop: StyledFunction<React.SVGAttributes<SVGStopElement>, SVGStopElement>;
  switch: StyledFunction<React.SVGAttributes<SVGSwitchElement>, SVGSwitchElement>;
  symbol: StyledFunction<React.SVGAttributes<SVGSymbolElement>, SVGSymbolElement>;
  text: StyledFunction<React.SVGAttributes<SVGTextElement>, SVGTextElement>;
  textPath: StyledFunction<React.SVGAttributes<SVGTextPathElement>, SVGTextPathElement>;
  tspan: StyledFunction<React.SVGAttributes<SVGTSpanElement>, SVGTSpanElement>;
  use: StyledFunction<React.SVGAttributes<SVGUseElement>, SVGUseElement>;
  view: StyledFunction<React.SVGAttributes<SVGViewElement>, SVGViewElement>;
}
