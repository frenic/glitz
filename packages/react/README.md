# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

React bindings for [Glitz](https://github.com/frenic/glitz/).

```tsx
import { styled } from '@glitz/react';

export default function Message(props) {
  return (
    <Box
      css={{ color: props.important ? 'maroon' : 'teal' }}
      /* Will be styled as `<div />` with `18px` and `maroon` or `teal` */
    >
      {props.children}
    </Box>
  );
}

const Box = styled.div({
  fontSize: '18px',
});
```

## Table of content

- [!Glitz](#glitzhttps---githubcom-frenic-glitz-raw-master-glitzsvgsanitizetrue)
  - [Table of content](#table-of-content)
  - [Getting started](#getting-started)
  - [API](#api)
    - [`<GlitzProvider />`](#glitzprovider)
    - [`styled.tagname`](#styledtagnamestaticstyle--style)
    - [`<styled.[Tagname] />`](#styledtagname)
    - [`styled(innerComponent: ComponentType, staticStyle?: Style)`](#styledinnercomponent--componenttype--staticstyle--style)
      - [Prop `apply()`](#prop-apply)
      - [Prop `compose(composedStyle?: Style)`](#prop-composecomposedstyle--style)
    - [`styled(embeddedStyle: Style)`](#styledembeddedstyle--style)
  - [Deep style composition](#deep-style-composition)
  - [TypeScript](#typescript)
  - [Server rendering](#server-rendering)

## Getting started

```bash
$ yarn add @glitz/react

// or

$ npm install @glitz/react
```

```tsx
import { render } from 'react-dom';
import GlitzClient from '@glitz/core';
import { GlitzProvider } from '@glitz/react';
import App from './App';

const glitz = new GlitzClient();

render(
  <GlitzProvider glitz={glitz}>
    <App />
  </GlitzProvider>,
  document.getElementById('container'),
);
```

## API

### `<GlitzProvider />`

Provides all styled component with the Glitz core instance. It's also possible to [enable deep composition](#deep-style-composition).

```tsx
<GlitzProvider
  /* Required, provides instance of `new GlitzClient` or `new GlitzServer` */
  glitz={glitz}
  /* Optional, enables deep composition */
  options={{
    enableDeepComposition: boolean
  }}
>
```

Composed styles are shallow merged by default. But [deep composition](#deep-style-composition) is possible by the `enableDeepComposition`.

### `styled.[tagname](staticStyle: Style)`

Returns a component:

```tsx
<StyledComponent
  /* Optional, compose with e.g. dynamic styles */
  css={...}
  /* Optional, passes a function to the inner element as `ref` */
  innerRef={...}
/>
```

Tag name functions can be any valid React tag name (lower cased). It provides the possibility to have static style outside the component to not bloat your JSX-blocks.

Dynamic style are in the other hand inside using the `css` prop _(see next example)_. In this way, the logical parts of the code becomes centralized to where you receive props and the typing remains manageable, if you use TypeScript.

```tsx
import { styled } from '@glitz/react';

export default function Message(props) {
  return <Box>{props.children}</Box>;
}

const Box = styled.div({
  fontSize: '18px',
});
```

### `<styled.[Tagname] />`

Returns a component:

```tsx
<styled.[Tagname]
  /* Optional, compose with e.g. dynamic styles */
  css={...}
  /* Optional, passes a function to the inner element as `ref` */
  innerRef={...}
/>
```

You can also use capitalized tag name (initial letter upper cased) which exposes a component directly. _When you don't have or want to use static style._

```tsx
import { styled } from '@glitz/react';

export default function Message(props) {
  return (
    <styled.Div
      css={{
        fontSize: props.xlarge: '24px' : '18px',
      }}
    >{props.children}</styled.Div>
  );
}
```

### `styled(innerComponent: ComponentType, staticStyle?: Style)`

Returns a component:

```tsx
<StyledComponent
  /* Optional, compose with e.g. dynamic styles */
  css={...}
  /* Optional, passes a function to the inner element as `ref` */
  innerRef={...}
/>
```

You can also use `styled` as a HOC. This enables you to compose external components locally without having to create wrapping elements. This can be useful with your shared components.

The inner component will receive two props:

#### Prop `apply()`

Returns a string with class names of the injected style. This method is used to **apply style on built in components** (HTML and SVG elements).

```tsx
import { styled } from '@glitz/react';

class Message extends React.Component {
  render() {
    return (
      <div
        className={this.props.apply()}
        /* Will be styled with `18px` */
      >
        {this.props.children}
      </div>
    );
  }
}

export default styled(Message, {
  fontSize: '18px',
});
```

#### Prop `compose(composedStyle?: Style)`

Compose style from one styled component to another styled element. This method is used to **apply style on other Glitz styled components**.

```tsx
import { styled } from '@glitz/react';
import Message from './Message';

class Welcome extends React.Component {
  render() {
    return (
      <Message
        css={this.props.compose({
          textDecoration: 'underline'
        })}
        /* Will be styled with `18px`, `bold` and `underline` */
      >Hi and welcome!</div>
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

```tsx
import { styled } from '@glitz/react';

class List extends React.Component {
  render() {
    return <ul className={props.apply()}>{props.items.map((item = <li key={item.key}>{item.text}</li>))}</ul>;
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

## Deep style composition

Default is shallow merge of multiple style objects. But enabling deep composition means that multiple style objects will be **treated** deeply instead.

_They are **not** deeply merged. Instead, Glitz will keep an index of applied rules and ignore those that are overridden. So `@keyframes` and `@font-face` objects wont be merged in any way._

```tsx
import { render } from 'react-dom';
import GlitzClient from '@glitz/core';
import { GlitzProvider } from '@glitz/react';
import App from './App';

const glitz = new GlitzClient();

render(
  <GlitzProvider glitz={glitz} options={{ enableDeepComposition: true }}>
    <App />
  </GlitzProvider>,
  document.getElementById('container'),
);
```

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
  // With deep composition enabled:
  // {
  //   color: 'grey',
  //   ':hover': {
  //     color: 'white',
  //     textDecoration: 'underline',
  //   }
  // }
  //
  // With deep composition disabled:
  // {
  //   color: 'grey',
  //   ':hover': {
  //     color: 'white',
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
      <div className={this.props.apply()}>
        <h1>{this.props.title}</h1>
        {this.props.children}
      </div>
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
