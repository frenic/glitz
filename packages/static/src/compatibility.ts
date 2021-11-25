import * as ts from 'typescript';

/** TODO: Remove for next major release */
export function createImportSpecifier(
  factory: ts.NodeFactory,
  isTypeOnly: boolean,
  propertyName: ts.Identifier | undefined,
  name: ts.Identifier,
): ts.ImportSpecifier {
  if (factory.createImportSpecifier.length === 2) {
    // For <= TS4.4
    return (
      factory.createImportSpecifier as unknown as (
        propertyName: ts.Identifier | undefined,
        name: ts.Identifier,
      ) => ts.ImportSpecifier
    )(propertyName, name);
  }

  return factory.createImportSpecifier(isTypeOnly, propertyName, name);
}
