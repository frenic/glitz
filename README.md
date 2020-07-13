# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

Glitz is a CSS-in-JS library that is strictly focused on:

:zap: **Performance** by caching and avoiding unnecessary re-renders whenever possible<br>
:policeman: **Type safety** by TypeScript<br>
:balance_scale: **Lightweight** [![@glitz/core bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@glitz/core.svg?style=flat-square)](https://bundlephobia.com/result?p=@glitz/core) by keeping things simple<br>
:muscle: **Flexibility** by composition to avoid wrapping elements<br>
:fire: Official [**React** bindings](https://github.com/frenic/glitz/blob/master/packages/react/)<br>

Along with other built-in features like:

- Atomic CSS (and non-Atomic CSS)
- Shorthand expansion
- Pseudo selectors/elements
- Attribute selectors
- Fallback values
- `@media` support
- `@keyframes` support
- `@font-face` support
- Media query ordering
- Server rendering
- Vendor prefixing _(with `@glitz/transformers`)_
- Number to unit conversion `10 -> "10px"`_(with `@glitz/transformers`)_
- Warnings and errors when things goes wrong in development _(with `@glitz/transformers`)_

## Table of content

- [Getting started](#getting-started)
- [Features](#features)
  - [Atomic](#atomic)
  - [Pseudo selectors/elements](#pseudo-selectorselements)
  - [Attribute selectors](#attribute-selectors)
  - [Fallback values](#fallback-values)
  - [Keyframes](#keyframes)
  - [Font faces](#font-faces)
  - [Media queries](#media-queries)
- [React](#react)
- [Server rendering](#server-rendering)
- [Shorthand properties](#shorthand-properties)
- [TypeScript](#typescript)
  - [Unknown properties](#unknown-properties)
  - [Add custom properties](#add-custom-properties)
- [Transformers](#transformers)
  - [All](#all)
  - [Prefixer](#prefixer)
  - [Number as length](#number-as-length)
  - [DevTool](#devtool)
- [API](#api)
  - [`new GlitzClient(options?: Options)`](#new-glitzclientoptions-options)
  - [`new GlitzServer(options?: Options)`](#new-glitzserveroptions-options)
  - [Options](#options)
  - [Helpers](#helpers)
- [Playground](#playground)

## Getting started

```bash
$ yarn add @glitz/core @glitz/transformers

// or

$ npm install @glitz/core @glitz/transformers
```

The most basic implementation is really easy. You don't need any config or module loaders to get started.

```ts
import { GlitzClient } from '@glitz/core';
import transformers from '@glitz/transformers';
const glitz = new GlitzClient({ transformer: transformers() });

const className = glitz.injectStyle({
  color: 'green',
});
```

## Features

### Atomic

Each declaration will be injected individually by default which means that declaration blocks are divided into as small atomic rules as possible before they are injected into a virtual style sheet using the [`CSSStyleSheet.insertRule()`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule) method. This results in minimal output and maximum performance because each class becomes highly reusable.

```ts
const className = glitz.injectStyle({
  display: 'flex',
  color: 'green',
  // Will be injected as:
  // .a {
  //   display: flex;
  // }
  // .b {
  //   color: green;
  // }
});
```

So the next time you use `display: 'flex'` it will reuse `a` instead of injecting a new rule.

_However, the side-effect of this is that you cannot guarantee the order of the CSS. That why it's recommended to always use longhand properties. More info about using [shorthand properties](#shorthand-properties) here. You're able to [disable this feature](#optionsatomic) but it's not recommended._

### Pseudo selectors/elements

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

### Attribute selectors

You define your attribute selector as the property name, followed with the style you wish to have for that element.

```ts
const className = glitz.injectStyle({
  '[disabled]': {
    display: 'none',
  },
});
```

### Fallback values

An array of values will be injected as one rule.

```ts
const className = glitz.injectStyle({
  width: ['50%', 'fit-content'],
  // Will be injected as:
  // .a {
  //   width: 50%;
  //   width: fit-content;
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
    fontFamily: '"Custom Font"',
    fontStyle: 'normal',
    fontWeight: 'normal',
    src: "url(https://domain.tld/path/to/font-regular.woff2) format('woff2')",
  },
  // Will be injected as:
  // .a {
  //   font-family: "Custom Font";
  // }
  // @font-face {
  //   font-family: "Custom Font";
  //   font-style: normal;
  //   font-weight: 400;
  //   src: url(https://domain.tld/path/to/font.woff2) format('woff2');
  // }
});
```

The font family name will be reused when an identical block is used again.

You're also able to use fallback values in combination with font faces.

```ts
const className = glitz.injectStyle({
  fontFamily: [
    {
      fontFamily: '"Custom Font"',
      fontStyle: 'normal',
      fontWeight: 'normal,
      src: "url(https://domain.tld/path/to/font-regular.woff2) format('woff2')",
    },
    {
      fontFamily: '"Custom Font"',
      fontStyle: 'normal',
      fontWeight: 'bold',
      src: "url(https://domain.tld/path/to/font-bold.woff2) format('woff2')",
    },
    'sans-serif',
  ],
});
```

### Media queries

You can define any `@media` property as you like.

```ts
const className = glitz.injectStyle({
  '@media (min-width: 768px)': {
    display: 'block',
  },
});
```

## React

The official [React bindings](https://github.com/frenic/glitz/blob/master/packages/react/) for Glitz are highly flexible and composable.

## Server rendering

The difference between `GlitzServer` class and `GlitzClient` class is that `GlitzClient` inserts new rules into the DOM directly. Instead `GlitzServer` collects the rendered style as a string for you to put in the `<head>`. The client side will then hydrate the CSS and reuse it.

- [API reference](#new-glitzserveroptions-options)
- [Example implementation](https://github.com/frenic/glitz/blob/master/packages/react/#server-rendering)

## Shorthand properties

Problems mixing CSS shorthand and longhand properties are common with styling techniques like this and doesn't only affects Glitz. It often causes unexpected behaviors.

```ts
const first = glitz.injectStyle({
  marginLeft: 10,
});

// Bad
const second = glitz.injectStyle({
  margin: 20,
  marginLeft: 10, // <- The order of the CSS will result in this never being applied as expected
});

// Good
const second = glitz.injectStyle({
  marginTop: 20,
  marginRight: 20,
  marginBottom: 20,
  marginLeft: 10,
});
```

Instead of writing each longhand property separately, you're able to use objects with shorthand properties.

```ts
// Good
const second = glitz.injectStyle({
  margin: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 10,
  },
});
```

For `margin`, `padding` and `border` there's some property aliases to make this easier:

- `x` is an alias for `left` and `right`
- `y` is an alias for `top` and `bottom`
- `xy` is an alias for `left`, `right`, `top` and `bottom`

```ts
// Bad
const second = glitz.injectStyle({
  padding: '10px 20px',
  border: 'red solid 5px',
});

// Good
const second = glitz.injectStyle({
  padding: {
    y: 10,
    x: 20,
  },
  border: {
    xy: {
      color: 'red',
      style: 'solid',
      width: 5,
    },
  },
});
```

You can see a complete [list of shorthand objects](https://github.com/frenic/glitz/blob/c1b547990e7d56764472045566127aa3a0831711/packages/type/index.d.ts#L23) here.

## TypeScript

You don't need TypeScript to use Glitz. But if you do, everything is typed! Even CSS! This means you'll get autocompletion and warnings as you write.

```ts
const className = glitz.injectStyle({
  colour: 'white', // Type error on property
  overflow: 'hide', // Type error on value
});
```

### Unknown properties

Unknown properties will fail to be able to notify you when there's a typo. This means that function-like pseudos (e.g. `:not(:first-child)`) and media query selectors will be considered unknown properties. For those, there's two helper functions ([`pseudo`](#pseudo) and [`media`](#media)) that will make the selectors valid.

```ts
import { media, selector } from '@glitz/core';

const className = glitz.injectStyle({
  ...media(
    { minWidth: '768px' },
    {
      display: 'block',
    },
  ),
  ...selector(':not(:first-child)', {
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

## Transformers

Styles will be processed by transformers before they are injected. A transform function will receive a flat object with `string | number | Array<string | number>` values and expects the same in return. Have in mind that the transformer will receive each unique declaration only ones. The same unique declaration will later use a cached result and will never again reach the transformer.

These are not built in by default because it gives the users the freedom of choice and makes it easier to adopt to other platforms in the future.

### All

The `@glitz/transformers` module includes all official transformers:

- [`@glitz/prefixer-transformer`](https://github.com/frenic/glitz/tree/master/packages/prefixer-transformer)
- [`@glitz/length-transformer`](https://github.com/frenic/glitz/tree/master/packages/length-transformer)
- [`@glitz/devtool-transformer`](https://github.com/frenic/glitz/tree/master/packages/devtool-transformer)

```ts
import { GlitzClient } from '@glitz/core';
import transformers from '@glitz/transformers';
const glitz = new GlitzClient({ transformer: transformers() });
```

### Prefixer

The [`@glitz/prefixer-transformer`](https://github.com/frenic/glitz/tree/master/packages/prefixer-transformer) is basically just a TypeScript wrapper for [`inline-style-prefixer/static`](https://github.com/rofrischmann/inline-style-prefixer).

```ts
import { GlitzClient } from '@glitz/core';
import prefixer from '@glitz/prefixer-transformer';
const glitz = new GlitzClient({ transformer: prefixer });

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
  //   ],
  // }
});
```

### Number as length

The [`@glitz/length-transformer`](https://github.com/frenic/glitz/tree/master/packages/length-transformer) converts numbers to lengths for certain properties.

```ts
import { GlitzClient } from '@glitz/core';
import numberToLength from '@glitz/length-transformer';
const glitz = new GlitzClient({ transformer: numberToLength });

const className = glitz.injectStyle({
  height: 10,
  width: [100, 'max-content'],
  // Will be transformed into:
  // {
  //   height: '10px',
  //   width: ['100px', 'max-content'],
  // }
});
```

### DevTool

The [`@glitz/devtool-transformer`](https://github.com/frenic/glitz/tree/master/packages/devtool-transformer) produces warnings and errors when something does wrong in development.

```ts
import { GlitzClient } from '@glitz/core';
import devTool from '@glitz/devtool-transformer';
const glitz = new GlitzClient({ transformer: devTool });

const className = glitz.injectStyle({
  width: 'calc(100)',
  // Will warn that `width` was ignored by the browser due to an error (unit missing)
});
```

## API

### `new GlitzClient(options?: Options)`

The Glitz core class for browsers.

#### Method `injectStyle(style: Style)`

Returns: `string`

The returned value contains the class names of the injected style.

### `new GlitzServer(options?: Options)`

The Glitz core class for servers.

#### Method `injectStyle(style: Style)`

Returns: `string`

Class names of the injected style.

#### Method `getStyleMarkup()`

Returns: `string`

Markup with style sheets to render into `<head>` that the Glitz core class for browsers will reuse.

### Options

#### `options.identifier`

```ts
identifier: string;
```

Default: `"glitz"`

The dataset name that will be used to identify Glitz style elements.

#### `options.transformer()`

```ts
transformer(style: Properties): Properties
```

Default: `undefined`

Styles will be processed by transformers before they are injected. A transform function will receive a flat object with `string | number | Array<string | number>` values and expects the same in return. Have in mind that the transformer will receive each unique declaration only ones. The same unique declaration will later use a cached result and will never again reach the transformer.

Official transformers are:

- [Vendor prefix](#prefixer) style
- [Number to unit conversion](#number-as-length)
- [Warnings and errors](#devtool) when things goes wrong in development

To use all the official transformers, use `@glitz/transformers`:

```ts
import { GlitzClient } from '@glitz/core';
import transformers from '@glitz/transformers';
const glitz = new GlitzClient({ transformer: transformers() });
```

#### `options.mediaOrder()`

```ts
mediaOrder(a: string, b: string): number
```

Default: `undefined`

Unordered media style may sometimes cause some unwanted behavior. With this function you're able to sort the order of the injected media styles.

It's recommended that you create your own with the media queries you use.

```ts
import { query } from '@glitz/core';

const mediaQueryOrder = [
  query({minWidth: '320px'}),
  query({minWidth: '768px'}),
  ...
];

function mediaQuerySorter(a, b) {
  const indexA = mediaQueryOrder.indexOf(a);
  const indexB = mediaQueryOrder.indexOf(b);
  return indexA - indexB;
}

const glitz = new GlitzClient({ mediaOrder: mediaQuerySorter });
```

It's also possible to use [`sort-css-media-queries`](https://github.com/dutchenkoOleg/sort-css-media-queries/) if you don't have a specific list of media queries.

#### `options.atomic`

```ts
atomic: boolean;
```

Default: `true`

Breaks down each CSS declaration to separate class names for minimal output and maximum performance. This can cause problems if you e.g. [mix longhand and shorthand properties](#shorthand-properties) because the order of the CSS can't be guaranteed. Disabling this isn't recommended, but possible by setting this to `false`.

#### `options.prefix`

```ts
prefix: string;
```

Default: `""`

Prefix all class names.

### Helpers

#### `selector()`

```ts
selector(selector: string, style?: Style): Style
```

Validates the pseudo rule. See [example](#unknown-properties).

#### `media()`

```ts
media(query: Query | string, style?: Style): Style
```

Parse and validate [`Query`](https://github.com/frenic/glitz/blob/master/packages/core/src/types/query.ts) or string into a valid media **rule**. See [example](#unknown-properties).

#### `query()`

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
