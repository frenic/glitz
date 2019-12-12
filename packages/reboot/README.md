# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

Transforms numeric values from properties like `height` and `left` to a length with unit.

```ts
import { GlitzClient } from '@glitz/core';
import numberToLength from '@glitz/length-transformer';
const glitz = new GlitzClient({ transformer: numberToLength });

const className = glitz.injectStyle({
  height: 10,
  width: [100, 'max-content'],
  // Will be transformed into:
  // {
  //   height: '10px',
  //   width: ['100px', 'max-content'],
  // }
});
```
