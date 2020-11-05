import { ResolvedDeclarations } from '@glitz/core';

export type Options = {
  ignoreProperties?: string | RegExp | (string | RegExp)[];
};

export let createDevToolTransformer: (
  options?: Options,
) => (declarations: ResolvedDeclarations) => ResolvedDeclarations = () => declarations => declarations;

if (process.env.NODE_ENV !== 'production') {
  if (typeof document !== 'undefined') {
    // Accept both camel cased and capitalized vendor properties
    const hyphenateRegex = /(?:^(ms|moz|webkit))|[A-Z]/g;
    const propertyCache: { [property: string]: string } = {};

    // Default ignore some font face properties that doesn't exist on elements
    const defaultIgnores: (string | RegExp)[] = ['font-display', 'src', 'unicode-range'];

    function hyphenateProperty(property: string) {
      return property in propertyCache
        ? propertyCache[property]
        : (propertyCache[property] = property.replace(hyphenateRegex, '-$&').toLowerCase());
    }

    const dummy = document.createElement('div').style;

    function validateDeclaration(property: string, fullValue: string | number) {
      const [value, priority] = String(fullValue).split(/(?: !(important))$/);

      dummy.setProperty(property, value, priority);

      const isValid = dummy.length > 0;

      while (dummy.length > 0) {
        dummy.removeProperty(dummy[dummy.length - 1]);
      }

      return isValid;
    }

    type AnyObject = { [property: string]: any };

    // Copied from core/utils/debugging.ts
    const issueValue = '%o';
    function issueFormatter(message: string, object: AnyObject, highlight: AnyObject = {}) {
      const issueArgs = [];
      const issueObject: any = {};

      for (const key in object) {
        const isIssue = key in highlight;

        issueObject[isIssue ? `%c${key}%c` : key] = isIssue ? issueValue : object[key];

        if (isIssue) {
          issueArgs.push(
            'font-weight: bold; text-decoration: underline',
            'font-weight: normal; text-decoration: none',
            object[key],
          );
        }
      }

      let block = JSON.stringify(issueObject, null, 2);

      for (const key in highlight) {
        block = block.replace(`  "%c${key}%c": "${issueValue}"`, `  %c"${key}"%c: ${issueValue}`);
      }

      return [`${message}\n\n${block}`, ...issueArgs];
    }

    createDevToolTransformer = (options = {}) => {
      const ignores = defaultIgnores.concat(options.ignoreProperties || []);

      return declarations => {
        const properties = Object.keys(declarations);

        for (const property of properties) {
          const hyphenatedProperty = hyphenateProperty(property);
          const value = declarations[property];

          if (
            !ignores.every(
              ignore =>
                (typeof ignore === 'string' && ignore !== hyphenatedProperty) ||
                (ignore instanceof RegExp && !ignore.test(hyphenatedProperty)),
            )
          ) {
            continue;
          }

          if (Array.isArray(value)) {
            for (const entry of value) {
              if (!validateDeclaration(hyphenatedProperty, entry as string | number)) {
                console.warn(
                  ...issueFormatter(`The browser ignored the CSS fallback value \`${entry}\` in:`, declarations, {
                    [property]: value,
                  }),
                );
              }
            }
          } else if (value) {
            if (!validateDeclaration(hyphenatedProperty, value)) {
              console.warn(
                ...issueFormatter(`The browser ignored the CSS in:`, declarations, {
                  [property]: value,
                }),
              );
            }
          }
        }

        return declarations;
      };
    };
  }
}

export default createDevToolTransformer();
