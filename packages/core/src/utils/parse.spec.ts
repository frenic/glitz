import { parseDeclaration, parseDeclarationBlock } from './parse';

describe('parse', () => {
  it('parses declaration', () => {
    expect(parseDeclaration('color', 'red')).toBe('color:red');
    expect(parseDeclaration('backgroundColor', 'green')).toMatchInlineSnapshot(`"background-color:green"`);

    expect(parseDeclaration('msOverflowStyle', 'auto')).toMatchInlineSnapshot(`"-ms-overflow-style:auto"`);
    expect(parseDeclaration('MozAppearance', 'button')).toMatchInlineSnapshot(`"-moz-appearance:button"`);
    expect(parseDeclaration('WebkitBorderBefore', 'red')).toMatchInlineSnapshot(`"-webkit-border-before:red"`);
  });
  it('parses block', () => {
    expect(parseDeclarationBlock({ color: 'red' })).toMatchInlineSnapshot(`"color:red"`);
    expect(parseDeclarationBlock({ backgroundColor: 'green' })).toMatchInlineSnapshot(`"background-color:green"`);
    expect(parseDeclarationBlock({ color: 'blue', backgroundColor: 'transparent' })).toMatchInlineSnapshot(
      `"color:blue;background-color:transparent"`,
    );
  });
  it('parses fallback values', () => {
    expect(parseDeclarationBlock({ color: ['red', 'green'] })).toMatchInlineSnapshot(`"color:red;color:green"`);
  });
});
