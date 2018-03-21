# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

Development tool to validate styling using `CSSStyleDeclaration` in the browser.

_It will **only** work in the browser in development mode (`process.env.NODE_ENV !== 'production'`). In production, it will compile to: `function (style) { return style }`_

```ts
import GlitzClient from '@glitz/core';
import validation from '@glitz/validation-transformer';
const glitz = new GlitzClient(null, { transformer: validation });

const className = glitz.injectStyle({
  colour: 'red',
  // Console output: An invalid CSS declaration { colour: 'red' } was ignored by the browser
});
```

## Getting started

```bash
$ yarn add @glitz/validation-transformer

// or

$ npm install @glitz/validation-transformer
```
