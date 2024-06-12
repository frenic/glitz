import { resolve } from 'path';
import { typescriptDiagnostics } from '../../../../test-utils';

test('typings', () => {
  const errors = typescriptDiagnostics(resolve(__dirname, '__fixtures__/typings.tsx'));
  expect(errors.length).toBe(17);
  expect(errors[0]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 237:1 - Type '{ a: true; b: true; }' is not assignable to type 'IntrinsicAttributes & ExternalProps<{ a: boolean; b?: undefined; } | { a?: undefined; b: boolean; }>'.
      Type '{ a: true; b: true; }' is not assignable to type '{ a?: undefined; b: boolean; }'.
        Types of property 'a' are incompatible.
          Type 'true' is not assignable to type 'undefined'."
  `);
  expect(errors[1]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 239:30 - Type '{ color: ""; unknownProperty: number; }' is not assignable to type 'DirtyStyle'.
      Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Style | StyledDecorator | readonly DirtyStyle[]'."
  `);
  expect(errors[2]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 241:12 - Type '{ color: number; }' is not assignable to type 'DirtyStyle'.
      Types of property 'color' are incompatible.
        Type 'number' is not assignable to type 'Color | readonly Color[] | ((theme: Theme) => Color | readonly Color[] | undefined) | undefined'."
  `);
  expect(errors[3]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 243:24 - Argument of type '{ color: ""; unknownProperty: number; }' is not assignable to parameter of type 'Styles'.
      Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Style | StyledDecorator | readonly Style[]'."
  `);
  expect(errors[4]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 245:11 - Argument of type '{ color: number; }' is not assignable to parameter of type 'Styles'.
      Types of property 'color' are incompatible.
        Type 'number' is not assignable to type 'Color | readonly Color[] | ((theme: Theme) => Color | readonly Color[] | undefined) | undefined'."
  `);
  expect(errors[5]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 247:20 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '{ color: ""; unknownProperty: number; }' is not assignable to parameter of type 'Styles'.
          Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Style | StyledDecorator | readonly Style[]'."
  `);
  expect(errors[6]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 249:7 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '{ color: number; }' is not assignable to parameter of type 'Styles'.
          Types of property 'color' are incompatible.
            Type 'number' is not assignable to type 'Color | readonly Color[] | ((theme: Theme) => Color | readonly Color[] | undefined) | undefined'."
  `);
  expect(errors[7]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 251:43 - Type '{ color: ""; unknownProperty: number; }' is not assignable to type 'DirtyStyle'.
      Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Style | StyledDecorator | readonly DirtyStyle[]'."
  `);
  expect(errors[8]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 253:25 - Type '{ color: number; }' is not assignable to type 'DirtyStyle'.
      Types of property 'color' are incompatible.
        Type 'number' is not assignable to type 'Color | readonly Color[] | ((theme: Theme) => Color | readonly Color[] | undefined) | undefined'."
  `);
  expect(errors[9]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 255:51 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '{ color: ""; unknownProperty: number; }' is not assignable to parameter of type 'Styles'.
          Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Style | StyledDecorator | readonly Style[]'."
  `);
  expect(errors[10]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 257:38 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '{ color: number; }' is not assignable to parameter of type 'Styles'.
          Types of property 'color' are incompatible.
            Type 'number' is not assignable to type 'Color | readonly Color[] | ((theme: Theme) => Color | readonly Color[] | undefined) | undefined'."
  `);
  expect(errors[11]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 259:7 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '() => Promise<void>' is not assignable to parameter of type 'ComponentType<{}> | StyledElementLike<ComponentType<StyledElementProps>>'.
          Type '() => Promise<void>' is not assignable to type 'FunctionComponent<{}>'.
            Type 'Promise<void>' is missing the following properties from type 'ReactElement<any, any>': type, props, key"
  `);
  expect(errors[12]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 261:7 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '() => Promise<void>' is not assignable to parameter of type 'ComponentType<{}> | StyledElementLike<ComponentType<StyledElementProps>>'.
          Type '() => Promise<void>' is not assignable to type 'FunctionComponent<{}>'.
            Type 'Promise<void>' is not assignable to type 'ReactElement<any, any>'."
  `);
  expect(errors[13]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 263:1 - 'styled.button' cannot be used as a JSX component.
      Its return type 'StyledComponentWithRef<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>' is not a valid JSX element.
        Type 'StyledComponentWithRef<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>' is missing the following properties from type 'ReactElement<any, any>': type, props, key"
  `);
  expect(errors[14]).toMatchInlineSnapshot(
    `"packages/react/src/__tests__/__fixtures__/typings.tsx 266:1 - JSX element type 'NotAStyledComponent' does not have any construct or call signatures."`,
  );
  expect(errors[15]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 304:30 - Type '{ ref: RefObject<HTMLDivElement | null>; }' is not assignable to type 'IntrinsicAttributes & HtmlHTMLAttributes<HTMLButtonElement> & { css?: DirtyStyle; } & { children?: ReactNode; }'.
      Property 'ref' does not exist on type 'IntrinsicAttributes & HtmlHTMLAttributes<HTMLButtonElement> & { css?: DirtyStyle; } & { children?: ReactNode; }'."
  `);
  expect(errors[16]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 312:28 - Type '{ ref: RefObject<HTMLDivElement | null>; }' is not assignable to type 'IntrinsicAttributes & Omit<ForwardStyleProps, "compose"> & { css?: DirtyStyle; } & { children?: ReactNode; }'.
      Property 'ref' does not exist on type 'IntrinsicAttributes & Omit<ForwardStyleProps, "compose"> & { css?: DirtyStyle; } & { children?: ReactNode; }'."
  `);
});
