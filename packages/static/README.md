### _Work in progress_

This package is work in progress but is currently used in production.

# Static extraction of CSS for Glitz

CSS in JS offers great authoring capabilities in how you structure and write your code. But it adds runtime cost for all styling, even the components that are 100% static. Consider this code:

```ts
// MyFile.ts
const RedBackground = styled.div({
  background: 'red',
});

function MyComponent() {
  return <RedBackground>hello!</RedBackground>;
}
```

There's a lot of extra work that needs to be done during runtime to end up with a `div` with a `className` that gets you a red background. Rendering a single styled element is cheap, but a typical app will contain hundreds of styled elements and the cost adds up as your application grows.

Wouldn't it be great if we could compile away the unneeded runtime? To transform the styling that can be determined during compile time to as little runtime code as possible? That is exactly what this package aims to do!

After compilation and dead code elimination (with eg Terser) the above code is reduced to just:

```ts
// MyFile.js
function MyComponent() {
  return <div className="a">hello!</div>;
}
```

```css
/* static.css */
.a {
  background-color: 'red';
}
```

## Trade-offs

This package does static extraction in a different way than other packages. Instead of forcing developers to use a subset of styling that can be statically extracted this package goes to great length to extract as much as possible but bails when it can't extract. The code you write stays the same. The trade-off here is that Glitz won't prevent you from writing a lot of code that can't be extracted. It's up to you to be aware of if you're writing too much code that can't be extracted.

Another trade-off is that this uses the TypeScript compiler API to determine styling values at compile time so it does not work if you:

1. Use Babel or esbuild instead of TypeScript to compile your TypeScript code
1. It has limited effect if you use run TypeScript without type checking (ie transpilation mode/transpileOnly) because the type checker won't have as much information and won't be able to cross module boundaries

If you want to use esbuild the recommendation is to compile from TS to JS using TypeScript and then use esbuild to bundle the JS.

## Build performance impact

Since this uses the TypeScript compiler and makes multiple passes over the AST it does add time to the build. However, it seem to be marginal as only a few seconds on our 30 second build is spent on static extraction. If you use TypeScripts incremental builds the cost becomes negligible.

## Examples

Static extraction in Glitz implements a TypeScript evaluator that can evaluate expressions at compile time. There's a lot of examples in the evaluator and transformer tests in this repo but an example of just how far we go to extract styling is:

```ts
// file1.ts
const re = 're';
export function giveMeRed() {
  return re + 'd';
}
```

```ts
// file2.ts
import { giveMeRed } from './file1';

const OtherComponent = styled.span({
  backgroundColor: 'green',
});
const SubComponent = styled(OtherComponent, {
  color: 'blue',
});

const StyledComponent = Object.assign(styled.div({ color: giveMeRed() }), {
  SubComponent,
});

export function MyComponent() {
  return (
    <>
      <StyledComponent />
      <StyledComponent.SubComponent />
    <>
  );
}
```

Will compile down to:

```js
// file2.js

export function MyComponent() {
  return (
    <>
      <div className="a" />
      <span className="b c" />
    <>
  );
}
```

```css
.a {
  color: red;
}
.b {
  color: blue;
}
.c {
  background-color: green;
}
```

## Static themes

Glitz supports theming which lets you write code like this:

```ts
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

If the values in your themes can be known at compile time Glitz will be able to compile it to as terse ternaries as possible to avoid the runtime cost.

By declaring your theme objects to each have a unique `id` property in an array of themes exported as a variable called `staticThemes` like this:

```ts
export const staticThemes = [
  {
    id: 'blue',
    color: 'blue',
    margin: { xs: 1 },
  },
  {
    id: 'red',
    color: 'red',
    margin: { xs: 1 },
  },
];
```

The following code:

```ts
const Text = styled.div({
  color: t => t.color,
});
const WithMargin = styled.div({
  margin: t => t.margin.xs,
});

export function MyComponent() {
  return (
    <>
      <Text>hello!</Text>
      <WithMargin />
    <>
  );
}
```

Will compile down to:

```js
import { useTheme as useGlitzTheme } from '@glitz/react';

export function MyComponent() {
const __glitzTheme = useGlitzTheme();
  return (
    <>
      <div className={__glitzTheme.id === 'red' ? 'a' : 'b'}>hello!</div>
      <span className="c" />
    <>
  );
}
```

```css
.a {
  color: red;
}
.b {
  color: blue;
}
.c {
  margin: 1;
}
```

The evaluator was able to determine that all themes had the same value for `margin.xs` so no ternary was needed. If you have a lot of themes the transformer will look at different properties on your themes to generate as terse ternaries as possible. If you have ten themes if will only generate a ternary with ten conditions if all themes has unique values. See more examples in the tests.

## Getting started

You need to use TypeScript as your compiler as mentioned in the trade-offs, and you need to be able to speficy custom transformers. Custom transformers can be used with `ts-loader` in webpack (https://github.com/TypeStrong/ts-loader#getcustomtransformers) or with `ttypescript` (https://github.com/cevek/ttypescript) if you're not using a bundler.

Using webpack:

```ts
import { transformer } from '@glitz/static';
import { GlitzServer } from '@glitz/core';

const tsLoaderOptions = {
  getCustomTransformers: program => {
    const glitz = new GlitzServer();
    return {
      before: [
        transformer(program, glitz, {
          mode: 'development',
          staticThemesFile: '/path/to/static/themes.ts',
        }),
      ],
    };
  },
};
```

Note! There's currently no built-in way of writing the extracted css into a file, so that's up to do when initilizing the transformer. The Glitz instance passed in can be used in events for when the incremental or full build is done and write the css to a file using `glitz.getStyle()`.

## Contributing

We use Jest for running tests and the easiest way to get started is by playing around in the tests. The Jest extension `vscode-jest` (https://github.com/jest-community/vscode-jest) for VS Code is highly recommeneded.

If you want to add a new feature please start by opening an issue to get a discussion going first.

## Things left to do

- Better documentation, getting started right now requires trial and error and reading code in the repo
- A lot of noise and false positives are currently generated in the diagnotics for expressions that can't be evaluated
- Make the transformer easier to understand - needs more comments
