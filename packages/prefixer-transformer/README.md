# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

A TypeScript and Glitz wrapper for [`inline-style-prefixer/static`](https://github.com/rofrischmann/inline-style-prefixer).

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

This is basically the same thing as:

```ts
import { GlitzClient } from '@glitz/core';
import prefixAll from 'inline-style-prefixer/static';
const glitz = new GlitzClient({ transformer: prefixAll });
```

But with correct types for TypeScript when used with `@glitz/core`.

## Getting started

```bash
$ npm install @glitz/prefixer-transformer
```
