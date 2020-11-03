export function formatRule(selector: string, block: string) {
  return `${selector}{${block}}`;
}

export function formatClassRule(className: string, block: string, selector = '') {
  return `.${formatRule(className + selector, block)}`;
}

export function formatKeyframesRule(name: string, blockList: string) {
  return `@keyframes ${formatRule(name, blockList)}`;
}

export function formatFontFaceRule(block: string) {
  return formatRule('@font-face', block);
}

export function formatMediaRule(query: string, block: string) {
  return `@media ${formatRule(query, block)}`;
}

const PRETTY_REGEX = /[{:;}]|(?:(["']).*?\1)/g;

export function prettifyRule(rule: string) {
  return rule.replace(PRETTY_REGEX, match =>
    match === '{' ? ' {\n  ' : match === ':' ? ': ' : match === ';' ? ';\n  ' : match === '}' ? ';\n}' : match,
  );
}
