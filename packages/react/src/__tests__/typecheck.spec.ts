import { resolve } from 'path';
import { typescriptDiagnostics } from '../../../../test-utils';

test('typings', () => {
  const errors = typescriptDiagnostics(resolve(__dirname, '__fixtures__/typings.tsx'));
  expect(errors.length).toBe(16);
  expect(errors[0]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 229:1 - Type '{ a: true; b: true; }' is not assignable to type 'IntrinsicAttributes & ExternalProps<{ a: boolean; b?: undefined; } | { a?: undefined; b: boolean; }>'.
      Type '{ a: true; b: true; }' is not assignable to type '{ a?: undefined; b: boolean; }'.
        Types of property 'a' are incompatible.
          Type 'true' is not assignable to type 'undefined'."
  `);
  expect(errors[1]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 231:30 - Type '{ color: \\"\\"; unknownProperty: number; }' is not assignable to type 'DirtyStyle'.
      Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Style | StyledDecorator | readonly DirtyStyle[]'."
  `);
  expect(errors[2]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 233:12 - Type '{ color: number; }' is not assignable to type 'DirtyStyle'.
      Types of property 'color' are incompatible.
        Type 'number' is not assignable to type 'Color | (Color | undefined)[] | ((theme: Theme) => Color | (Color | undefined)[] | undefined) | undefined'."
  `);
  expect(errors[3]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 235:24 - Argument of type '{ color: \\"\\"; unknownProperty: number; }' is not assignable to parameter of type 'Styles'.
      Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Style | readonly Style[] | StyledDecorator'."
  `);
  expect(errors[4]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 237:11 - Argument of type '{ color: number; }' is not assignable to parameter of type 'Styles'.
      Types of property 'color' are incompatible.
        Type 'number' is not assignable to type 'Color | (Color | undefined)[] | ((theme: Theme) => Color | (Color | undefined)[] | undefined) | undefined'."
  `);
  expect(errors[5]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 239:20 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '{ color: \\"\\"; unknownProperty: number; }' is not assignable to parameter of type 'Styles'.
          Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Style | readonly Style[] | StyledDecorator'."
  `);
  expect(errors[6]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 241:7 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '{ color: number; }' is not assignable to parameter of type 'Styles'.
          Types of property 'color' are incompatible.
            Type 'number' is not assignable to type 'Color | (Color | undefined)[] | ((theme: Theme) => Color | (Color | undefined)[] | undefined) | undefined'."
  `);
  expect(errors[7]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 243:43 - Type '{ color: \\"\\"; unknownProperty: number; }' is not assignable to type 'DirtyStyle'.
      Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Style | StyledDecorator | readonly DirtyStyle[]'."
  `);
  expect(errors[8]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 245:25 - Type '{ color: number; }' is not assignable to type 'DirtyStyle'.
      Types of property 'color' are incompatible.
        Type 'number' is not assignable to type 'Color | (Color | undefined)[] | ((theme: Theme) => Color | (Color | undefined)[] | undefined) | undefined'."
  `);
  expect(errors[9]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 247:51 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '{ color: \\"\\"; unknownProperty: number; }' is not assignable to parameter of type 'Styles'.
          Object literal may only specify known properties, and 'unknownProperty' does not exist in type 'Style | readonly Style[] | StyledDecorator'."
  `);
  expect(errors[10]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 249:38 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '{ color: number; }' is not assignable to parameter of type 'Styles'.
          Types of property 'color' are incompatible.
            Type 'number' is not assignable to type 'Color | (Color | undefined)[] | ((theme: Theme) => Color | (Color | undefined)[] | undefined) | undefined'."
  `);
  expect(errors[11]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 252:2 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '() => Promise<void>' is not assignable to parameter of type 'StyledElementLike<ComponentType<StyledElementProps>> | ComponentType<{}>'.
          Type '() => Promise<void>' is not assignable to type 'FunctionComponent<{}>'.
            Type 'Promise<void>' is missing the following properties from type 'ReactElement<any, any>': type, props, key"
  `);
  expect(errors[12]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 257:2 - No overload matches this call.
      The last overload gave the following error.
        Argument of type '() => Promise<void>' is not assignable to parameter of type 'StyledElementLike<ComponentType<StyledElementProps>> | ComponentType<{}>'.
          Type '() => Promise<void>' is not assignable to type 'FunctionComponent<{}>'.
            Type 'Promise<void>' is not assignable to type 'ReactElement<any, any>'."
  `);
  expect(errors[13]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 261:1 - 'styled.button' cannot be used as a JSX component.
      Its return type 'StyledComponentWithRef<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>' is not a valid JSX element.
        Type 'StyledComponentWithRef<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>' is missing the following properties from type 'Element': type, props, key"
  `);
  expect(errors[14]).toMatchInlineSnapshot(
    `"packages/react/src/__tests__/__fixtures__/typings.tsx 264:1 - JSX element type 'NotAStyledComponent' does not have any construct or call signatures."`,
  );
  expect(errors[15]).toMatchInlineSnapshot(`
    "packages/react/src/__tests__/__fixtures__/typings.tsx 276:44 - Type '{ css: {}; ref: RefObject<unknown>; }' is not assignable to type 'IntrinsicAttributes & Pick<{ ref?: Ref<HTMLButtonElement> | undefined; }, never> & { css?: DirtyStyle; } & { children?: ReactNode; }'.
      Property 'ref' does not exist on type 'IntrinsicAttributes & Pick<{ ref?: Ref<HTMLButtonElement> | undefined; }, never> & { css?: DirtyStyle; } & { children?: ReactNode; }'."
  `);
});
