export function injectSheetRule(styleElement: HTMLStyleElement, rule: string) {
  const sheet = styleElement.sheet as CSSStyleSheet;
  sheet.insertRule(rule, sheet.cssRules.length);
}

export function createStyleElement(media?: string | null, insertBefore?: HTMLStyleElement | null) {
  const element = document.createElement('style');

  if (media) {
    element.media = media;
  }

  if (insertBefore) {
    document.head.insertBefore(element, insertBefore);
  } else {
    document.head.appendChild(element);
  }

  return element;
}
