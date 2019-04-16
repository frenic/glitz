import { Style } from '@glitz/type';

// Unfortunately we need this until there's a way to have index signatures for
// other types like: https://github.com/Microsoft/TypeScript/issues/7765.
// This is a work around that works thanks to dynamic properties.

export default function pseudo(selector: string | string[], style: Style): Style {
  // TODO Pseudo validation
  return typeof selector === 'string'
    ? { [selector]: style }
    : selector.reduce((acc, value) => ({ ...acc, [value]: style }), {});
}
