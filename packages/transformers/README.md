# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

Includes all official transformers:

- [`@glitz/prefixer-transformer`](https://github.com/frenic/glitz/tree/master/packages/prefixer-transformer)
- [`@glitz/length-transformer`](https://github.com/frenic/glitz/tree/master/packages/length-transformer)
- [`@glitz/devtool-transformer`](https://github.com/frenic/glitz/tree/master/packages/devtool-transformer)

```ts
import GlitzClient from '@glitz/core';
import transformers from '@glitz/transformers';
const glitz = new GlitzClient({ transformer: transformers() });
```
