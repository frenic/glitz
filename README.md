# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

A fast, lightweight [_(~2.1KB gz)_](https://bundlephobia.com/result?p=@glitz/core) and type safe way of styling by the CSS-in-JS concept using Atomic CSS.

The most basic implementation is really easy. You don't need any config or module loaders to get started.

```ts
import GlitzClient from '@glitz/core';
const glitz = new GlitzClient();

const className = glitz.injectStyle({
  color: 'green',
});
```

At this moment, there's officially only [React bindings](https://github.com/frenic/glitz/blob/master/packages/react/) available.

## Table of content

* [Getting started](#getting-started)
* [Features](#features)
  * [Pseudos](#pseudos)
  * [Fallback values](#fallback-values)
  * [Keyframes](#keyframes)
  * [Font faces](#font-faces)
  * [Media queries](#media-queries)
* [Server rendering](#server-rendering)
* [Shorthand properties](#shorthand-properties)
* [TypeScript](#typescript)
  * [Unknown properties](#unknown-properties)
  * [Add custom properties](#add-custom-properties)
* [API](#api)
  * [`new GlitzClient(elements: HTMLStyleElement[], options: Options)`](#new-glitzclientelements-htmlstyleelement-options-options)
    * [Method `injectStyle(style: Style)`](#method-injectstylestyle-style)
  * [`new GlitzServer(options?: Options)`](#new-glitzserveroptions-options)
    * [Method `injectStyle(style: Style)`](#method-injectstylestyle-style-1)
    * [Method `getStyleMarkup(className?: string)`](#method-getstylemarkupclassname-string)
  * [Options](#options)
    * [`options.transformer`](#optionstransformer)
    * [`options.mediaOrder`](#optionsmediaorder)
    * [`options.prefix`](#optionsprefix)
  * [Helpers](#helpers)
    * [`pseudo`](#pseudo)
    * [`media`](#media)
    * [`query`](#query)
* [Playground](#playground)
* [Prefixer](#prefixer)
* [Atomic](#atomic)

## Getting started

```bash
$ yarn add @glitz/core

// or

$ npm install @glitz/core
```

## Features

### Pseudos

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

### Fallback values

An array of values will be injected as one rule.

```ts
const className = glitz.injectStyle({
  display: ['-webkit-flex', 'flex'],
  // Will be injected as:
  // .a {
  //   display: -webkit-flex;
  //   display: flex;
  // }
});
```

### Keyframes

The `animationName` property injects the `@keyframes` declaration list and will be replaced by a unique name.

```ts
const className = glitz.injectStyle({
  animationName: {
    // or animation: { name: { ...
    from: {
      color: 'red',
    },
    to: {
      color: 'green',
    },
  },
  // Will be injected as:
  // .a {
  //   animation-name: a;
  // }
  // @keyframes a {
  //   from {
  //     color: red;
  //   }
  //   to {
  //     color: green;
  //   }
  // }
});
```

The name will be reused when an identical declaration list is used again.

### Font faces

The `fontFamily` property injects the `@font-face` rule and will be replaced by a unique name.

```ts
const className = glitz.injectStyle({
  fontFamily: {
    // or font: { family: { ...
    fontStyle: 'normal',
    fontWeight: 400,
    src: "url(https://domain.tld/path/to/font.woff2) format('woff2')",
  },
  // Will be injected as:
  // .a {
  //   font-family: a;
  // }
  // @font-face {
  //   font-style: normal;
  //   font-weight: 400;
  //   src: url(https://domain.tld/path/to/font.woff2) format('woff2');
  //   font-family: a;
  // }
});
```

The font family name will be reused when an identical block is used again.

You're also able to use fallback values in combination with font faces.

```ts
const className = glitz.injectStyle({
  fontFamily: [
    {
      fontStyle: 'normal',
      fontWeight: 400,
      src: "url(https://domain.tld/path/to/font.woff2) format('woff2')",
    },
    'sans-serif',
  ],
});
```

### Media queries

You can define any `@media` property as you like.

```ts
import { media } from '@glitz/core';

const className = glitz.injectStyle({
  '@media (min-width: 768px)': {
    display: 'block',
  },
});
```

## Server rendering

The difference between `GlitzServer` class and `GlitzClient` class is that `GlitzClient` inserts new rules into the DOM directly. Instead `GlitzServer` collects the rendered style as a string for you to put in the `<head>`. The client side will then hydrate the CSS and reuse it.

* [API reference](#glitzserver)
* [Example implementation](https://github.com/frenic/glitz/blob/master/packages/react/#server-rendering)

## Shorthand properties

Problems mixing CSS shorthand and longhand properties are common with styling techniques like this and doesn't only affects Glitz. It often causes unexpected behaviors.

```ts
import { media } from '@glitz/core';

const first = glitz.injectStyle({
  marginLeft: '10px',
});

// Bad
const second = glitz.injectStyle({
  margin: '20px',
  marginLeft: '10px', // <- The order of the CSS will result in this never being applied as expected
});

// Good
const second = glitz.injectStyle({
  marginTop: '20px',
  marginRight: '20px',
  marginBottom: '20px',
  marginLeft: '10px',
});
```

Instead of writing each longhand property separately, you're able to use objects with shorthand properties.

```ts
import { media } from '@glitz/core';

// Good
const second = glitz.injectStyle({
  margin: {
    top: '20px',
    right: '20px',
    bottom: '20px',
    left: '10px',
  },
});
```

For `margin` and `padding` the `x` property is an alias for `left` and `right`. The `y` property is an alias for `top` and `bottom`.

```ts
import { media } from '@glitz/core';

// Bad
const second = glitz.injectStyle({
  padding: '10px',
});

// Good
const second = glitz.injectStyle({
  padding: {
    x: '10px',
    y: '10px',
  },
});
```

You can see a complete [list of shorthand objects](https://github.com/frenic/glitz/blob/c1b547990e7d56764472045566127aa3a0831711/packages/type/index.d.ts#L23) here.

## TypeScript

You don't need TypeScript to use Glitz. But if you do, everything is typed! Even CSS! This means you'll get autocompletion and warnings as you write.

```ts
const className = glitz.injectStyle({
  alignSelf: 'stretsh', // Type error on value
  colour: 'white', // Type error on property
});
```

### Unknown properties

Unknown properties will fail to be able to notify you when there's a typo. This means that function-like pseudos (e.g. `:not(:first-child)`) and media query selectors will be considered unknown properties. For those, there's two helper functions ([`pseudo`](#pseudo) and [`media`](#media)) that will make the selectors valid.

```ts
import { media, pseudo } from '@glitz/core';

const className = glitz.injectStyle({
  ...media(
    { minWidth: 768 },
    {
      display: 'block',
    },
  ),
  ...pseudo(':not(:first-child)', {
    textDecoration: 'underline',
  }),
});
```

### Add custom properties

You can also extend the interface with custom CSS properties like CSS variables and other unknown properties using module augmentation.

```ts
// my-style.d.ts
import * as Glitz from '@glitz/type';

declare module '@glitz/type' {
  interface Properties {
    // Add CSS property
    mozOsxFontSmoothing?: string;

    // Add CSS variable name
    '--theme-color'?: string;

    // Allow any other property
    [property: string]: any;
  }
}
```

## API

### `new GlitzClient(elements: HTMLStyleElement[], options: Options)`

The Glitz core class for browsers.

#### Method `injectStyle(style: Style)`

Returns: `string`

The returned value contains the class names of the injected style.

### `new GlitzServer(options?: Options)`

_Imoprted from `@glitz/core/server`._

The Glitz core class for servers.

#### Method `injectStyle(style: Style)`

Returns: `string`

Class names of the injected style.

#### Method `getStyleMarkup(className?: string)`

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
import {query} from '@glitz/core';

const mediaQueryOrder = [
  query({minWidth: 320}),
  query({minWidth: 768}),
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
prefix: string;
```

Prefix all class names.

### Helpers

#### `pseudo`

```ts
pseudo(selector: string): string
```

Validates the pseudo rule. See [example](#unknown-properties).

#### `media`

```ts
media(query: Query | string, style?: Style): Style
```

Parse and validate [`Query`](https://github.com/frenic/glitz/blob/master/packages/core/src/types/query.ts) or string into a valid media **rule**. See [example](#unknown-properties).

#### `query`

```ts
query(query: Query): string
```

Parse and validate [`Query`](https://github.com/frenic/glitz/blob/master/packages/core/src/types/query.ts) into a valid media query.

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
  display: 'flex',
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
