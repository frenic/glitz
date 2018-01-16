# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

React bindings for [Glitz](https://github.com/frenic/glitz/).

{won't be injected until it's rendered}

```tsx
import { styled } from '@glitz/react';

const Box = styled.div({
  borderRadius: '10px',
});

export default function Message(props) {
  return (
    <Box>{props.children}</Box>
  );
}
```

## Getting started

```bash
$ yarn add @glitz/core @glitz/react

// or

$ npm install @glitz/core @glitz/react
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
  document.getElementById('container')
);
```

## API

### `GlitzProvider`

```ts
GlitzProvider: React.Component
```

Provides all styled component with the Glitz core instance.

### `styled`

**Components created by `styled` all exposes a `css` prop which you can use to inject dynamic style and a `innerRef` prop to `ref` your inner element.**

#### `styled.[tagname]()`

```ts
styled.[tagname](staticStyle: Style): React.Component

// E.g.
styled.div(staticStyle: Style): React.Component
```

The function can be any valid React tagname (lower cased) and returns a styled component.

```tsx
import { styled } from '@glitz/react';

const Box = styled.div({
  borderRadius: '10px',
});

export default function StyledBox(props) {
  return (
    <Box
      css={{
        background: props.appearance === 'error' ? 'red' : 'green',
      }}
    >{props.children}</Box>
  );
}
```

#### `<styled.[Tagname] />`

```ts
styled.[Tagname]: React.Component
```

You can also use capitalized tagname (initial letter upper cased) which exposes a component directly. _When you don't have or want to use static style._

```tsx
import { styled } from '@glitz/react';

export default function StyledBox(props) {
  return (
    <styled.Div
      css={{
        borderRadius: props.size === 'large': '20px' : '10px',
        background: props.appearance === 'error' ? 'red' : 'green',
      }}
    >{props.children}</styled.Div>
  );
}
```

#### `styled()`

```ts
styled(component: Component, staticStyle: Style): React.Component

// E.g.
export default styled(Message, {
  background: 'orange',
});

// Alternatively
styled(staticStyle: Style): (component: Component) => React.Component

// E.g.
const messageStyled = styled({
  background: 'orange',
});

export default messageStyled(Message);
```

When passing a component as argument, the component will receive two props.

- `props.apply(): string`: Function returns a string with class names of the injected style

  ```tsx
  import { styled } from '@glitz/react';

  class Message extends React.Component {
    render() {
      return (
        <div
          className={this.props.apply()}
        >{this.props.children}</div>
      );
    }
  }

  export default styled(Message, {
    color: 'green',
  });
  ```

  This will simple inject `color: green` to the `<div />`.

- `props.compose(composedStyle?: Style)`: Function to compose style from one styled component to another styled element

  ```tsx
  import { styled } from '@glitz/react';
  import StyledBox from './StyledBox';

  class Message extends React.Component {
    render() {
      return (
        <StyledBox
          css={this.props.compose()}
        >{this.props.children}</div>
      );
    }
  }

  export default styled(Message, {
    color: 'green',
  });
  ```

  In this example, it will pass `color: green` to `<StyledBox />` and override any other possible value for `color`.
  
  _If we were to use `props.apply` in this example and `<StyledBox />` already was styled with `color: blue`, it would apply both `green` and `blue` and cause some unwanted behavior since the order of the rules were to decide which value it'll really get._

## Server rendering

You're able to use the `GlitzServer` class when server rendering is used for your application.

```tsx
import { renderToString } from 'react-dom';
import GlitzServer from '@glitz/core/server';
import { GlitzProvider } from '@glitz/react';
import options from './glitz-options';
import App from './App';

const glitz = new GlitzServer(options);

const bodyMarkup = renderToString(
  <GlitzProvider glitz={glitz}>
    <App />
  </GlitzProvider>,
  document.getElementById('container')
);

const headMarkup = glitz.getStyleMarkup();
```

For more information, see the ["server rendering" section](https://github.com/frenic/glitz/#server-rendering) for `@glitz/core`.
