import { resolve } from 'path';
import { typescriptDiagnostics } from '../../../../test-utils';

test('typings', () => {
  const errors = typescriptDiagnostics(resolve(__dirname, '__fixtures__/typings.tsx'));
  expect(errors.length).toBe(16);
  expect(errors[0]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 228:1 - Type '{ a: true; b: true; }' is not assignable to type '(IntrinsicAttributes & { a: boolean; b?: undefined; } & { css?: Style | StyledDecorator | Style[] | undefined; } & { children?: ReactNode; }) | (IntrinsicAttributes & ... 2 more ... & { ...; })'.
      Type '{ a: true; b: true; }' is not assignable to type '{ a?: undefined; b: boolean; }'.
        Types of property 'a' are incompatible.
          Type 'true' is not assignable to type 'undefined'."
  `);
  expect(errors[1]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 230:30 - Type '{ color: \\"\\"; unknownProperty: number; }' is not assignable to type 'Style | StyledDecorator | Style[] | undefined'.
      Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Style | StyledDecorator | Style[]'."
  `);
  expect(errors[2]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 232:12 - Type '{ color: number; }' is not assignable to type 'Style | StyledDecorator | Style[] | undefined'.
      Types of property 'color' are incompatible.
        Type 'number' is not assignable to type '\\"transparent\\" | \\"inherit\\" | (string & {}) | \\"-moz-initial\\" | \\"initial\\" | \\"revert\\" | \\"unset\\" | \\"aliceblue\\" | \\"antiquewhite\\" | \\"aqua\\" | \\"aquamarine\\" | \\"azure\\" | \\"beige\\" | \\"bisque\\" | ... 172 more ... | undefined'."
  `);
  expect(errors[3]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 234:24 - Argument of type '{ color: \\"\\"; unknownProperty: number; }' is not assignable to parameter of type 'Style'.
      Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Style'."
  `);
  expect(errors[4]).toMatchInlineSnapshot(
    `"packages/react/src/__tests__/__fixtures__/typings.tsx 236:13 - Type 'number' is not assignable to type '\\"transparent\\" | \\"inherit\\" | (string & {}) | \\"-moz-initial\\" | \\"initial\\" | \\"revert\\" | \\"unset\\" | \\"aliceblue\\" | \\"antiquewhite\\" | \\"aqua\\" | \\"aquamarine\\" | \\"azure\\" | \\"beige\\" | \\"bisque\\" | ... 172 more ... | undefined'."`,
  );
  expect(errors[5]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 238:20 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '{ color: \\"\\"; unknownProperty: number; }' is not assignable to parameter of type 'Style | Style[] | undefined'.
          Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Styles'."
  `);
  expect(errors[6]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 240:7 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '{ color: number; }' is not assignable to parameter of type 'Style | Style[] | undefined'.
          Types of property 'color' are incompatible.
            Type 'number' is not assignable to type '\\"transparent\\" | \\"inherit\\" | (string & {}) | \\"-moz-initial\\" | \\"initial\\" | \\"revert\\" | \\"unset\\" | \\"aliceblue\\" | \\"antiquewhite\\" | \\"aqua\\" | \\"aquamarine\\" | \\"azure\\" | \\"beige\\" | \\"bisque\\" | ... 172 more ... | undefined'."
  `);
  expect(errors[7]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 242:43 - Type '{ color: \\"\\"; unknownProperty: number; }' is not assignable to type 'Style | StyledDecorator | Style[] | undefined'.
      Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Style | StyledDecorator | Style[]'."
  `);
  expect(errors[8]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 244:25 - Type '{ color: number; }' is not assignable to type 'Style | StyledDecorator | Style[] | undefined'.
      Types of property 'color' are incompatible.
        Type 'number' is not assignable to type '\\"transparent\\" | \\"inherit\\" | (string & {}) | \\"-moz-initial\\" | \\"initial\\" | \\"revert\\" | \\"unset\\" | \\"aliceblue\\" | \\"antiquewhite\\" | \\"aqua\\" | \\"aquamarine\\" | \\"azure\\" | \\"beige\\" | \\"bisque\\" | ... 172 more ... | undefined'."
  `);
  expect(errors[9]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 246:51 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '{ color: \\"\\"; unknownProperty: number; }' is not assignable to parameter of type 'Style | Style[] | undefined'.
          Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Styles'."
  `);
  expect(errors[10]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 248:38 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '{ color: number; }' is not assignable to parameter of type 'Style | Style[] | undefined'.
          Types of property 'color' are incompatible.
            Type 'number' is not assignable to type '\\"transparent\\" | \\"inherit\\" | (string & {}) | \\"-moz-initial\\" | \\"initial\\" | \\"revert\\" | \\"unset\\" | \\"aliceblue\\" | \\"antiquewhite\\" | \\"aqua\\" | \\"aquamarine\\" | \\"azure\\" | \\"beige\\" | \\"bisque\\" | ... 172 more ... | undefined'."
  `);
  expect(errors[11]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 250:7 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '() => Promise<unknown>' is not assignable to parameter of type 'FunctionComponent<{}> | StyledElementLike<ComponentType<StyledElementProps>> | ComponentClass<{}, any>'.
          Type '() => Promise<unknown>' is not assignable to type 'FunctionComponent<{}>'.
            Type 'Promise<unknown>' is missing the following properties from type 'ReactElement<any, any>': type, props, key"
  `);
  expect(errors[12]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 252:7 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '() => Promise<unknown>' is not assignable to parameter of type 'FunctionComponent<{}> | StyledElementLike<ComponentType<StyledElementProps>> | ComponentClass<{}, any>'.
          Type '() => Promise<unknown>' is not assignable to type 'FunctionComponent<{}>'.
            Type 'Promise<unknown>' is not assignable to type 'ReactElement<any, any>'."
  `);
  expect(errors[13]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 254:1 - 'styled.button' cannot be used as a JSX component.
      Its return type 'StyledComponentWithRef<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>' is not a valid JSX element.
        Type 'StyledComponentWithRef<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>' is missing the following properties from type 'Element': type, props, key"
  `);
  expect(errors[14]).toMatchInlineSnapshot(
    `"packages/react/src/__tests__/__fixtures__/typings.tsx 257:1 - JSX element type 'NotAStyledComponent' does not have any construct or call signatures."`,
  );
  expect(errors[15]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 269:44 - Type '{ css: {}; ref: RefObject<unknown>; }' is not assignable to type 'IntrinsicAttributes & Pick<{ ref?: ((instance: HTMLButtonElement | null) => void) | RefObject<HTMLButtonElement> | null | undefined; }, never> & { ...; } & { ...; }'.
      Property 'ref' does not exist on type 'IntrinsicAttributes & Pick<{ ref?: ((instance: HTMLButtonElement | null) => void) | RefObject<HTMLButtonElement> | null | undefined; }, never> & { ...; } & { ...; }'."
  `);
});
