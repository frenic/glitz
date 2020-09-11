export type Style = Record<string, any>;

export type StaticComponent = ((props?: any) => StaticElement) & {
  styles: Style[];
  elementName: string;
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
