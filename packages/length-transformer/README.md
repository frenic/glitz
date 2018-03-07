# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

Transforms numeric values from properties like `height` and `left` to a length with unit.

```ts
import GlitzClient from '@glitz/core';
import numberToLength from '@glitz/length-transformer';
const glitz = new GlitzClient(null, { transformer: numberToLength });

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

The default unit is `px`. But if you prefer another you can use `createNumberToLengthTransformer({unit: string})` instead.

```ts
import GlitzClient from '@glitz/core';
import { createNumberToLengthTransformer } from '@glitz/length-transformer';
const glitz = new GlitzClient(null, { transformer: createNumberToLengthTransformer({ unit: 'rem' }) });
```

## Getting started

```bash
$ yarn add @glitz/length-transformer

// or

$ npm install @glitz/length-transformer
```

## Properties

It will only transform a specific set of properties since `lineHeight` accepts both length and numbers. The full list of properties is:

* **`bottom`**
* **`flexBasis`**
* **`height`**
* **`left`**
* **`marginBottom`**
* **`marginLeft`**
* **`marginRight`**
* **`marginTop`**
* **`maxHeight`**
* **`maxWidth`**
* **`minHeight`**
* **`minWidth`**
* **`paddingBottom`**
* **`paddingLeft`**
* **`paddingRight`**
* **`paddingTop`**
* **`right`**
* **`top`**
* **`width`**
* `blockSize`
* `borderSpacing`
* `columnWidth`
* `inlineSize`
* `letterSpacing`
* `lineHeightStep`
* `marginBlockEnd`
* `marginBlockStart`
* `marginInlineEnd`
* `marginInlineStart`
* `maxBlockSize`
* `maxInlineSize`
* `minBlockSize`
* `minInlineSize`
* `offsetBlockEnd`
* `offsetBlockStart`
* `offsetInlineEnd`
* `offsetInlineStart`
* `outlineOffset`
* `paddingBlockEnd`
* `paddingBlockStart`
* `paddingInlineEnd`
* `paddingInlineStart`
* `perspective`
* `verticalAlign`
* `webkitBoxReflect`
* `webkitTextStrokeWidth`

_Shorthand objects like `margin: { left: 10 }` will be resolved to `marginLeft: 10` before reaching the transformer, so these values will be transformed as well._
