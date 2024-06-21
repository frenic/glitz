export type Style = Record<string, any>;

export type Query = Record<string, any>;

export type Styles = Style | Style[] | StaticDecorator;

export type DirtyStyle = Style | StaticDecorator | DirtyStyle[] | false | undefined;

export type StaticElementName = string | { [propertyName: string]: any } /* ts.Node */;

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
  elementName: StaticElementName;
  displayName?: string;
};

export type StaticElement = {
  styles: Style[];
  elementName: StaticElementName;
};

export function isStaticDecorator(object: any): object is StaticDecorator {
  return object && typeof object === 'function' && !!object.decorator;
}

export function isStaticComponent(object: any): object is StaticComponent {
  return object && typeof object === 'function' && !!object.styles && !!object.elementName;
}

export function isStaticElement(object: any): object is StaticElement {
  return object && typeof object === 'object' && !!object.styles && !!object.elementName;
}

export function cleanStyle(styles: DirtyStyle[]): Style[] {
  return styles.reduce<Style[]>(
    (total, style) => [
      ...total,
      ...(typeof style === 'function'
        ? cleanStyle(style())
        : Array.isArray(style)
          ? cleanStyle(style)
          : style
            ? [style]
            : []),
    ],
    [],
  );
}
