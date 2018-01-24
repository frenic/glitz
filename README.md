# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

A fast, lightweight *(~1.7KB gz)* and type safe way of styling by the CSS-in-JS concept using Atomic CSS.

Features supported:
- [Pseudo selectors/elements](#pseudo)
- [Keyframes](#keyframes)
- [Fallback values](#fallback-values)
- [Media queries](#media-queries)
- [Auto-prefixing](#prefixer)
- [Server rendering](#server-rendering)

The most basic implementation is really easy. You don't need any config or module loaders to get started.

```ts
import GlitzClient from '@glitz/core';
const glitz = new GlitzClient();

const className = glitz.injectStyle({
  color: 'green',
});
```

At this moment, there's officially only [React bindings](https://github.com/frenic/glitz/blob/master/packages/react/) available.

## Getting started

```bash
$ yarn add @glitz/core

// or

$ npm install @glitz/core
```

## Features

### Pseudo

You define your pseudo selector or element as the property name, followed with the style you wish to have for that pseudo.

```ts
const className = glitz.injectStyle({
  ':hover': {
    textDecoration: 'underline',
    // You're also able to nest
    ':after': {
      content: '"Don\'t forget double quotes when doing this"',
    },
  },
});
```

### Keyframes

The `@keyframes` property injects the list of declaration blocks into a unique 'animation-name'.

```ts
const className = glitz.injectStyle({
  '@keyframes': {
    from: {
      color: 'red',
    },
    to: {
      color: 'green',
    },
  },
  // Will be transformed into: `{ animationName: 'a' }`
});
```

The name will be reused when an identical `@keyframes` will be used again. 

### Fallback values

An array of values will be injected as one rule.

```ts
const className = glitz.injectStyle({
  'display': [
    '-webkit-flex',
    'flex',
  ],
  // Will be injected as:
  // .a {
  //   display: -webkit-flex;
  //   display: flex;
  // }
});
```

### Media queries

You can define any `@media` property as you like. However, it won't be defined by default if you use TypeScript. You simply need to [add custom properties](#add-custom-properties) to the type definition. 

```ts
const className = glitz.injectStyle({
  '@media (min-width: 768px)': {
    display: 'block',
  }
});
```

## Server rendering

The difference between `GlitzServer` class and `GlitzClient` class is that `GlitzServer` wont insert the rules into the DOM. Instead you pull it out the style sheets as a string and put it in the `<head>`. On client side, the style sheets will be hydrated and used by `GlitzClient`.

- [API reference](#glitzserver)
- [Example implementation](https://github.com/frenic/glitz/blob/master/packages/react/#server-rendering)

## Types

You don't need TypeScript to use Glitz. But if you do, everything is typed! Even CSS! This means you'll get autocompletion and warnings as you write.

```ts
const className = glitz.injectStyle({
  display: 'flez', // Type error on value
  colour: 'white', // Type error on property
});
```

### Add custom properties

Unknown properties will fail to be able to notify you when there's a typo. This means that e.g. `@media` statements will also fail. Here's an example of how to use module augmentation to extend the interface with some custom properties:

```ts
// my-style.d.ts
import * as Glitz from '@glitz/type';

declare module '@glitz/type' {
  interface Style {
    // Add media query
    '@media (min-width: 768px)'?: Glitz.Rule;
  }
  interface Properties {
    // Add CSS property
    mozOsxFontSmoothing?: string;
    
    // Allow any other property
    [property: string]: any;
  }
}

```

## API

### `new GlitzClient(elements: HTMLStyleElement[], options: Options)`

The Glitz core class for browsers.

#### Methods

##### `injectStyle(style: Style)`

Returns: `string`

The returned value contains the class names of the injected style.

### `new GlitzServer(options?: Options)`

_Imoprted from `@glitz/core/server`._

The Glitz core class for servers.

#### Methods

##### `injectStyle(style: Style)`

Returns: `string`

Class names of the injected style.

##### `getStyleMarkup(className?: string)`

Returns: `string`

Markup with style sheets to render into `<head>` that the Glitz core class for browsers will reuse.

### Options

#### `options.transformer`

```ts
transformer(style: Properties): Properties
```

Transform or hook into the injected style. The transform function will receive an object with `string | number | Array<string | number>` as values and expects the same in return. Have in mind that the transformer will receive each unique declaration only ones. The same unique declaration will later use a cached result and will never again reach the transformer.

```ts
import GlitzClient, { compose } from '@glitz/core';
import prefixer from '@glitz/prefixer-transformer';

function numberToRemTransformer(style) {
  for (const property in style) {
    const value = style[property];
    if (typeof value === 'number') {
      style[property] = value + 'rem';
    }
  }
  return style;
}

const glitz = new GlitzClient(null, { transformer: compose(prefixer, numberToRemTransformer) });
```

#### `options.mediaOrder`

```ts
mediaOrder(a: string, b: string): number
```

Unordered media style may sometimes cause some unwanted behavior. With this function you're able to sort the order of the injected media styles.

It's recommended that you create your own with the media queries you use.

```ts
const mediaQueryOrder = [
  '(min-width: 320px)',
  '(min-width: 768px)',
  ...
];

function mediaQuerySorter(a, b) {
  const indexA = mediaQueryOrder.indexOf(a);
  const indexB = mediaQueryOrder.indexOf(b);
  return indexA - indexB;
}

const glitz = new GlitzClient(null, { mediaOrder: mediaQuerySorter });
```

It's also possible to use [`sort-css-media-queries`](https://github.com/dutchenkoOleg/sort-css-media-queries/) if you don't have a specific list of media queries.

#### `options.prefix`

```ts
prefix: string
```

Prefix all class names.

## Playground

To play around with Glitz, just:

```bash
$ git clone https://github.com/frenic/glitz.git
$ cd glitz
$ yarn install
$ yarn example
```

Open http://localhost:1234 in your browser and edit the code in `packages/example`.

## Prefixer

The [`@glitz/prefixer-transformer`](https://github.com/frenic/glitz/tree/master/packages/prefixer-transformer) is basically just a TypeScript wrapper for [`inline-style-prefixer/static`](https://github.com/rofrischmann/inline-style-prefixer).

```ts
import GlitzClient from '@glitz/core';
import prefixer from '@glitz/prefixer-transformer';
const glitz = new GlitzClient(null, { transformer: prefixer });

const className = glitz.injectStyle({
  'display': 'flex',
  // Will be transformed into:
  // {
  //   display: [
  //     '-webkit-box',
  //     '-moz-box',
  //     '-ms-flexbox',
  //     '-webkit-flex',
  //     'flex',
  //   ];
  // }
});
```

## Atomic

Glitz breaks down each declaration into as small atomic rules as possible and injects them to a virtual style sheet using the [`CSSStyleSheet.insertRule()`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule) method. This results in minimal output and maximum performance.

```ts
const className = glitz.injectStyle({
  display: 'flex',
  color: 'white',
  fontWeight: 'bold',
});

console.log(className); // -> "a b c"
```

The injected rules would in this case look like:

```css
.a {
  display: flex;
}
.b {
  color: white;
}
.c {
  font-weight: bold;
}
```

So the next time you use `display: 'flex'` it will reuse `a` instead of injecting a new rule.

Glitz is highly inspired by [Styletron](https://github.com/rtsao/styletron). So many thanks to Ryan Tsao for his incredible work. To read more about this, visit [his blog post](https://ryantsao.com/blog/virtual-css-with-styletron) which describes pretty much how Glitz works.
