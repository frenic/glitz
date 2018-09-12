import { Properties, UntransformedProperties } from '@glitz/type';

export type Options = {
  ignoreProperties?: string | RegExp | Array<string | RegExp>;
};

export let createDevToolTransformer: (
  options?: Options,
) => (declarations: UntransformedProperties) => Properties = () => (declarations: UntransformedProperties) =>
  declarations as Properties;

if (process.env.NODE_ENV !== 'production') {
  if (typeof document !== 'undefined') {
    // Accept both camel cased and capitalized vendor properties
    const hyphenateRegex = /(?:^(ms|moz|webkit))|[A-Z]/g;
    const propertyCache: { [property: string]: string } = {};

    // Default ignore some font face properties that doesn't exist on elements
    const defaultIgnores: Array<string | RegExp> = ['font-display', 'src', 'unicode-range'];

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

    createDevToolTransformer = (options = {}) => {
      const ignores = defaultIgnores.concat(options.ignoreProperties || []);

      return declarations => {
        const properties = Object.keys(declarations) as Array<keyof UntransformedProperties>;

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
                const declaration = { [property]: entry };

                if (properties.length > 1) {
                  console.warn(
                    'An invalid CSS fallback declaration %o with values %O in %O was ignored by the browser',
                    declaration,
                    value,
                    declarations,
                  );
                } else {
                  console.warn(
                    'An invalid CSS fallback declaration %o in %O was ignored by the browser',
                    declaration,
                    declarations,
                  );
                }
              }
            }
          } else {
            if (!validateDeclaration(hyphenatedProperty, value as string | number)) {
              const declaration = { [property]: value };

              if (properties.length > 1) {
                console.warn(
                  'An invalid CSS declaration %o in %O was ignored by the browser',
                  declaration,
                  declarations,
                );
              } else {
                console.warn('An invalid CSS declaration %o was ignored by the browser', declaration);
              }
            }
          }
        }

        return declarations as Properties;
      };
    };
  }
}

export default createDevToolTransformer();
