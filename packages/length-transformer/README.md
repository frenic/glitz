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

The default length unit is `px` for [length safe properties](#safe-properties). You can create a new transformer using `createNumberToLengthTransformer(options)` with the [`defaultUnit` option](#optionsdefaultunit) if you prefer another unit or [override units](#optionscssproperty) for any other property.

Numeric time value for `animationDelay`, `animationDuration`, `transitionDelay` and `transitionDuration` are also supported and has `ms` as default unit.

## Getting started

```bash
$ yarn add @glitz/length-transformer

// or

$ npm install @glitz/length-transformer
```

### Options

#### `options.defaultUnit`

```ts
defaultUnit: string;
```

Default: `"px"`

Unit used for [length safe properties](#safe-properties) (that doesn't accept number and length the same time like `lineHeight`).

```ts
import { GlitzClient } from '@glitz/core';
import { createNumberToLengthTransformer } from '@glitz/length-transformer';
const glitz = new GlitzClient({ transformer: createNumberToLengthTransformer({ defaultUnit: 'rem' }) });

const className = glitz.injectStyle({
  height: 10,
  width: [100, 'max-content'],
  // Will be transformed into:
  // {
  //   height: '10rem',
  //   width: ['100rem', 'max-content'],
  // }
});
```

#### `options.[cssProperty]`

```ts
[cssProperty]: string;
```

Default: `undefined`

Override any CSS property with unit. Works with properties that excepts both number and length.

```ts
import { GlitzClient } from '@glitz/core';
import { createNumberToLengthTransformer } from '@glitz/length-transformer';
const glitz = new GlitzClient({
  transformer: createNumberToLengthTransformer({ lineHeight: 'em', fontSize: 'rem' }),
});

const className = glitz.injectStyle({
  paddingLeft: 10,
  lineHeight: 2,
  fontSize: 1.5,
  // Will be transformed into:
  // {
  //   paddingLeft: '10px',
  //   lineHeight: '2em',
  //   fontSize: '1.5rem',
  // }
});
```

## Safe properties

The default length unit will only transform a specific set of properties because some properties e.g. `lineHeight` accepts both length and numbers. Here's the full list of length safe properties it will transform:

- `bottom`
- `flexBasis`
- `fontSize`
- `height`
- `left`
- `marginBottom`
- `marginLeft`
- `marginRight`
- `marginTop`
- `maxHeight`
- `maxWidth`
- `minHeight`
- `minWidth`
- `paddingBottom`
- `paddingLeft`
- `paddingRight`
- `paddingTop`
- `right`
- `top`
- `width`

For these, 'ms' is used as unit instead:

- `animationDelay`
- `animationDuration`
- `transitionDelay`
- `transitionDuration`

_Shorthand objects like `margin: { left: 10 }` will be resolved to `marginLeft: 10` before reaching the transformer, so these values will be transformed as well._

Less common properties, but still included: `background`, `backgroundPosition`, `backgroundPositionX`, `backgroundPositionY`, `backgroundSize`, `blockSize`, `border`, `borderBlockEnd`, `borderBlockEndWidth`, `borderBlockStart`, `borderBlockStartWidth`, `borderBottom`, `borderBottomLeftRadius`, `borderBottomRightRadius`, `borderBottomWidth`, `borderInlineEnd`, `borderInlineEndWidth`, `borderInlineStart`, `borderInlineStartWidth`, `borderLeft`, `borderLeftWidth`, `borderRadius`, `borderRight`, `borderRightWidth`, `borderSpacing`, `borderTop`, `borderTopLeftRadius`, `borderTopRightRadius`, `borderTopWidth`, `borderWidth`, `boxShadow`, `columnGap`, `columnRule`, `columnRuleWidth`, `columnWidth`, `gridAutoColumns`, `gridAutoRows`, `gridColumnGap`, `gridGap`, `gridRowGap`, `gridTemplateColumns`, `gridTemplateRows`, `inlineSize`, `letterSpacing`, `lineHeightStep`, `margin`, `marginBlockEnd`, `marginBlockStart`, `marginInlineEnd`, `marginInlineStart`, `mask`, `maskPosition`, `maskSize`, `maxBlockSize`, `maxInlineSize`, `minBlockSize`, `minInlineSize`, `offset`, `offsetBlockEnd`, `offsetBlockStart`, `offsetDistance`, `offsetInlineEnd`, `offsetInlineStart`, `offsetPosition`, `outline`, `outlineOffset`, `outlineWidth`, `padding`, `paddingBlockEnd`, `paddingBlockStart`, `paddingInlineEnd`, `paddingInlineStart`, `perspective`, `perspectiveOrigin`, `scrollSnapCoordinate`, `scrollSnapDestination`, `shapeMargin`, `textIndent`, `textShadow`, `transformOrigin`, `verticalAlign` and `wordSpacing`.
