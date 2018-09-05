export function injectSheetRule(styleElement: HTMLStyleElement, rule: string) {
  const sheet = styleElement.sheet as CSSStyleSheet;
  const index = sheet.cssRules.length;
  try {
    sheet.insertRule(rule, index);
  } finally {
    // Ignore failing rules
  }
}

export function createStyleElement(media: string | undefined, identifier: string) {
  const element = document.createElement('style');

  if (media) {
    element.media = media;
  }

  element.dataset[identifier] = '';

  return element;
}

export function insertStyleElement(element: HTMLStyleElement, insertBefore: HTMLStyleElement | null) {
  document.head.insertBefore(element, insertBefore);
  return element;
}
