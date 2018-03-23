# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

Development tool to validate style declarations using `CSSStyleDeclaration` in the browser. It keeps track on how the browser reacts to it and notifies you via `console` if there's any ignored declarations. Then it returns the same style object without touching it.

_It will **only** work in the browser and in development mode (`process.env.NODE_ENV !== 'production'`). In production, it will compile to: `function (style) { return style }`_

```ts
import GlitzClient from '@glitz/core';
import devTool from '@glitz/devtool-transformer';
const glitz = new GlitzClient(null, { transformer: devTool });

const className = glitz.injectStyle({
  colour: 'red',
  // Warning: An invalid CSS declaration { colour: 'red' } was ignored by the browser
});
```

The order of this transformer is quite important if you're using multiple transformers. It should be before the [prefixer-transformer](https://github.com/frenic/glitz/tree/master/packages/prefixer-transformer) for not bloating your console with warnings about other vendors specific declarations and it should be after the [length-transformer](https://github.com/frenic/glitz/tree/master/packages/length-transformer) for not receive warnings when lengths doesn't have units.

```ts
import GlitzClient, { compose } from '@glitz/core';
import numberToLength from '@glitz/length-transformer';
import devTool from '@glitz/devtool-transformer';
import prefixer from '@glitz/prefixer-transformer';
const glitz = new GlitzClient(null, { transformer: compose(prefixer, devTool, numberToLength) });

const className = glitz.injectStyle({
  display: 'flex',
  width: 100,
  colour: 'red',
  // Warning: An invalid CSS declaration { colour: 'red' } was ignored by the browser
});
```

## Getting started

```bash
$ yarn add @glitz/devtool-transformer

// or

$ npm install @glitz/devtool-transformer
```
