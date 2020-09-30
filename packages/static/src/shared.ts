export type Style = Record<string, any>;

export type Styles = Style | Style[] | StaticDecorator;

export type DirtyStyle = Style | StaticDecorator | DirtyStyle[] | false | undefined;

export type StaticDecorator = {
  decorator: true;
  (): Style[];
  (style: Styles): StaticDecorator;
  (component: StaticComponent | ReactFunctionComponent, style?: Styles): StaticComponent;
};

export type StaticStyled = {
  (...style: Styles[]): StaticDecorator;
  (component: StaticComponent | ReactFunctionComponent, ...styles: Styles[]): StaticComponent;
};

export type ReactFunctionComponent = (props?: any) => any;

export type StaticComponent = ((props?: any) => StaticElement) & {
  styles: Style[];
  elementName: string;
  displayName?: string;
};

export type StaticElement = {
  styles: Style[];
  elementName: string;
};

export function isStaticComponent(object: any): object is StaticComponent {
  return typeof object === 'function' && !!object.styles && !!object.elementName;
}

export function isStaticElement(object: any): object is StaticElement {
  return typeof object === 'object' && !!object.styles && !!object.elementName;
}
