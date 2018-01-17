# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

React bindings for [Glitz](https://github.com/frenic/glitz/).

```tsx
import { styled } from '@glitz/react';

export default function Message(props) {
  return (
    <Box
      css={{color: props.important ? 'maroon' : 'teal'}}
      /* Will be styled as `<div />` with `18px` and `maroon` or `teal` */
    >{props.children}</Box>
  );
}

const Box = styled.div({
  fontSize: '18px',
});
```

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
  document.getElementById('container')
);
```

## API

### `<GlitzProvider glitz={GlitzClient | GlitzServer} />`

Provides all styled component with the Glitz core instance.

### `styled` object

**Any valid use of the `styled` object returns a React component which exposes a `css` prop which you can use to inject dynamic style and a `innerRef` prop to `ref` your inner element.**

#### `styled.[tagname](staticStyle: Style)`

Returns: `<StyledComponent css?={Style} innerRef?={(instance: Element) => void} />`

Tag name functions can be any valid React tag name (lower cased). It provides the possibility to have static style outside the component to not bloat your JSX-blocks. 

Dynamic style are in the other hand inside using the `css` prop _(see next example)_. In this way, the logical parts of the code becomes centralized to where you receive props and the typing remains manageable, if you use TypeScript.

```tsx
import { styled } from '@glitz/react';

export default function Message(props) {
  return (
    <Box>{props.children}</Box>
  );
}

const Box = styled.div({
  fontSize: '18px',
});
```

#### `<styled.[Tagname] css?={Style} innerRef?={(instance: Element) => void} />`

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

These components are basically the same thing as:

```ts
const Div = styled({apply, compose, ...rest} => <div className={apply()} {...rest} />);
```

#### `styled(innerComponent: ComponentType, staticStyle?: Style)`

Returns: `<StyledComponent css?={Style} innerRef?={(instance: Component) => void} />`

You can also use `styled` as a HOC. This enables you to compose external components locally without having to create wrapping elements. This can be useful with your shared components.

The inner component will receive two props:

##### `props.apply()`

Returns a string with class names of the injected style.

```tsx
import { styled } from '@glitz/react';

class Message extends React.Component {
  render() {
    return (
      <div
        className={this.props.apply()}
        /* Will be styled with `18px` */
      >{this.props.children}</div>
    );
  }
}

export default styled(Message, {
  fontSize: '18px',
});
```

##### `props.compose(composedStyle?: Style)`

Compose style from one styled component to another styled element.

```tsx
import { styled } from '@glitz/react';
import Message from './Message';

class Welcome extends React.Component {
  render() {
    return (
      <Message
        css={this.props.compose()}
        /* Will be styled with `18px` and `bold` */
      >Hi and welcome!</div>
    );
  }
}

export default styled(Welcome, {
  fonteight: 'bold',
});
```

#### `styled(embeddedStyle: Style)`

Returns: `styled(innerComponent: ComponentType, staticStyle?: Style)`

It's also possible to pass style as a single argument to `styled`. In that case, it will return a new `styled` function with that static style embedded and assigned by any other style. _Note that it only returns a function. Not the properties like `styled.div` or `styled.Div`._

```ts
import { styled } from '@glitz/react';

class List extends React.Component {
  render() {
    return (
      <ul className={props.apply()}>
        {props.items.map(item =(
          <li key={item.key}>{item.text}</li>
        ))}
      </ul>
    );
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
