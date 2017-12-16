export function injectSheetRule(styleElement: HTMLStyleElement, rule: string) {
  const sheet = styleElement.sheet as CSSStyleSheet;
  sheet.insertRule(rule, sheet.cssRules.length);
}

export function createStyleElement(media?: string) {
  const element = document.createElement('style');

  if (media) {
    element.media = media;
  }

  document.head.appendChild(element);

  return element;
}
