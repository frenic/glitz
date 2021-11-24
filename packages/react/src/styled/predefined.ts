import {
  AnchorHTMLAttributes,
  AreaHTMLAttributes,
  AudioHTMLAttributes,
  BaseHTMLAttributes,
  BlockquoteHTMLAttributes,
  ButtonHTMLAttributes,
  CanvasHTMLAttributes,
  ColgroupHTMLAttributes,
  ColHTMLAttributes,
  DataHTMLAttributes,
  DelHTMLAttributes,
  DetailsHTMLAttributes,
  DialogHTMLAttributes,
  EmbedHTMLAttributes,
  FieldsetHTMLAttributes,
  FormHTMLAttributes,
  HTMLAttributes,
  HtmlHTMLAttributes,
  IframeHTMLAttributes,
  ImgHTMLAttributes,
  InputHTMLAttributes,
  InsHTMLAttributes,
  KeygenHTMLAttributes,
  LabelHTMLAttributes,
  LiHTMLAttributes,
  LinkHTMLAttributes,
  MapHTMLAttributes,
  MenuHTMLAttributes,
  MetaHTMLAttributes,
  MeterHTMLAttributes,
  ObjectHTMLAttributes,
  OlHTMLAttributes,
  OptgroupHTMLAttributes,
  OptionHTMLAttributes,
  OutputHTMLAttributes,
  ParamHTMLAttributes,
  ProgressHTMLAttributes,
  QuoteHTMLAttributes,
  ScriptHTMLAttributes,
  SelectHTMLAttributes,
  SlotHTMLAttributes,
  SourceHTMLAttributes,
  StyleHTMLAttributes,
  SVGAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  TextareaHTMLAttributes,
  ThHTMLAttributes,
  TimeHTMLAttributes,
  TrackHTMLAttributes,
  VideoHTMLAttributes,
  WebViewHTMLAttributes,
} from 'react';
import { factory, StyledComponentWithRef } from './create';
import { SECRET_GLITZ_PROPERTY, ELEMENT_TYPE, ELEMENT_LIKE_TYPE, FORWARD_STYLE_TYPE } from './constants';
import { Styles } from './custom';

export interface StyledType {
  [SECRET_GLITZ_PROPERTY]: typeof ELEMENT_TYPE | typeof ELEMENT_LIKE_TYPE | typeof FORWARD_STYLE_TYPE;
}

export interface StyledElement extends StyledType {
  [SECRET_GLITZ_PROPERTY]: typeof ELEMENT_TYPE;
  value: string;
}

function createElementType(tag: string): StyledElement {
  return {
    [SECRET_GLITZ_PROPERTY]: ELEMENT_TYPE,
    value: tag,
  };
}

export function isElementType(type: any): type is StyledElement {
  return type[SECRET_GLITZ_PROPERTY] === ELEMENT_TYPE;
}

function createPredefined(tag: string) {
  return (...styles: Styles[]) => factory(createElementType(tag), styles);
}

export function assignPredefined<TTarget>(target: TTarget) {
  for (const tag of predefinedElements) {
    (target as any)[tag[0].toUpperCase() + tag.slice(1)] = factory(createElementType(tag), []);
    (target as any)[tag] = createPredefined(tag);
  }
  return target as TTarget & StyledElementFunctions & StyledElementComponents;
}

const predefinedElements: (keyof StyledElementFunctions)[] = [
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
  'noindex',
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
  'slot',
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
  'template',
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
  'webview',
  'svg',
  'animate',
  'animateMotion',
  'animateTransform',
  'circle',
  'clipPath',
  'defs',
  'desc',
  'ellipse',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'filter',
  'foreignObject',
  'g',
  'image',
  'line',
  'linearGradient',
  'marker',
  'mask',
  'metadata',
  'mpath',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'stop',
  'switch',
  'symbol',
  'text',
  'textPath',
  'tspan',
  'use',
  'view',
];

export type StyledElementProps = {
  className?: string;
};

export type StyledFunction<TProps, TInstance> = (...styles: Styles[]) => StyledComponentWithRef<TProps, TInstance>;

export interface StyledElementComponents {
  // HTML
  A: StyledComponentWithRef<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
  Abbr: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Address: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Area: StyledComponentWithRef<AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
  Article: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Aside: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Audio: StyledComponentWithRef<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
  B: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Base: StyledComponentWithRef<BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
  Bdi: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Bdo: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Big: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Blockquote: StyledComponentWithRef<BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
  Body: StyledComponentWithRef<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
  Br: StyledComponentWithRef<HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
  Button: StyledComponentWithRef<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
  Canvas: StyledComponentWithRef<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
  Caption: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Cite: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Code: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Col: StyledComponentWithRef<ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  Colgroup: StyledComponentWithRef<ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  Data: StyledComponentWithRef<DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
  Datalist: StyledComponentWithRef<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
  Dd: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Del: StyledComponentWithRef<DelHTMLAttributes<HTMLElement>, HTMLElement>;
  Details: StyledComponentWithRef<DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
  Dfn: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Dialog: StyledComponentWithRef<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
  Div: StyledComponentWithRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  Dl: StyledComponentWithRef<HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
  Dt: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Em: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Embed: StyledComponentWithRef<EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
  Fieldset: StyledComponentWithRef<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
  Figcaption: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Figure: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Footer: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Form: StyledComponentWithRef<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
  H1: StyledComponentWithRef<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  H2: StyledComponentWithRef<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  H3: StyledComponentWithRef<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  H4: StyledComponentWithRef<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  H5: StyledComponentWithRef<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  H6: StyledComponentWithRef<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  Head: StyledComponentWithRef<HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
  Header: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Hgroup: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Hr: StyledComponentWithRef<HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
  Html: StyledComponentWithRef<HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
  I: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Iframe: StyledComponentWithRef<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
  Img: StyledComponentWithRef<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
  Input: StyledComponentWithRef<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  Ins: StyledComponentWithRef<InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
  Kbd: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Keygen: StyledComponentWithRef<KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
  Label: StyledComponentWithRef<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
  Legend: StyledComponentWithRef<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
  Li: StyledComponentWithRef<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
  Link: StyledComponentWithRef<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
  Main: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Map: StyledComponentWithRef<MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
  Mark: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Menu: StyledComponentWithRef<MenuHTMLAttributes<HTMLElement>, HTMLElement>;
  Menuitem: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Meta: StyledComponentWithRef<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
  Meter: StyledComponentWithRef<MeterHTMLAttributes<HTMLElement>, HTMLElement>;
  Nav: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Noindex: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Noscript: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Object: StyledComponentWithRef<ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
  Ol: StyledComponentWithRef<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
  Optgroup: StyledComponentWithRef<OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
  Option: StyledComponentWithRef<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
  Output: StyledComponentWithRef<OutputHTMLAttributes<HTMLElement>, HTMLElement>;
  P: StyledComponentWithRef<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
  Param: StyledComponentWithRef<ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
  Picture: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Pre: StyledComponentWithRef<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
  Progress: StyledComponentWithRef<ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
  Q: StyledComponentWithRef<QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
  Rp: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Rt: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Ruby: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  S: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Samp: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Script: StyledComponentWithRef<ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
  Section: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Select: StyledComponentWithRef<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
  Slot: StyledComponentWithRef<SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>;
  Small: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Source: StyledComponentWithRef<SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
  Span: StyledComponentWithRef<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  Strong: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Style: StyledComponentWithRef<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
  Sub: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Summary: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Sup: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Table: StyledComponentWithRef<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
  Tbody: StyledComponentWithRef<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  Td: StyledComponentWithRef<TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
  Template: StyledComponentWithRef<HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
  Textarea: StyledComponentWithRef<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
  Tfoot: StyledComponentWithRef<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  Th: StyledComponentWithRef<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
  Thead: StyledComponentWithRef<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  Time: StyledComponentWithRef<TimeHTMLAttributes<HTMLElement>, HTMLElement>;
  Title: StyledComponentWithRef<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
  Tr: StyledComponentWithRef<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
  Track: StyledComponentWithRef<TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
  U: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Ul: StyledComponentWithRef<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
  Var: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Video: StyledComponentWithRef<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
  Wbr: StyledComponentWithRef<HTMLAttributes<HTMLElement>, HTMLElement>;
  Webview: StyledComponentWithRef<WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;

  // SVG
  Svg: StyledComponentWithRef<SVGAttributes<SVGSVGElement>, SVGSVGElement>;

  Animate: StyledComponentWithRef<SVGAttributes<SVGAnimateElement>, SVGAnimateElement>;
  AnimateMotion: StyledComponentWithRef<SVGAttributes<SVGElement>, SVGElement>;
  AnimateTransform: StyledComponentWithRef<SVGAttributes<SVGAnimateTransformElement>, SVGAnimateTransformElement>;
  Circle: StyledComponentWithRef<SVGAttributes<SVGCircleElement>, SVGCircleElement>;
  ClipPath: StyledComponentWithRef<SVGAttributes<SVGClipPathElement>, SVGClipPathElement>;
  Defs: StyledComponentWithRef<SVGAttributes<SVGDefsElement>, SVGDefsElement>;
  Desc: StyledComponentWithRef<SVGAttributes<SVGDescElement>, SVGDescElement>;
  Ellipse: StyledComponentWithRef<SVGAttributes<SVGEllipseElement>, SVGEllipseElement>;
  FeBlend: StyledComponentWithRef<SVGAttributes<SVGFEBlendElement>, SVGFEBlendElement>;
  FeColorMatrix: StyledComponentWithRef<SVGAttributes<SVGFEColorMatrixElement>, SVGFEColorMatrixElement>;
  FeComponentTransfer: StyledComponentWithRef<
    SVGAttributes<SVGFEComponentTransferElement>,
    SVGFEComponentTransferElement
  >;
  FeComposite: StyledComponentWithRef<SVGAttributes<SVGFECompositeElement>, SVGFECompositeElement>;
  FeConvolveMatrix: StyledComponentWithRef<SVGAttributes<SVGFEConvolveMatrixElement>, SVGFEConvolveMatrixElement>;
  FeDiffuseLighting: StyledComponentWithRef<SVGAttributes<SVGFEDiffuseLightingElement>, SVGFEDiffuseLightingElement>;
  FeDisplacementMap: StyledComponentWithRef<SVGAttributes<SVGFEDisplacementMapElement>, SVGFEDisplacementMapElement>;
  FeDistantLight: StyledComponentWithRef<SVGAttributes<SVGFEDistantLightElement>, SVGFEDistantLightElement>;
  FeDropShadow: StyledComponentWithRef<SVGAttributes<SVGFEDropShadowElement>, SVGFEDropShadowElement>;
  FeFlood: StyledComponentWithRef<SVGAttributes<SVGFEFloodElement>, SVGFEFloodElement>;
  FeFuncA: StyledComponentWithRef<SVGAttributes<SVGFEFuncAElement>, SVGFEFuncAElement>;
  FeFuncB: StyledComponentWithRef<SVGAttributes<SVGFEFuncBElement>, SVGFEFuncBElement>;
  FeFuncG: StyledComponentWithRef<SVGAttributes<SVGFEFuncGElement>, SVGFEFuncGElement>;
  FeFuncR: StyledComponentWithRef<SVGAttributes<SVGFEFuncRElement>, SVGFEFuncRElement>;
  FeGaussianBlur: StyledComponentWithRef<SVGAttributes<SVGFEGaussianBlurElement>, SVGFEGaussianBlurElement>;
  FeImage: StyledComponentWithRef<SVGAttributes<SVGFEImageElement>, SVGFEImageElement>;
  FeMerge: StyledComponentWithRef<SVGAttributes<SVGFEMergeElement>, SVGFEMergeElement>;
  FeMergeNode: StyledComponentWithRef<SVGAttributes<SVGFEMergeNodeElement>, SVGFEMergeNodeElement>;
  FeMorphology: StyledComponentWithRef<SVGAttributes<SVGFEMorphologyElement>, SVGFEMorphologyElement>;
  FeOffset: StyledComponentWithRef<SVGAttributes<SVGFEOffsetElement>, SVGFEOffsetElement>;
  FePointLight: StyledComponentWithRef<SVGAttributes<SVGFEPointLightElement>, SVGFEPointLightElement>;
  FeSpecularLighting: StyledComponentWithRef<SVGAttributes<SVGFESpecularLightingElement>, SVGFESpecularLightingElement>;
  FeSpotLight: StyledComponentWithRef<SVGAttributes<SVGFESpotLightElement>, SVGFESpotLightElement>;
  FeTile: StyledComponentWithRef<SVGAttributes<SVGFETileElement>, SVGFETileElement>;
  FeTurbulence: StyledComponentWithRef<SVGAttributes<SVGFETurbulenceElement>, SVGFETurbulenceElement>;
  Filter: StyledComponentWithRef<SVGAttributes<SVGFilterElement>, SVGFilterElement>;
  ForeignObject: StyledComponentWithRef<SVGAttributes<SVGForeignObjectElement>, SVGForeignObjectElement>;
  G: StyledComponentWithRef<SVGAttributes<SVGGElement>, SVGGElement>;
  Image: StyledComponentWithRef<SVGAttributes<SVGImageElement>, SVGImageElement>;
  Line: StyledComponentWithRef<SVGAttributes<SVGLineElement>, SVGLineElement>;
  LinearGradient: StyledComponentWithRef<SVGAttributes<SVGLinearGradientElement>, SVGLinearGradientElement>;
  Marker: StyledComponentWithRef<SVGAttributes<SVGMarkerElement>, SVGMarkerElement>;
  Mask: StyledComponentWithRef<SVGAttributes<SVGMaskElement>, SVGMaskElement>;
  Metadata: StyledComponentWithRef<SVGAttributes<SVGMetadataElement>, SVGMetadataElement>;
  Mpath: StyledComponentWithRef<SVGAttributes<SVGElement>, SVGElement>;
  Path: StyledComponentWithRef<SVGAttributes<SVGPathElement>, SVGPathElement>;
  Pattern: StyledComponentWithRef<SVGAttributes<SVGPatternElement>, SVGPatternElement>;
  Polygon: StyledComponentWithRef<SVGAttributes<SVGPolygonElement>, SVGPolygonElement>;
  Polyline: StyledComponentWithRef<SVGAttributes<SVGPolylineElement>, SVGPolylineElement>;
  RadialGradient: StyledComponentWithRef<SVGAttributes<SVGRadialGradientElement>, SVGRadialGradientElement>;
  Rect: StyledComponentWithRef<SVGAttributes<SVGRectElement>, SVGRectElement>;
  Stop: StyledComponentWithRef<SVGAttributes<SVGStopElement>, SVGStopElement>;
  Switch: StyledComponentWithRef<SVGAttributes<SVGSwitchElement>, SVGSwitchElement>;
  Symbol: StyledComponentWithRef<SVGAttributes<SVGSymbolElement>, SVGSymbolElement>;
  Text: StyledComponentWithRef<SVGAttributes<SVGTextElement>, SVGTextElement>;
  TextPath: StyledComponentWithRef<SVGAttributes<SVGTextPathElement>, SVGTextPathElement>;
  Tspan: StyledComponentWithRef<SVGAttributes<SVGTSpanElement>, SVGTSpanElement>;
  Use: StyledComponentWithRef<SVGAttributes<SVGUseElement>, SVGUseElement>;
  View: StyledComponentWithRef<SVGAttributes<SVGViewElement>, SVGViewElement>;
}

export interface StyledElementFunctions {
  // HTML
  a: StyledFunction<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
  abbr: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  address: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  area: StyledFunction<AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
  article: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  aside: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  audio: StyledFunction<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
  b: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  base: StyledFunction<BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
  bdi: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  bdo: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  big: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  blockquote: StyledFunction<BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
  body: StyledFunction<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
  br: StyledFunction<HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
  button: StyledFunction<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
  canvas: StyledFunction<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
  caption: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  cite: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  code: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  col: StyledFunction<ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  colgroup: StyledFunction<ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  data: StyledFunction<DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
  datalist: StyledFunction<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
  dd: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  del: StyledFunction<DelHTMLAttributes<HTMLElement>, HTMLElement>;
  details: StyledFunction<DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
  dfn: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  dialog: StyledFunction<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
  div: StyledFunction<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  dl: StyledFunction<HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
  dt: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  em: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  embed: StyledFunction<EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
  fieldset: StyledFunction<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
  figcaption: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  figure: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  footer: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  form: StyledFunction<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
  h1: StyledFunction<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h2: StyledFunction<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h3: StyledFunction<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h4: StyledFunction<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h5: StyledFunction<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h6: StyledFunction<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  head: StyledFunction<HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
  header: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  hgroup: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  hr: StyledFunction<HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
  html: StyledFunction<HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
  i: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  iframe: StyledFunction<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
  img: StyledFunction<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
  input: StyledFunction<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  ins: StyledFunction<InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
  kbd: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  keygen: StyledFunction<KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
  label: StyledFunction<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
  legend: StyledFunction<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
  li: StyledFunction<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
  link: StyledFunction<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
  main: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  map: StyledFunction<MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
  mark: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  menu: StyledFunction<MenuHTMLAttributes<HTMLElement>, HTMLElement>;
  menuitem: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  meta: StyledFunction<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
  meter: StyledFunction<MeterHTMLAttributes<HTMLElement>, HTMLElement>;
  nav: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  noindex: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  noscript: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  object: StyledFunction<ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
  ol: StyledFunction<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
  optgroup: StyledFunction<OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
  option: StyledFunction<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
  output: StyledFunction<OutputHTMLAttributes<HTMLElement>, HTMLElement>;
  p: StyledFunction<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
  param: StyledFunction<ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
  picture: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  pre: StyledFunction<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
  progress: StyledFunction<ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
  q: StyledFunction<QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
  rp: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  rt: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  ruby: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  s: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  samp: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  script: StyledFunction<ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
  section: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  select: StyledFunction<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
  slot: StyledFunction<SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>;
  small: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  source: StyledFunction<SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
  span: StyledFunction<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  strong: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  style: StyledFunction<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
  sub: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  summary: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  sup: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  table: StyledFunction<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
  tbody: StyledFunction<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  td: StyledFunction<TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
  template: StyledFunction<HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
  textarea: StyledFunction<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
  tfoot: StyledFunction<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  th: StyledFunction<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
  thead: StyledFunction<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  time: StyledFunction<TimeHTMLAttributes<HTMLElement>, HTMLElement>;
  title: StyledFunction<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
  tr: StyledFunction<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
  track: StyledFunction<TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
  u: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  ul: StyledFunction<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
  var: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  video: StyledFunction<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
  wbr: StyledFunction<HTMLAttributes<HTMLElement>, HTMLElement>;
  webview: StyledFunction<WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;

  // SVG
  svg: StyledFunction<SVGAttributes<SVGSVGElement>, SVGSVGElement>;

  animate: StyledFunction<SVGAttributes<SVGAnimateElement>, SVGAnimateElement>;
  animateMotion: StyledFunction<SVGAttributes<SVGElement>, SVGElement>;
  animateTransform: StyledFunction<SVGAttributes<SVGAnimateTransformElement>, SVGAnimateTransformElement>;
  circle: StyledFunction<SVGAttributes<SVGCircleElement>, SVGCircleElement>;
  clipPath: StyledFunction<SVGAttributes<SVGClipPathElement>, SVGClipPathElement>;
  defs: StyledFunction<SVGAttributes<SVGDefsElement>, SVGDefsElement>;
  desc: StyledFunction<SVGAttributes<SVGDescElement>, SVGDescElement>;
  ellipse: StyledFunction<SVGAttributes<SVGEllipseElement>, SVGEllipseElement>;
  feBlend: StyledFunction<SVGAttributes<SVGFEBlendElement>, SVGFEBlendElement>;
  feColorMatrix: StyledFunction<SVGAttributes<SVGFEColorMatrixElement>, SVGFEColorMatrixElement>;
  feComponentTransfer: StyledFunction<SVGAttributes<SVGFEComponentTransferElement>, SVGFEComponentTransferElement>;
  feComposite: StyledFunction<SVGAttributes<SVGFECompositeElement>, SVGFECompositeElement>;
  feConvolveMatrix: StyledFunction<SVGAttributes<SVGFEConvolveMatrixElement>, SVGFEConvolveMatrixElement>;
  feDiffuseLighting: StyledFunction<SVGAttributes<SVGFEDiffuseLightingElement>, SVGFEDiffuseLightingElement>;
  feDisplacementMap: StyledFunction<SVGAttributes<SVGFEDisplacementMapElement>, SVGFEDisplacementMapElement>;
  feDistantLight: StyledFunction<SVGAttributes<SVGFEDistantLightElement>, SVGFEDistantLightElement>;
  feDropShadow: StyledFunction<SVGAttributes<SVGFEDropShadowElement>, SVGFEDropShadowElement>;
  feFlood: StyledFunction<SVGAttributes<SVGFEFloodElement>, SVGFEFloodElement>;
  feFuncA: StyledFunction<SVGAttributes<SVGFEFuncAElement>, SVGFEFuncAElement>;
  feFuncB: StyledFunction<SVGAttributes<SVGFEFuncBElement>, SVGFEFuncBElement>;
  feFuncG: StyledFunction<SVGAttributes<SVGFEFuncGElement>, SVGFEFuncGElement>;
  feFuncR: StyledFunction<SVGAttributes<SVGFEFuncRElement>, SVGFEFuncRElement>;
  feGaussianBlur: StyledFunction<SVGAttributes<SVGFEGaussianBlurElement>, SVGFEGaussianBlurElement>;
  feImage: StyledFunction<SVGAttributes<SVGFEImageElement>, SVGFEImageElement>;
  feMerge: StyledFunction<SVGAttributes<SVGFEMergeElement>, SVGFEMergeElement>;
  feMergeNode: StyledFunction<SVGAttributes<SVGFEMergeNodeElement>, SVGFEMergeNodeElement>;
  feMorphology: StyledFunction<SVGAttributes<SVGFEMorphologyElement>, SVGFEMorphologyElement>;
  feOffset: StyledFunction<SVGAttributes<SVGFEOffsetElement>, SVGFEOffsetElement>;
  fePointLight: StyledFunction<SVGAttributes<SVGFEPointLightElement>, SVGFEPointLightElement>;
  feSpecularLighting: StyledFunction<SVGAttributes<SVGFESpecularLightingElement>, SVGFESpecularLightingElement>;
  feSpotLight: StyledFunction<SVGAttributes<SVGFESpotLightElement>, SVGFESpotLightElement>;
  feTile: StyledFunction<SVGAttributes<SVGFETileElement>, SVGFETileElement>;
  feTurbulence: StyledFunction<SVGAttributes<SVGFETurbulenceElement>, SVGFETurbulenceElement>;
  filter: StyledFunction<SVGAttributes<SVGFilterElement>, SVGFilterElement>;
  foreignObject: StyledFunction<SVGAttributes<SVGForeignObjectElement>, SVGForeignObjectElement>;
  g: StyledFunction<SVGAttributes<SVGGElement>, SVGGElement>;
  image: StyledFunction<SVGAttributes<SVGImageElement>, SVGImageElement>;
  line: StyledFunction<SVGAttributes<SVGLineElement>, SVGLineElement>;
  linearGradient: StyledFunction<SVGAttributes<SVGLinearGradientElement>, SVGLinearGradientElement>;
  marker: StyledFunction<SVGAttributes<SVGMarkerElement>, SVGMarkerElement>;
  mask: StyledFunction<SVGAttributes<SVGMaskElement>, SVGMaskElement>;
  metadata: StyledFunction<SVGAttributes<SVGMetadataElement>, SVGMetadataElement>;
  mpath: StyledFunction<SVGAttributes<SVGElement>, SVGElement>;
  path: StyledFunction<SVGAttributes<SVGPathElement>, SVGPathElement>;
  pattern: StyledFunction<SVGAttributes<SVGPatternElement>, SVGPatternElement>;
  polygon: StyledFunction<SVGAttributes<SVGPolygonElement>, SVGPolygonElement>;
  polyline: StyledFunction<SVGAttributes<SVGPolylineElement>, SVGPolylineElement>;
  radialGradient: StyledFunction<SVGAttributes<SVGRadialGradientElement>, SVGRadialGradientElement>;
  rect: StyledFunction<SVGAttributes<SVGRectElement>, SVGRectElement>;
  stop: StyledFunction<SVGAttributes<SVGStopElement>, SVGStopElement>;
  switch: StyledFunction<SVGAttributes<SVGSwitchElement>, SVGSwitchElement>;
  symbol: StyledFunction<SVGAttributes<SVGSymbolElement>, SVGSymbolElement>;
  text: StyledFunction<SVGAttributes<SVGTextElement>, SVGTextElement>;
  textPath: StyledFunction<SVGAttributes<SVGTextPathElement>, SVGTextPathElement>;
  tspan: StyledFunction<SVGAttributes<SVGTSpanElement>, SVGTSpanElement>;
  use: StyledFunction<SVGAttributes<SVGUseElement>, SVGUseElement>;
  view: StyledFunction<SVGAttributes<SVGViewElement>, SVGViewElement>;
}
