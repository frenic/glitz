export function formatRule(identifier: string, block: string) {
  return `${identifier}{${block}}`;
}

export function formatClassRule(className: string, block: string, selector: string = '') {
  return `.${formatRule(className + selector, block)}`;
}

export function formatKeyframesRule(name: string, blockList: string) {
  return `@keyframes ${formatRule(name, blockList)}`;
}

export function formatFontFaceRule(block: string) {
  return `@font-face {${block}}`;
}

const PRETTY_REGEX = /[{:;}]|(?:(["']).*?\1)/g;

export function prettifyRule(rule: string) {
  return rule.replace(PRETTY_REGEX, match =>
    match === '{' ? ' {\n  ' : match === ':' ? ': ' : match === ';' ? ';\n  ' : match === '}' ? ';\n}' : match,
  );
}
