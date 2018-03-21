import { Properties, UntransformedProperties } from '@glitz/type';

let clientValidationTransformer: (declarations: UntransformedProperties) => Properties = (
  declarations: UntransformedProperties,
) => declarations as Properties;

if (process.env.NODE_ENV !== 'production') {
  if (typeof document !== 'undefined') {
    // Accept both camel cased and capitalized vendor properties
    const hyphenateRegex = /(?:^(ms|moz|webkit))|[A-Z]/g;
    const propertyCache: { [property: string]: string } = {};

    function hyphenateProperty(property: string) {
      return property in propertyCache
        ? propertyCache[property]
        : (propertyCache[property] = property.replace(hyphenateRegex, '-$&').toLowerCase());
    }

    const dummy = document.createElement('div').style;
    function validateDeclaration(property: string, value: string | number) {
      dummy.setProperty(property, String(value));

      const isValid = dummy.length > 0;

      while (dummy.length > 0) {
        dummy.removeProperty(dummy[dummy.length - 1]);
      }

      return isValid;
    }

    clientValidationTransformer = declarations => {
      const properties = Object.keys(declarations) as Array<keyof UntransformedProperties>;

      for (const property of properties) {
        const hyphenatedProperty = hyphenateProperty(property);
        const value = declarations[property];

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
              console.warn('An invalid CSS declaration %o in %O was ignored by the browser', declaration, declarations);
            } else {
              console.warn('An invalid CSS declaration %o was ignored by the browser', declaration);
            }
          }
        }
      }

      return declarations as Properties;
    };
  }
}

export default clientValidationTransformer;
