import { parseDeclaration, parseDeclarationBlock } from './parse';

describe('parse', () => {
  it('parses declaration', () => {
    expect(parseDeclaration('color', 'red')).toBe('color:red');
    expect(parseDeclaration('backgroundColor', 'green')).toMatchSnapshot();

    expect(parseDeclaration('msOverflowStyle', 'auto')).toMatchSnapshot();
    expect(parseDeclaration('MozAppearance', 'button')).toMatchSnapshot();
    expect(parseDeclaration('WebkitBorderBefore', 'red')).toMatchSnapshot();
  });
  it('parses block', () => {
    expect(parseDeclarationBlock({ color: 'red' })).toMatchSnapshot();
    expect(parseDeclarationBlock({ backgroundColor: 'green' })).toMatchSnapshot();
    expect(parseDeclarationBlock({ color: 'blue', backgroundColor: 'transparent' })).toMatchSnapshot();
  });
  it('parses fallback values', () => {
    expect(parseDeclarationBlock({ color: ['red', 'green'] })).toMatchSnapshot();
  });
});
