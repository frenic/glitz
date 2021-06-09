export function formatRule(selector: string, block: string) {
  return `${selector}{${block}}`;
}

export function formatClassRule(className: string, block: string, selector = '') {
  return `.${formatRule(className + selector, block)}`;
}

export function formatSupportsRule(condition: string, block?: string) {
  return `@supports ${typeof block === 'string' ? formatRule(condition, block) : condition}`;
}

export function formatKeyframesRule(name: string, blockList: string) {
  return `@keyframes ${formatRule(name, blockList)}`;
}

export function formatFontFaceRule(block: string) {
  return formatRule('@font-face', block);
}

export function formatMediaRule(query: string, block?: string) {
  return `@media ${typeof block === 'string' ? formatRule(query, block) : query}`;
}

export function combineConditions(a: string, b: string) {
  return `${a[0] === '(' ? a : `(${a})`} and ${b[0] === '(' ? b : `(${b})`}`;
}

const PRETTY_REGEX = /[{:;}]|(?:(["']).*?\1)/g;

export function prettifyRule(rule: string) {
  return rule.replace(PRETTY_REGEX, match =>
    match === '{' ? ' {\n  ' : match === ':' ? ': ' : match === ';' ? ';\n  ' : match === '}' ? ';\n}' : match,
  );
}
