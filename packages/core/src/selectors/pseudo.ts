import { Style } from '@glitz/type';

// Unfortunately we need this until there's a way to have index signatures for
// other types like: https://github.com/Microsoft/TypeScript/issues/7765.
// This is a work around that works thanks to dynamic properties.
export default function pseudo(value: string, style: Style): Style {
  // TODO Pseudo validation
  return { [value]: style };
}
