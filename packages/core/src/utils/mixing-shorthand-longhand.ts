import { hyphenateProperty } from '../utils/parse';

export let validateMixingShorthandLonghand: (object: { [property: string]: any }, classNames: string) => void = () => {
  /* noop */
};

if (process.env.NODE_ENV !== 'production') {
  const borderWidth = ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'];
  const borderStyle = ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'];
  const borderColor = ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'];

  const shorthands: { [shorthand: string]: string[] } = {
    animation: [
      'animation-name',
      'animation-duration',
      'animation-timing-function',
      'animation-delay',
      'animation-iteration-count',
      'animation-direction',
      'animation-fill-mode',
      'animation-play-state',
    ],
    background: [
      'background-image',
      'background-position',
      'background-size',
      'background-repeat',
      'background-origin',
      'background-clip',
      'background-attachment',
      'background-color',
    ],
    border: ['border-width', 'border-style', 'border-color'].concat(borderWidth, borderStyle, borderColor),
    'border-bottom': ['border-bottom-width', 'border-bottom-style', 'border-bottom-color'],
    'border-color': borderColor,
    'border-image': [
      'border-image-source',
      'border-image-slice',
      'border-image-width',
      'border-image-outset',
      'border-image-repeat',
    ],
    'border-left': ['border-left-width', 'border-left-style', 'border-left-color'],
    'border-radius': [
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius',
    ],
    'border-right': ['border-right-width', 'border-right-style', 'border-right-color'],
    'border-style': borderStyle,
    'border-top': ['border-top-width', 'border-top-style', 'border-top-color'],
    'border-width': borderWidth,
    'column-rule': ['column-rule-width', 'column-rule-style', 'column-rule-color'],
    columns: ['column-width', 'column-count'],
    cue: ['cue-before', 'cue-after'],
    flex: ['flex-grow', 'flex-shrink', 'flex-basis'],
    'flex-flow': ['flex-direction', 'flex-wrap'],
    font: ['font-style', 'font-variant', 'font-weight', 'font-stretch', 'font-size', 'line-height', 'font-family'],
    'font-variant': [
      'font-variant-ligatures',
      'font-variant-alternates',
      'font-variant-caps',
      'font-variant-numeric',
      'font-variant-east-asian',
    ],
    grid: [
      'grid-template-rows',
      'grid-template-columns',
      'grid-template-areas',
      'grid-auto-rows',
      'grid-auto-columns',
      'grid-auto-flow',
    ],
    'grid-area': ['grid-row-start', 'grid-column-start', 'grid-row-end', 'grid-column-end'],
    'grid-column': ['grid-column-start', 'grid-column-end'],
    'grid-row': ['grid-row-start', 'grid-row-end'],
    'grid-template': ['grid-template-rows', 'grid-template-columns', 'grid-template-areas'],
    'list-style': ['list-style-type', 'list-style-position', 'list-style-image'],
    margin: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
    mask: ['mask-image', 'mask-mode', 'mask-position', 'mask-size', 'mask-repeat', 'mask-origin', 'mask-clip'],
    'mask-border': [
      'mask-border-source',
      'mask-border-slice',
      'mask-border-width',
      'mask-border-outset',
      'mask-border-repeat',
      'mask-border-mode',
    ],
    outline: ['outline-width', 'outline-style', 'outline-color'],
    padding: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
    pause: ['pause-before', 'pause-after'],
    'place-content': ['align-content', 'justify-content'],
    'place-items': ['align-items', 'justify-items'],
    'place-self': ['align-self', 'justify-self'],
    rest: ['rest-before', 'rest-after'],
    'text-decoration': ['text-decoration-line', 'text-decoration-style', 'text-decoration-color'],
    'text-emphasis': ['text-emphasis-style', 'text-emphasis-color'],
    transition: ['transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay'],
  };

  validateMixingShorthandLonghand = (object, classNames) => {
    const hyphenatedProperties = Object.keys(object).reduce<{ [property: string]: string }>((properties, property) => {
      if (typeof object[property] === 'object' && !Array.isArray(object[property])) {
        validateMixingShorthandLonghand(object[property], classNames);
      }
      properties[hyphenateProperty(property)] = property;
      return properties;
    }, {});

    for (const property in hyphenatedProperties) {
      if (property in shorthands) {
        for (const longhand of shorthands[property]) {
          if (longhand in hyphenatedProperties) {
            console.error(
              'Injected style resulting in class name `%s` had a longhand property `%s` mixed with its corresponding shorthand property `%s` in %O which may likely cause some unexpected behavior. Replace `padding` with longhand properties to solve the issue.',
              classNames,
              hyphenatedProperties[longhand],
              hyphenatedProperties[property],
              object,
            );
          }
        }
      }
    }
  };
}
