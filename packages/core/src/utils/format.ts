export function formatRule(identifier: string, block: string) {
  return `${identifier}{${block}}`;
}

export function formatClassRule(className: string, block: string, pseudo: string = '') {
  return `.${formatRule(className + pseudo, block)}`;
}

export function formatKeyframesRule(name: string, blockList: string) {
  return `@keyframes ${formatRule(name, blockList)}`;
}

export function formatFontFaceRule(name: string, block: string) {
  return `@font-face {${block};font-family:${name}}`;
}
