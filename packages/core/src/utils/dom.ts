export function injectSheetRule(styleElement: HTMLStyleElement, rule: string) {
  const sheet = styleElement.sheet as CSSStyleSheet;
  sheet.insertRule(rule, sheet.cssRules.length);
}

export function createStyleElement(media?: string | null) {
  const element = document.createElement('style');

  if (media) {
    element.media = media;
  }

  return element;
}

export function insertStyleElement(element: HTMLStyleElement, insertBefore: HTMLStyleElement | null) {
  document.head.insertBefore(element, insertBefore);
  return element;
}
