# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

[![npm (scoped)](https://img.shields.io/npm/v/@glitz/react.svg)](https://www.npmjs.com/package/@glitz/react) [![@glitz/react bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@glitz/react.svg)](https://bundlephobia.com/result?p=@glitz/react)

Flexible and composable React bindings for [Glitz](https://github.com/frenic/glitz/).

```jsx
import { styled } from '@glitz/react';

const Box = styled.div({
  fontSize: '18px',
});

export default function Message(props) {
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
- [Server rendering](#server-rendering)
- [API](#api)
  - [`<GlitzProvider />`](#glitzprovider)
  - [`styled.tagname`](#styledtagname)
  - [`<styled.[Tagname] />`](#styledtagname)
  - [`styled(innerComponent: ComponentType, staticStyle?: Style)`](#styledinnercomponent-componenttype-staticstyle-style)
  - [`styled(embeddedStyle: Style)`](#styledembeddedstyle-style)
  - [`<ThemeProvider />`](#themeprovider)

## Getting started

```sh
$ yarn add @glitz/react

// or

$ npm install @glitz/react
```

```jsx
import React from 'react';
import { render } from 'react-dom';
import GlitzClient from '@glitz/core';
import transformers from '@glitz/transformers';
import { GlitzProvider } from '@glitz/react';
import App from './App';

const glitz = new GlitzClient({ transformer: transformers() });

render(
  <GlitzProvider glitz={glitz}>
    <App />
  </GlitzProvider>,
  document.getElementById('container'),
);
```

## Caching

Class names are cached hard within the styled component. This cache invalidates as new style or theme objects are passed into the styled component.

```tsx
// Fast due to intact cache
const Success = styled.div({ color: 'green' });

// Fast due to intact cache
const successStyle = { color: 'green' };
function Success() {
  <styled.Div css={successStyle} />;
}

// Fast, but not as fast as the other two due to cache invalidation on each render
function Error() {
  <styled.Div css={{ color: 'red' }} />;
}
```

## Deep style composition

Styles are deeply composed which means that multiple style objects will be **treated** deeply. They are **not** deeply merged. Instead, Glitz will keep track of of applied rules and ignore those that are overridden. But `@keyframes` and `@font-face` objects wont be treated deeply in any way.

Here's an example of the different results:

```tsx
import { styled } from '@glitz/react';

export const Link = styled.a({
  color: 'grey',
  ':hover': {
    color: 'black',
    textDecoration: 'underline',
  },
});

export const InvertedLink = styled(Link, {
  ':hover': {
    color: 'white',
  },
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

If you're using TypeScript and need to use `styled` as a HOC, the props for your inner component need to have `StyledProps`.

```tsx
// Message.tsx
import { styled, StyledProps } from '@glitz/react';

type Props = {
  title: string;
};

class Message extends React.Component<Props & StyledProps> {
  render() {
    return (
      <styled.Div css={this.props.compose()}>
        <h1>{this.props.title}</h1>
        {this.props.children}
      </styled.Div>
    );
  }
}

export default styled(Message, {
  fontSize: '18px',
});

// HelloWorld.tsx
import { styled } from '@glitz/react';
import Message from 'Message';

const HelloWorld = styled(Message, {
  backgroundColor: 'green',
});

export default class Feature extends React.Component {
  render() {
    return <HelloWorld title="Hello world">Welcome</HelloWorld>;
  }
}
```

If you're using theming, make sure you type it using module augmentation.

```tsx
import * as Glitz from '@glitz/type';

declare module '@glitz/type' {
  interface Theme {
    linkColor: string;
    backgroundColor: string;
  }
}
```

## Server rendering

You're able to use the `GlitzServer` class when server rendering is used for your application.

```tsx
import { renderToString } from 'react-dom';
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

const headMarkup = glitz.getStyleMarkup();
```

For more information, see the ["server rendering" section](https://github.com/frenic/glitz/#server-rendering) for `@glitz/core`.

## API

### `<GlitzProvider />`

Provides all styled component with the Glitz core instance.

```jsx
<GlitzProvider
  /* Required, provides instance of `new GlitzClient` or `new GlitzServer` */
  glitz={GlitzClient | GlitzServer}
>
```

### `styled.[tagname](staticStyle: Style)`

Where `[tagname]` is lowercase e.g. `div` or `span` like `styled.div(staticStyle: Style)`.

Returns a component:

```tsx
<StyledComponent
  /* Any valid prop that `<[tagname] />` accepts */
  /* Optional, compose with so called dynamic styles */
  css={[style]}
  /* Optional, forwards a function to the inner element as `ref` */
  innerRef={[ref]}
/>
```

Tag name functions can be any valid React tag name (lower cased). It provides the possibility to have static style outside the component to not bloat your JSX-blocks.

Dynamic style are in the other hand inside using the `css` prop _(see next example)_. In this way, the logical parts of the code becomes centralized to where you receive props and the typing remains manageable, if you use TypeScript.

```jsx
import { styled } from '@glitz/react';

export default function Message(props) {
  return <Box>Hi and welcome!</Box>;
}

const Box = styled.div({
  fontSize: '18px',
});
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
  innerRef={[ref]}
/>
```

You can also use capitalized tag name (initial letter upper cased) which exposes a component directly. _When you don't have or want to use static style._

```jsx
import { styled } from '@glitz/react';

export default function Message(props) {
  return (
    <styled.Div
      css={{
        fontSize: props.xlarge: '24px' : '18px',
      }}
    >Hi and welcome!</styled.Div>
  );
}
```

### `styled(innerComponent: ComponentType, staticStyle?: Style)`

Returns a component:

```jsx
<StyledComponent
  /* Any prop that `innerComponent` accepts */
  /* Optional, compose with e.g. dynamic styles */
  css={[style]}
  /* Optional, forwards a function to the inner element as `ref` */
  innerRef={[ref]}
/>
```

You can also use `styled` as a HOC. This enables you to compose external components locally without having to create wrapping elements. This can be useful with your shared components.

The inner component will receive one `compose()` prop as described below.

#### Prop `compose(composedStyle?: Style)`

Compose style from one styled component to another styled component. This method is used to **forward style to other Glitz styled components**.

```jsx
import { styled } from '@glitz/react';
import Message from './Message';

class Welcome extends React.Component {
  render() {
    return (
      <styled.Div
        css={this.props.compose({
          textDecoration: 'underline',
        })}
        // `compose()` will in this case return both:
        // - `{ textDecoration: 'underline' }`
        // - `{ fontWeight: 'bold' }`
      >
        Hi and welcome!
      </styled.Div>
    );
  }
}

export default styled(Welcome, {
  fontWeight: 'bold',
});
```

### `styled(embeddedStyle: Style)`

Returns: `styled(innerComponent: ComponentType, staticStyle?: Style)`

It's also possible to pass style as a single argument to `styled`. In that case, it will return a new `styled` function with that static style embedded and assigned by any other style. _Note that it only returns a function. Not the properties like `styled.div` or `styled.Div`._

```jsx
import { styled } from '@glitz/react';

class List extends React.Component {
  render() {
    return <styled.Ul css={props.compose()}>{props.items.map((item = <li key={item.key}>{item.text}</li>))}</styled.Ul>;
  }
}

const listStyled = styled({
  fontSize: '18px',
  listStyle: 'square',
});

/* Will be styled as a list with squares, `18px` and `bold` */
export const ImportantList = listStyled(List, {
  fontWeight: 'bold',
});

/* Will be styled as a list with squares and `24px` */
export const LargeList = listStyled(List, {
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

export default function() {
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
