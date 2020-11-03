import { prettifyRule } from './format';

export function injectSheetRule(sheet: CSSStyleSheet, rule: string, index = sheet.cssRules.length) {
  try {
    sheet.insertRule(rule, index);
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `Failed to insert this CSS rule possibly because the selector isn't supported by the browser:\n\n`,
        prettifyRule(rule),
      );
    }
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

export function isCSSStyleSheet(sheet: CSSStyleSheet | StyleSheet | null): sheet is CSSStyleSheet {
  if (!sheet) {
    return false;
  }

  return 'cssRules' in sheet;
}
