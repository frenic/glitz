# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

[![npm (scoped)](https://img.shields.io/npm/v/@glitz/react.svg)](https://www.npmjs.com/package/@glitz/react) [![@glitz/react bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@glitz/react.svg)](https://bundlephobia.com/result?p=@glitz/react)

Flexible and composable React bindings for [Glitz](https://github.com/frenic/glitz/).

```jsx
import { styled } from '@glitz/react';

const Box = styled.div({
  fontSize: '18px',
});

function Message(props) {
  return (
    <Box css={{ color: props.important ? 'maroon' : 'teal' }}>
      Hi and <styled.Span css={{ fontWeight: 'bold' }}>welcome!</styled.Span>
    </Box>
  );
}
```

## Table of content

- [Getting started](#getting-started)
- [Caching](#caching)
- [Deep style composition](#deep-style-composition)
- [TypeScript](#typescript)
- [Theming](#theming)
- [Server rendering](#server-rendering)
- [API](#api)
  - [`<GlitzProvider />`](#glitzprovider-)
  - [`styled.tagname`](#styledtagnamestyle-style--styledecorator)
  - [`<styled.[Tagname] />`](#styledtagname-)
  - [`styled(component: ComponentType, ...style?: Style | StyleDecorator)`](#styledcomponent-componenttype-style-style--styledecorator)
  - [`styled(...style: Style | StyleDecorator)`](#styledstyle-style--styledecorator)
  - [`<ThemeProvider />`](#themeprovider-)
  - [`<StyleProvider />`](#styleprovider-)
  - [`applyClassName(component: ComponentType)`](#applyclassnamecomponent-componenttype)
  - [`forwardStyle(component: ComponentType)`](#forwardstylecomponent-componenttype)
  - [`useStyle(style: Style | StyleDecorator)`](#usestylestyle-style--styledecorator)
  - [`useTheme()`](#usetheme)

## Getting started

```sh
$ yarn add @glitz/react

// or

$ npm install @glitz/react
```

```jsx
import React from 'react';
import { render } from 'react-dom';
import { GlitzClient } from '@glitz/core';
import { GlitzProvider } from '@glitz/react';
import transformers from '@glitz/transformers';
import App from './App';

const glitz = new GlitzClient({ transformer: transformers() });

render(
  <GlitzProvider glitz={glitz}>
    <App />
  </GlitzProvider>,
  document.getElementById('container'),
);
```

## Style Decorators

Style Decorators are reusable, shareable and type-safe style containers which can be used instead of style objects in some cases. You create Style Decorators with the super object `styled()` by having a style object (or another Style Decorator) as first argument.

Style Decorators existence can be confusing at times. But they exist for a number of reasons:

- They are immutable
- They embraces the built-in [deep style composition](#deep-style-composition) mechanism since spreading style objects can bring negative effects
- They are type-safe, you don't need to import types or worry about type widening and other warnings you may miss

  ```tsx
  import { styled } from '@glitz/react';

  // Bad
  export const headingStyle = {
    fontWeight: 'bold',
  };

  styled.div(headingStyle); // ❌ Type error due to literal type widening

  // Good
  export const headingDecorator = styled({
    fontWeight: 'bold',
  });

  styled.div(headingDecorator); // 👌 No errors
  ```

## Caching

Class names are cached hard within the Glitz-component. This cache invalidates as new style or theme objects are passed into the Glitz-component.

```tsx
// 👌 Fast due to intact cache
const Success = styled.div({ color: 'green' });

// 👌 Fast due to intact cache
const successDecorator = styled({ color: 'green' });
function Success() {
  <styled.Div css={successDecorator} />;
}

// ❗ Fast, but not as fast as the other two due to cache invalidation on each render
function Error() {
  <styled.Div css={{ color: 'red' }} />;
}
```

## Deep style composition

Spreading style objects can bring negative effects:

```tsx
import { styled } from '@glitz/react';

export const lightLinkStyle = {
  color: 'grey',
  ':hover': {
    color: 'black',
    textDecoration: 'underline',
  },
};

const darkLinkStyle = {
  ...lightLinkStyle,
  ':hover': {
    color: 'white',
  },
};

const Link styled.a(fontStyle); // ❌ The declaration `color: black` will be gone
```

To fix this, Glitz makes sure style objects are deeply composed which means that multiple style objects will be **treated** deeply. They are **not** deeply merged. Instead, Glitz will keep track of of applied rules and ignore those that are overridden. But `@keyframes` and `@font-face` objects wont be treated deeply in any way.

```tsx
import { styled } from '@glitz/react';

export const lightLinkDecorator = styled({
  color: 'grey',
  ':hover': {
    color: 'black',
    textDecoration: 'underline',
  },
});

const darkLinkDecorator = styled(lightLinkDecorator, {
  ':hover': {
    color: 'white',
  },
});

styled.div(darkLinkDecorator); // 👌 Deeply composed as expected
  // Results in:
  // {
  //   color: 'grey',
  //   ':hover': {
  //     color: 'white',
  //     textDecoration: 'underline',
  //   }
  // }
});
```

## TypeScript

You're able to type your theme using module augmentation.

```tsx
import * as Glitz from '@glitz/core';

declare module '@glitz/core' {
  interface Theme {
    linkColor: string;
    backgroundColor: string;
  }
}
```

## Theming

Provide a theme object that will accessed from style property values.

```tsx
import { styled, ThemeProvider } from '@glitz/react';

function Text(props) {
  return <styled.Span css={{ color: theme => theme.textColor }}>{props.children}</styled.Span>;
}

function Example() {
  return (
    <ThemeProvider theme={{ textColor: 'green' }}>
      <Text>Some green text</Text>
      <ThemeProvider theme={{ textColor: 'blue' }}>
        <Text>Some blue text</Text>
      </ThemeProvider>
    </ThemeProvider>
  );
}
```

## Server rendering

You're able to use the `GlitzServer` class when server rendering is used for your application. Here's an example with a regular `renderToString()`.

```tsx
import { renderToString } from 'react-dom/server';
import { GlitzServer } from '@glitz/core';
import { GlitzProvider } from '@glitz/react';
import options from './glitz-options';
import App from './App';

const glitz = new GlitzServer(options);

const bodyMarkup = renderToString(
  <GlitzProvider glitz={glitz}>
    <App />
  </GlitzProvider>,
  document.getElementById('container'),
);

const headMarkup = glitz.getStyle(true);
```

You're also able to render with Node Stream.

```tsx
import { renderToNodeStream } from 'react-dom/server';
import { GlitzServer } from '@glitz/core';
import { GlitzProvider } from '@glitz/react';
import options from './glitz-options';
import App from './App';

const glitz = new GlitzServer(options);

app.use('*', (request, response) => {
  response.write('<html><head></head><body><div id="container">');

  const stream = renderToNodeStream(
    <GlitzProvider glitz={glitz} stream>
      <App />
    </GlitzProvider>,
  );

  stream.pipe(response, { end: 'false' });

  stream.on('end', () => {
    response.end('</div></body></html>');
  });
});
```

For more information, see the ["server rendering" section](https://github.com/frenic/glitz/#server-rendering) for `@glitz/core`.

## API

### `<GlitzProvider />`

Provides all Glitz-component with the Glitz core instance.

```jsx
<GlitzProvider
  /* Required, provides instance of `new GlitzClient` or `new GlitzServer` */
  glitz={GlitzClient | GlitzServer}
  /* Optional (default `false`), enables stream rendering of Glitz style */
  stream={boolean}
>
```

### `styled.[tagname](...style: Style | StyleDecorator)`

Where `[tagname]` is lowercase e.g. `div` or `span` like `styled.div(staticStyle: Style)`.

Returns a component:

```tsx
<StyledComponent
  /* Any valid prop that `<[tagname] />` accepts */
  /* Optional, compose with so called dynamic styles */
  css={[style]}
  /* Optional, forwards a function to the inner element as `ref` */
  ref={[ref]}
/>
```

Tag name functions can be any valid React tag name (lower cased). It provides the possibility to have static style outside the component to not bloat your JSX-blocks.

Dynamic style are in the other hand inside using the `css` prop _(see next example)_. In this way, the logical parts of the code becomes centralized to where you receive props and the typing remains manageable, if you use TypeScript.

```jsx
import { styled } from '@glitz/react';

const Box = styled.div({
  fontSize: '18px',
});

function Example(props) {
  return <Box>Hi and welcome!</Box>;
}
```

### `<styled.[Tagname] />`

Where `[Tagname]` is capitalized e.g. `Div` or `Span` like `<styled.Div />`.

Returns a component:

```jsx
<styled.[Tagname]
  /* Any valid prop that `<[tagname] />` accepts */
  /* Optional, compose with e.g. dynamic styles */
  css={[style]}
  /* Optional, forwards a function to the inner element as `ref` */
  ref={[ref]}
/>
```

You can also use capitalized tag name (initial letter upper cased) which exposes a component directly. _When you don't have or want to use static style._

```jsx
import { styled } from '@glitz/react';

function Example(props) {
  return (
    <styled.Div
      css={{
        fontSize: props.xlarge ? '24px' : '18px',
      }}
    >
      Hi and welcome!
    </styled.Div>
  );
}
```

### `styled(component: ComponentType, ...style?: Style | StyleDecorator)`

Returns a component:

```jsx
<StyledComponent
  /* Any prop that `component` accepts */
  /* Optional, compose with e.g. dynamic styles */
  css={[style]}
  /* Optional, forwards a function to the inner element as `ref` */
  ref={[ref]}
/>
```

You can also use `styled` as a HOC. This enables you to compose external components locally without having to create wrapping elements. This can be useful with your shared components.

The inner component will receive one `compose()` prop as described below.

### `styled(...style: Style | StyleDecorator)`

Returns a `StyleDecorator`.

```jsx
import { styled } from '@glitz/react';

function List(props) {
  return <styled.Ul>{props.items.map((item = <li key={item.key}>{item.text}</li>))}</styled.Ul>;
}

const listDecorator = styled({
  fontSize: '18px',
  listStyle: 'square',
});

/* Will be styled as a list with squares, `18px` and `bold` */
const ImportantList = styled(List, listDecorator, {
  fontWeight: 'bold',
});

/* Will be styled as a list with squares and `24px` */
const LargeList = styled(List, listDecorator, {
  fontSize: '24px',
});
```

### `<ThemeProvider />`

Provides a theme to the style object.

```jsx
<ThemeProvider
  /* Required, provides theme object to styles */
  theme={Object}
>
```

Any theme can be used and replaced anywhere and you receive them by using a function for a property that returns a value.

```jsx
import React from 'react';
import { styled, ThemeProvider } from '@glitz/react';

const theme1 = {
  linkColor: 'maroon',
};

const theme2 = {
  linkColor: 'teal',
};

const Link = styled.a({
  // This function will be called when rendered
  color: theme => theme.linkColor,
});

function Example() {
  return (
    <ThemeProvider theme={theme1}>
      <Link>Link is maroon</Link>
      <ThemeProvider theme={theme2}>
        <Link>Link is teal</Link>
      </ThemeProvider>
    </ThemeProvider>
  );
}
```

### `<StyleProvider />`

Applies class names as string directly through `className`-prop instead of passing the `compose()`-prop. This works great with third-party components that accepts a `className`-prop for styling.

```jsx
import React from 'react';
import { styled, applyClassName } from '@glitz/react';
import { Link } from 'react-router-dom';

const CustomLink = styled(applyClassName(Link), {
  color: 'green',
  ':hover': {
    color: 'darkgreen',
  },
});
```

### `applyClassName(component: ComponentType)`

Applies class names as string directly through `className`-prop instead of passing the `compose()`-prop. This works great with third-party components that accepts a `className`-prop for styling.

```jsx
import React from 'react';
import { styled, applyClassName } from '@glitz/react';
import { Link } from 'react-router-dom';

const CustomLink = styled(applyClassName(Link), {
  color: 'green',
  ':hover': {
    color: 'darkgreen',
  },
});
```

### `forwardStyle(component: ComponentType)`

Styles automatically forwards to the nearest Glitz-component. But you can use this to forward it manually to a different Glitz-component using the `compose()`-prop.

```jsx
import React from 'react';
import { styled, forwardStyle, ForwardStyleProps } from '@glitz/react';
import { Overlay } from './overlay';

const Modal = styled(
  forwardStyle((props: ForwardStyleProps) => (
    <Overlay>
      <styled.Div css={props.compose()}>{props.children}</styled.Div>
    </Overlay>
  )),
);
```

### `useStyle(style: Style | StyleDecorator)`

React hook that returns class names for the given style.

### `useTheme()`

React hook that returns the provided Glitz-theme.
