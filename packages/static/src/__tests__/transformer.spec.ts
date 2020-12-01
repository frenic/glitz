import compile, { Code, TransformerDiagnostics } from './compile';

test('can extract simple component', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <Styled id="some-id">hello</Styled>;
}

const styleObject = {
  width: '100%',
  height: '100%'
};
const Styled = styled.div(styleObject);
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      function MyComponent(props) {
          return <div id=\\"some-id\\" className={\\"a b\\"} data-glitzname=\\"Styled\\">hello</div>;
      }
      const styleObject = {
          width: '100%',
          height: '100%'
      };
      const Styled = /*#__PURE__*/ styled.div(styleObject);
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{height:100%}.b{width:100%}"`);
  });
});

test('can use applyClassName', () => {
  const code = {
    'file1.tsx': `
export function MainLink(props: any) {
    return <a {...props} />;
}
`,
    'file2.tsx': `
import { styled, applyClassName } from '@glitz/react';
import { MainLink } from './file1';

export default styled(applyClassName(MainLink), {
  color: 'ìnherit',
  ':hover': {
    textDecoration: 'underline',
    color: 'inherit',
  },
  ':visited': {
    color: 'inherit',
  },
});
`,
    'file3.tsx': `
import { styled, applyClassName } from '@glitz/react';
export const Link1 = (props: any) => {
    return <a {...props} />;
}
export function Link2(props: any) {
  return <a {...props} />;
}
function Link3(props: any) {
  return <a {...props} />;
}
const Link4 = (props: any) => {
  return <a {...props} />;
}

export const ExportedStyledLink1 = styled(applyClassName(Link1), {
  color: 'blue',
});
export const ExportedStyledLink2 = styled(applyClassName(Link2), {
  color: 'green',
});
export const ExportedStyledLink3 = styled(applyClassName(Link3), {
  color: 'yellow',
});
export const ExportedStyledLink4 = styled(applyClassName(Link4), {
  color: 'purple',
});
`,
    'file4.tsx': `
import { styled, applyClassName } from '@glitz/react';
import { MainLink } from './file1';

export default styled(applyClassName(MainLink), {
  color: 'ìnherit',
  ':hover': {
    textDecoration: 'underline',
    color: 'inherit',
  },
  ':visited': {
    color: 'inherit',
  },
});
`,
    'file5.tsx': `
import { styled, applyClassName } from '@glitz/react';
import { ExportedStyledLink1, ExportedStyledLink2, ExportedStyledLink3, ExportedStyledLink4 } from './file3';
import TheMainLink from './file2';
import TheOtherMainLink from './file4';

function Link(props: any) {
    return <a {...props} />;
}

const blockify = (c: any) =>
  styled(applyClassName(c), {
    display: 'block',
  });

const Block = blockify((props: any) => <styled.Div />);

const StyledLink = styled(applyClassName(Link), {
  color: 'red',
});

const node1 = <StyledLink />;
const node2 = <ExportedStyledLink1 />;
const node3 = <ExportedStyledLink2 />;
const node4 = <ExportedStyledLink3 />;
const node5 = <ExportedStyledLink4 />;
const node6 = <Block />;
const node7 = <TheMainLink />;
const node8 = <TheOtherMainLink />;
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "export function MainLink(props) {
            return <a {...props}/>;
        }
        "
      `),
        expect(result['file2.jsx']).toMatchInlineSnapshot(`
          "import { styled, applyClassName } from '@glitz/react';
          import { MainLink } from './file1';
          export default /*#__PURE__*/ styled(applyClassName(MainLink), {
              color: 'ìnherit',
              ':hover': {
                  textDecoration: 'underline',
                  color: 'inherit',
              },
              ':visited': {
                  color: 'inherit',
              },
          });
          "
        `),
        expect(result['file3.jsx']).toMatchInlineSnapshot(`
                  "import { styled, applyClassName } from '@glitz/react';
                  export const Link1 = (props) => {
                      return <a {...props}/>;
                  };
                  export function Link2(props) {
                      return <a {...props}/>;
                  }
                  function Link3(props) {
                      return <a {...props}/>;
                  }
                  const Link4 = (props) => {
                      return <a {...props}/>;
                  };
                  export const ExportedStyledLink1 = /*#__PURE__*/ styled(applyClassName(Link1), {
                      color: 'blue',
                  });
                  export const ExportedStyledLink2 = /*#__PURE__*/ styled(applyClassName(Link2), {
                      color: 'green',
                  });
                  export const ExportedStyledLink3 = /*#__PURE__*/ styled(applyClassName(Link3), {
                      color: 'yellow',
                  });
                  export const ExportedStyledLink4 = /*#__PURE__*/ styled(applyClassName(Link4), {
                      color: 'purple',
                  });
                  "
              `);
      expect(result['file4.jsx']).toMatchInlineSnapshot(`
        "import { styled, applyClassName } from '@glitz/react';
        import { MainLink } from './file1';
        export default /*#__PURE__*/ styled(applyClassName(MainLink), {
            color: 'ìnherit',
            ':hover': {
                textDecoration: 'underline',
                color: 'inherit',
            },
            ':visited': {
                color: 'inherit',
            },
        });
        "
      `);
      expect(result['file5.jsx']).toMatchInlineSnapshot(`
        "import { styled, applyClassName } from '@glitz/react';
        import { Link1 as AutoImportedLink1 } from \\"./file3\\";
        import { Link2 as AutoImportedLink2 } from \\"./file3\\";
        import { MainLink as AutoImportedMainLink } from \\"./file1\\";
        import { ExportedStyledLink1, ExportedStyledLink2, ExportedStyledLink3, ExportedStyledLink4 } from './file3';
        import TheMainLink from './file2';
        import TheOtherMainLink from './file4';
        function Link(props) {
            return <a {...props}/>;
        }
        const blockify = (c) => /*#__PURE__*/ styled(applyClassName(c), {
            display: 'block',
        });
        const Block = /*#__PURE__*/ blockify((props) => <styled.Div />);
        const StyledLink = /*#__PURE__*/ styled(applyClassName(Link), {
            color: 'red',
        });
        const node1 = <Link className={\\"f\\"}/>;
        const node2 = <AutoImportedLink1 className={\\"a\\"}/>;
        const node3 = <AutoImportedLink2 className={\\"b\\"}/>;
        const node4 = <ExportedStyledLink3 />;
        const node5 = <ExportedStyledLink4 />;
        const node6 = <Block />;
        const node7 = <AutoImportedMainLink className={\\"g h i j\\"}/>;
        const node8 = <AutoImportedMainLink className={\\"g h i j\\"}/>;
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(
        `".a{color:blue}.b{color:green}.c{color:yellow}.d{color:purple}.e{display:block}.f{color:red}.j{color:ìnherit}.g:visited{color:inherit}.h:hover{color:inherit}.i:hover{text-decoration:underline}"`,
      );
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "line": 1,
            "message": "Functions in style objects requires runtime or statically declared themes",
            "severity": "info",
            "source": "export function MainLink(props: any) {
            return <a {...props} />;
        }",
          },
          Object {
            "file": "file1.tsx",
            "line": 1,
            "message": "Functions in style objects requires runtime or statically declared themes",
            "severity": "info",
            "source": "export function MainLink(props: any) {
            return <a {...props} />;
        }",
          },
          Object {
            "file": "file3.tsx",
            "line": 21,
            "message": "Unable to determine static component/element name",
            "severity": "info",
            "source": "Link3",
          },
          Object {
            "file": "file3.tsx",
            "line": 24,
            "message": "Unable to determine static component/element name",
            "severity": "info",
            "source": "Link4",
          },
          Object {
            "file": "file5.tsx",
            "line": 11,
            "message": "Unable to determine static component/element name",
            "severity": "info",
            "source": "c",
          },
        ]
      `),
  );
});

test('can use glitz core', () => {
  const code = {
    'file1.tsx': `
import { media, query } from '@glitz/core';
import { styled } from '@glitz/react';

const BREAKPOINT = 768;
const MOBILE_MAX_WIDTH = query({ maxWidth: '100px' });
const DESKTOP_MIN_WIDTH = query({ minWidth: '101px' });

export function createMobileDecorator(mobileStyle: any) {
  return styled(media(MOBILE_MAX_WIDTH, mobileStyle));
}

export function createDesktopDecorator(desktopStyle: any) {
  return styled(media(DESKTOP_MIN_WIDTH, desktopStyle));
}

const decorator = createMobileDecorator({ gridTemplate: { areas: '"a" "b"', columns: '1fr' } });
const Styled = styled.div(decorator);

const node = <Styled />;
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { media, query } from '@glitz/core';
        import { styled } from '@glitz/react';
        const BREAKPOINT = 768;
        const MOBILE_MAX_WIDTH = /*#__PURE__*/ query({ maxWidth: '100px' });
        const DESKTOP_MIN_WIDTH = query({ minWidth: '101px' });
        export function createMobileDecorator(mobileStyle) {
            return /*#__PURE__*/ styled(media(MOBILE_MAX_WIDTH, mobileStyle));
        }
        export function createDesktopDecorator(desktopStyle) {
            return /*#__PURE__*/ styled(media(DESKTOP_MIN_WIDTH, desktopStyle));
        }
        const decorator = /*#__PURE__*/ createMobileDecorator({ gridTemplate: { areas: '\\"a\\" \\"b\\"', columns: '1fr' } });
        const Styled = /*#__PURE__*/ styled.div(decorator);
        const node = <div className={\\"a b\\"} data-glitzname=\\"Styled\\"/>;
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(
        `"@media (max-width: 100px){.a{grid-template-columns:1fr}.b{grid-template-areas:\\"a\\" \\"b\\"}}"`,
      );
    },
    diagnostics => expect(diagnostics).toMatchInlineSnapshot(`Array []`),
  );
});

test('can handle React.useMemo()', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
import * as React from 'react';

function MyComponent(props: {}) {
  const styleObject = React.useMemo(() => {
    return {
      width: '100%',
      height: '100%',
    };
  }, []);
  const Styled = styled.div(styleObject);

  return <Styled id="some-id">hello</Styled>;
}
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        import * as React from 'react';
        function MyComponent(props) {
            const styleObject = /*#__PURE__*/ React.useMemo(() => {
                return {
                    width: '100%',
                    height: '100%',
                };
            }, []);
            const Styled = /*#__PURE__*/ styled.div(styleObject);
            return <div id=\\"some-id\\" className={\\"a b\\"} data-glitzname=\\"Styled\\">hello</div>;
        }
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`".a{height:100%}.b{width:100%}"`);
    },
    diagnostics => expect(diagnostics).toMatchInlineSnapshot(`Array []`),
  );
});

test('can handle simple ternaries in the css prop', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';

function Component(props: { isStyled: boolean; isLarge: boolean }) {
  const marginTop = props.isStyled ? '10px' : '20px';
  return (
    <div>
      <styled.Div css={{ marginTop }}>What color am I?</styled.Div>
      <styled.Div css={{ backgroundColor: props.isStyled ? 'green' : 'blue' }}>What color am I?</styled.Div>
      <styled.Div css={{ backgroundColor: props.isStyled ? 'green' : 'blue', color: props.isStyled ? 'red' : 'black', marginTop: props.isLarge ? '10px' : '1px' }}>What color am I?</styled.Div>
      <styled.Div css={{ backgroundColor: props.isStyled ? 'green' : 'blue', color: 'red' }}>What color am I?</styled.Div>
      <styled.Div css={{ backgroundColor: props.isStyled ? 'green' : 'blue', color: 'red', marginTop: props.isLarge ? '10px' : '1px' }}>What color am I?</styled.Div>
      <styled.Div css={{ ['@media (min-width: 768px)']: { width: props.isLarge ? '10px' : '1px' } }}>What color am I?</styled.Div>
    </div>
  );
}
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        function Component(props) {
            const marginTop = props.isStyled ? '10px' : '20px';
            return (<div>
              <div className={props.isStyled ? \\"a\\" : \\"b\\"} data-glitzname=\\"styled.Div\\">What color am I?</div>
              <div className={props.isStyled ? \\"c\\" : \\"d\\"} data-glitzname=\\"styled.Div\\">What color am I?</div>
              <div className={(props.isStyled ? \\"c\\" : \\"d\\") + \\" \\" + ((props.isStyled ? \\"e\\" : \\"f\\") + \\" \\") + (props.isLarge ? \\"a\\" : \\"g\\")} data-glitzname=\\"styled.Div\\">What color am I?</div>
              <div className={\\"e \\" + (props.isStyled ? \\"c\\" : \\"d\\")} data-glitzname=\\"styled.Div\\">What color am I?</div>
              <div className={\\"e \\" + ((props.isStyled ? \\"c\\" : \\"d\\") + \\" \\") + (props.isLarge ? \\"a\\" : \\"g\\")} data-glitzname=\\"styled.Div\\">What color am I?</div>
              <styled.Div css={{ ['@media (min-width: 768px)']: { width: props.isLarge ? '10px' : '1px' } }}>What color am I?</styled.Div>
            </div>);
        }
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(
        `".a{margin-top:10px}.b{margin-top:20px}.c{background-color:green}.d{background-color:blue}.e{color:red}.f{color:black}.g{margin-top:1px}"`,
      );
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 12,
              "message": "Could not determine a static value for: props",
              "severity": "info",
              "source": "props",
            },
            "line": 12,
            "message": "Unable to statically evaluate css prop",
            "severity": "info",
            "source": "<styled.Div css={{ ['@media (min-width: 768px)']: { width: props.isLarge ? '10px' : '1px' } }}>",
          },
        ]
      `),
  );
});

test('transforms inline decorator in css prop', () => {
  const code = {
    'themes.ts': `
export const staticThemes = [{
  id: 'red',
  color: 'red',
  backgroundColor: 'lightblue',
}, {
  id: 'blue',
  color: 'blue',
  backgroundColor: 'lightblue',
}, {
  id: 'black',
  color: 'black',
  backgroundColor: 'lightblue',
}];
`,
    'file1.tsx': `
import { styled } from '@glitz/react';

function createSomeDecorator() {
  return styled({ backgroundColor: 'blue' });
}
function createOtherDecorator() {
  return styled({ backgroundColor: 'red' });
}

export function exportedDecorator() {
  return styled({ display: 'inline' });
}

function GridLayout(props: { children: any, layout: string, color?: string }) {
  const dynamic = () => {
    const gridDecorator = styled({ display: 'grid', gridGap: '10px' });

    switch (props.layout) {
      case 'Auto':
        return styled(createOtherDecorator(), {
          display: 'flex',
          gap: '10px',
        });
      case 'HalfHalf':
        return styled(
          gridDecorator,
          createSomeDecorator(),
          createOtherDecorator(),
        );
      case 'Full':
        return styled({ backgroundColor: t => t.backgroundColor });
      default:
        return styled({ color: t => t.color });
    }
  };

  const superDynamic = () => {
    if (!props.layout) {
      return styled({ backgroundColor: props.color });
    } else {
      return styled({ backgroundColor: 'red' });
    }
  }

  return (
    <>
      <styled.Div css={dynamic} />
      <styled.Div css={superDynamic()}>Super dynamic</styled.Div>
      <styled.Div css={exportedDecorator} />
      <styled.Div css={{ color: t => props.color ? t.color : t.backgroundColor }} />
    </>
  );
}
`,
  };

  expectEqual(
    compile(code, { staticThemesFile: 'themes.ts' }),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        import { useTheme as useGlitzTheme } from \\"@glitz/react\\";
        import(\\"./themes\\");
        function createSomeDecorator() {
            return /*#__PURE__*/ styled({ backgroundColor: 'blue' });
        }
        function createOtherDecorator() {
            return /*#__PURE__*/ styled({ backgroundColor: 'red' });
        }
        export function exportedDecorator() {
            return /*#__PURE__*/ styled({ display: 'inline' });
        }
        function GridLayout(props) {
            const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
            const dynamic = () => {
                const gridDecorator = /*#__PURE__*/ styled({ display: 'grid', gridGap: '10px' });
                switch (props.layout) {
                    case 'Auto':
                        return \\"a b c\\";
                    case 'HalfHalf':
                        return \\"c d e\\";
                    case 'Full':
                        return \\"f\\";
                    default:
                        return __glitzTheme.color === \\"black\\" ? \\"i\\" : __glitzTheme.color === \\"blue\\" ? \\"h\\" : __glitzTheme.color === \\"red\\" ? \\"g\\" : (() => { throw new Error(\\"Unexpected theme, this theme did not exist during compile time: \\" + JSON.stringify(__glitzTheme)); })();
                }
            };
            const superDynamic = () => {
                if (!props.layout) {
                    return /*#__PURE__*/ styled({ backgroundColor: props.color });
                }
                else {
                    return /*#__PURE__*/ styled({ backgroundColor: 'red' });
                }
            };
            return (<>
              <div className={dynamic()} data-glitzname=\\"styled.Div\\"/>
              <styled.Div css={superDynamic()}>Super dynamic</styled.Div>
              <styled.Div css={exportedDecorator}/>
              <styled.Div css={{ color: t => props.color ? t.color : t.backgroundColor }}/>
            </>);
        }
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(
        `".a{gap:10px}.b{display:flex}.c{background-color:red}.d{grid-gap:10px}.e{display:grid}.f{background-color:lightblue}.g{color:red}.h{color:blue}.i{color:black}"`,
      );
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 39,
              "message": "could not statically evaluate styles",
              "severity": "info",
              "source": "return styled({ backgroundColor: props.color });",
            },
            "line": 39,
            "message": "Unable to evaluate return statement",
            "severity": "info",
            "source": "return styled({ backgroundColor: props.color });",
          },
          Object {
            "file": "file1.tsx",
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 39,
              "message": "Could not determine a static value for: props",
              "severity": "info",
              "source": "props",
            },
            "line": 48,
            "message": "Unable to statically evaluate css prop",
            "severity": "info",
            "source": "<styled.Div css={superDynamic()}>",
          },
          Object {
            "file": "file1.tsx",
            "line": 10,
            "message": "Cannot rewrite decorator since it is exported",
            "severity": "info",
            "source": "export function exportedDecorator() {
          return styled({ display: 'inline' });
        }",
          },
          Object {
            "file": "file1.tsx",
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 50,
              "message": "Could not determine a static value for: props",
              "severity": "info",
              "source": "props",
            },
            "line": 50,
            "message": "Evaluation of theme function requires runtime",
            "severity": "info",
            "source": "<styled.Div css={{ color: t => props.color ? t.color : t.backgroundColor }} />",
          },
        ]
      `),
  );
});

test('does not inject useGlitzTheme inside functions inside a component', () => {
  const code = {
    'themes.ts': `
export const staticThemes = [{
  id: 'black',
  color: 'black',
  backgroundColor: 'lightblue',
}];
`,
    'file1.tsx': `
import { styled } from '@glitz/react';

function Items1() {
  const items = [1, 2, 3];
  return (
    <>
      {items.map(i => <Item>{i}</Item>)}
    </>
  );
}

function Items2() {
  const items = [1, 2, 3];
  if ((window as any).someThing) {
    return null;
  } else {
    return (
      <>
        {items.map(i => <Item>{i}</Item>)}
      </>
    );
  }
}

function Items3() {
  const items = [1, 2, 3];
  const itemsJsx = items.map(function (i) { return <Item>{i}</Item>; });
  return (
    <>
      {itemsJsx}
    </>
  );
}

const Item = styled.div({
  backgroundColor: t => t.backgroundColor,
  color: t => t.color,
});
`,
  };

  expectEqual(
    compile(code, { staticThemesFile: 'themes.ts' }),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        import { useTheme as useGlitzTheme } from \\"@glitz/react\\";
        import(\\"./themes\\");
        function Items1() {
            const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
            const items = [1, 2, 3];
            return (<>
              {items.map(i => <div className={\\"a b\\"} data-glitzname=\\"Item\\">{i}</div>)}
            </>);
        }
        function Items2() {
            const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
            const items = [1, 2, 3];
            if (window.someThing) {
                return null;
            }
            else {
                return (<>
                {items.map(i => <div className={\\"a b\\"} data-glitzname=\\"Item\\">{i}</div>)}
              </>);
            }
        }
        function Items3() {
            const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
            const items = [1, 2, 3];
            const itemsJsx = items.map(function (i) { return <div className={\\"a b\\"} data-glitzname=\\"Item\\">{i}</div>; });
            return (<>
              {itemsJsx}
            </>);
        }
        const Item = /*#__PURE__*/ styled.div({
            backgroundColor: t => t.backgroundColor,
            color: t => t.color,
        });
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`".a{color:black}.b{background-color:lightblue}"`);
    },
    diagnostics => expect(diagnostics).toMatchInlineSnapshot(`Array []`),
  );
});

test('bails if it finds a comment that it should skip', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return (
      <>
        <Styled1 id="some-id">hello</Styled1>
        <Styled2 id="some-id">hello</Styled2>
        <Styled3 id="some-id">hello</Styled3>
        <styled.Div css={/* @glitz-dynamic */ { width: '100%' }} />
        <styled.Div 
          /* @glitz-dynamic */ 
          css={{ width: '100%' }}
        />
        <styled.Div 
          // @glitz-dynamic
          css={{ width: '100%' }}
        />
        <styled.Div css={{ width: '100%' }} />
      </>
    );
}

/** @glitz-dynamic */
const Styled1 = styled.div({
    width: '100%',
    height: '100%'
});

/* @glitz-dynamic */
const Styled2 = styled.div({
    width: '100%',
    height: '100%'
});

// @glitz-dynamic
const Styled3 = styled.div({
    width: '100%',
    height: '100%'
});
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        function MyComponent(props) {
            return (<>
                <Styled1 id=\\"some-id\\">hello</Styled1>
                <Styled2 id=\\"some-id\\">hello</Styled2>
                <Styled3 id=\\"some-id\\">hello</Styled3>
                <styled.Div css={{ width: '100%' }}/>
                <styled.Div 
            /* @glitz-dynamic */
            css={{ width: '100%' }}/>
                <styled.Div 
            // @glitz-dynamic
            css={{ width: '100%' }}/>
                <div className={\\"a\\"} data-glitzname=\\"styled.Div\\"/>
              </>);
        }
        /** @glitz-dynamic */
        const Styled1 = /*#__PURE__*/ styled.div({
            width: '100%',
            height: '100%'
        });
        /* @glitz-dynamic */
        const Styled2 = /*#__PURE__*/ styled.div({
            width: '100%',
            height: '100%'
        });
        // @glitz-dynamic
        const Styled3 = /*#__PURE__*/ styled.div({
            width: '100%',
            height: '100%'
        });
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`".a{width:100%}"`);
    },
    diagnostics => expect(diagnostics).toMatchInlineSnapshot(`Array []`),
  );
});

test('bails all if it finds a comment that it should skip', () => {
  const code = {
    'file1.tsx': `
/** @glitz-all-dynamic */
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <Styled1 id="some-id"><Styled2 /></Styled1>;
}

const Styled1 = styled.div({
    width: '100%',
    height: '100%'
});

const Styled2 = styled.div({
    width: '100%',
    height: '100%'
});
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "/** @glitz-all-dynamic */
      import { styled } from '@glitz/react';
      function MyComponent(props) {
          return <Styled1 id=\\"some-id\\"><Styled2 /></Styled1>;
      }
      const Styled1 = styled.div({
          width: '100%',
          height: '100%'
      });
      const Styled2 = styled.div({
          width: '100%',
          height: '100%'
      });
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`""`);
  });
});

test('warns when a component cannot be extracted but a comment says it should', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <Styled id="some-id">hello</Styled>;
}

/** @glitz-static */
const Styled = styled.div({
    width: (window as any).theWidth,
    height: '100%'
});
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        function MyComponent(props) {
            return <Styled id=\\"some-id\\">hello</Styled>;
        }
        /** @glitz-static */
        const Styled = /*#__PURE__*/ styled.div({
            width: window.theWidth,
            height: '100%'
        });
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`""`);
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 8,
              "message": "Unable to resolve identifier 'window'",
              "severity": "error",
              "source": "window",
            },
            "line": 7,
            "message": "Unable to statically evaluate to a component or element",
            "severity": "error",
            "source": "styled.div({
            width: (window as any).theWidth,
            height: '100%'
        })",
          },
        ]
      `),
  );
});

test('diagnostics can be suppressed', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <Styled id="some-id">hello</Styled>;
}

/** @glitz-suppress */
const Styled = styled.div({
    width: (window as any).theWidth,
    height: '100%'
});
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        function MyComponent(props) {
            return <Styled id=\\"some-id\\">hello</Styled>;
        }
        /** @glitz-suppress */
        const Styled = /*#__PURE__*/ styled.div({
            width: window.theWidth,
            height: '100%'
        });
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`""`);
    },
    diagnostics => expect(diagnostics).toMatchInlineSnapshot(`Array []`),
  );
});

test('adds info diagnostics when it cannot evaluate', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <Styled id="some-id">hello</Styled>;
}

const Styled = styled.div({
    width: (theme) => theme.theWidth,
    height: '100%'
});
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        function MyComponent(props) {
            return <Styled id=\\"some-id\\">hello</Styled>;
        }
        const Styled = /*#__PURE__*/ styled.div({
            width: (theme) => theme.theWidth,
            height: '100%'
        });
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`".a{height:100%}"`);
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "line": 7,
            "message": "Functions in style objects requires runtime or statically declared themes",
            "severity": "info",
            "source": "(theme) => theme.theWidth",
          },
        ]
      `),
  );
});

test('adds info diagnostics when it does not evaluate to a static component but will still be a runtime styled component', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <Styled id="some-id">hello</Styled>;
}

function createStyledComponent() {
  return styled(() => <styled.Div />, {
      width: (window as any).theWidth,
      height: '100%'
  });
}

const Styled = createStyledComponent();
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        function MyComponent(props) {
            return <Styled id=\\"some-id\\">hello</Styled>;
        }
        function createStyledComponent() {
            return /*#__PURE__*/ styled(() => <styled.Div />, {
                width: window.theWidth,
                height: '100%'
            });
        }
        const Styled = createStyledComponent();
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`""`);
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 8,
              "message": "Unable to resolve identifier 'window'",
              "severity": "info",
              "source": "window",
            },
            "line": 13,
            "message": "Unable to statically evaluate to a component or element",
            "severity": "info",
            "source": "createStyledComponent()",
          },
        ]
      `),
  );
});

test('warns when a component cannot be extracted but a comment says all should', () => {
  const code = {
    'file1.tsx': `
/** @glitz-all-static */
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <Styled1 id="some-id"><Styled2 /></Styled1>;
}

const Styled1 = styled.div({
    width: (window as any).theWidth,
    height: '100%'
});

const Styled2 = styled.div({
    width: '100%',
    height: (window as any).theHeight
});
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "/** @glitz-all-static */
        import { styled } from '@glitz/react';
        function MyComponent(props) {
            return <Styled1 id=\\"some-id\\"><Styled2 /></Styled1>;
        }
        const Styled1 = /*#__PURE__*/ styled.div({
            width: window.theWidth,
            height: '100%'
        });
        const Styled2 = /*#__PURE__*/ styled.div({
            width: '100%',
            height: window.theHeight
        });
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`""`);
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 8,
              "message": "Unable to resolve identifier 'window'",
              "severity": "error",
              "source": "window",
            },
            "line": 7,
            "message": "Unable to statically evaluate to a component or element",
            "severity": "error",
            "source": "styled.div({
            width: (window as any).theWidth,
            height: '100%'
        })",
          },
          Object {
            "file": "file1.tsx",
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 14,
              "message": "Unable to resolve identifier 'window'",
              "severity": "error",
              "source": "window",
            },
            "line": 12,
            "message": "Unable to statically evaluate to a component or element",
            "severity": "error",
            "source": "styled.div({
            width: '100%',
            height: (window as any).theHeight
        })",
          },
        ]
      `),
  );
});

test('can extract derived component', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <DerivedStyled onClick={() => alert('woah!')}>hello</DerivedStyled>;
}

const Styled = styled.div({
    width: '100%',
    height: '100%'
});

const DerivedStyled = styled(Styled, {
  backgroundColor: 'black',
});
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      function MyComponent(props) {
          return <div onClick={() => alert('woah!')} className={\\"c a b\\"} data-glitzname=\\"DerivedStyled\\">hello</div>;
      }
      const Styled = /*#__PURE__*/ styled.div({
          width: '100%',
          height: '100%'
      });
      const DerivedStyled = /*#__PURE__*/ styled(Styled, {
          backgroundColor: 'black',
      });
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{height:100%}.b{width:100%}.c{background-color:black}"`);
  });
});

test('correctly handles media queries', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <><Styled>hello</Styled><MediaComp /></>;
}

const Styled = styled.div({
    [largeScreen()]: { width: '50%', height: '50%' },
    [smallScreen()]: { width: '100%', height: '100%' },
    background: '#000',
});

function createCompactStyled(compactStyle: Object, style: Object) {
  return styled(compactStyle)({ '@media (min-width: 768px)': style });
}
const MediaComp = createCompactStyled({ margin: '10px' }, { margin: '20px' })(styled.Div);

function largeScreen() {
  return '@media (min-width: 768px)';
}
function smallScreen() {
  return '@media (max-width: 768px)';
}
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      function MyComponent(props) {
          return <><div className={\\"a c d e f\\"} data-glitzname=\\"Styled\\">hello</div><div className={\\"g b\\"} data-glitzname=\\"MediaComp\\"/></>;
      }
      const Styled = /*#__PURE__*/ styled.div({
          [largeScreen()]: { width: '50%', height: '50%' },
          [smallScreen()]: { width: '100%', height: '100%' },
          background: '#000',
      });
      function createCompactStyled(compactStyle, style) {
          return /*#__PURE__*/ styled(compactStyle)({ '@media (min-width: 768px)': style });
      }
      const MediaComp = /*#__PURE__*/ createCompactStyled({ margin: '10px' }, { margin: '20px' })(styled.Div);
      function largeScreen() {
          return '@media (min-width: 768px)';
      }
      function smallScreen() {
          return '@media (max-width: 768px)';
      }
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(
      `".a{background:#000}.b{margin:10px}@media (max-width: 768px){.c{height:100%}.d{width:100%}}@media (min-width: 768px){.e{height:50%}.f{width:50%}.g{margin:20px}}"`,
    );
  });
});

test('can use an inline component', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <styled.Div css={{backgroundColor: 'black'}}>hello</styled.Div>;
}
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      function MyComponent(props) {
          return <div className={\\"a\\"} data-glitzname=\\"styled.Div\\">hello</div>;
      }
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{background-color:black}"`);
  });
});

test('components can have the same name in different files', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <Styled>hello1</Styled>;
}

const Styled = styled.div({
    backgroundColor: 'black',
});
`,
    'file2.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <Styled>hello2</Styled>;
}

const Styled = styled.div({
    backgroundColor: 'red',
});
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      function MyComponent(props) {
          return <div className={\\"a\\"} data-glitzname=\\"Styled\\">hello1</div>;
      }
      const Styled = /*#__PURE__*/ styled.div({
          backgroundColor: 'black',
      });
      "
    `);
    expect(result['file2.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      function MyComponent(props) {
          return <div className={\\"b\\"} data-glitzname=\\"Styled\\">hello2</div>;
      }
      const Styled = /*#__PURE__*/ styled.div({
          backgroundColor: 'red',
      });
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{background-color:black}.b{background-color:red}"`);
  });
});

test('components can have the same name in the same file', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent1(props: {}) {
    const Styled = styled.div({
        backgroundColor: 'black',
    });
    return <Styled>hello1</Styled>;
}
function MyComponent2(props: {}) {
  const Styled = styled.div({
      backgroundColor: 'red',
  });
  return <Styled>hello2</Styled>;
}
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      function MyComponent1(props) {
          const Styled = /*#__PURE__*/ styled.div({
              backgroundColor: 'black',
          });
          return <div className={\\"a\\"} data-glitzname=\\"Styled\\">hello1</div>;
      }
      function MyComponent2(props) {
          const Styled = /*#__PURE__*/ styled.div({
              backgroundColor: 'red',
          });
          return <div className={\\"b\\"} data-glitzname=\\"Styled\\">hello2</div>;
      }
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{background-color:black}.b{background-color:red}"`);
  });
});

test('can use variables in style object', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
const size = '100' + '%';
function MyComponent(props: {}) {
    return <styled.Div css={{height: size}}>hello</styled.Div>;
}
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      const size = '100' + '%';
      function MyComponent(props) {
          return <div className={\\"a\\"} data-glitzname=\\"styled.Div\\">hello</div>;
      }
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{height:100%}"`);
  });
});

test('can use css prop on declared styled components', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <Styled1 id="my-id" css={{width: '100%'}} />;
}

const Styled1 = styled.div({
    height: '100%',
});
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      function MyComponent(props) {
          return <div id=\\"my-id\\" className={\\"b a\\"} data-glitzname=\\"Styled1\\"/>;
      }
      const Styled1 = /*#__PURE__*/ styled.div({
          height: '100%',
      });
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{height:100%}.b{width:100%}"`);
  });
});

test('it bails if a declared component is used outside of JSX', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    const X = <Styled3 />;
    const Y = <Styled3>hello</Styled3>;
    (window as any).exposeComponent = { x: Styled1, y: Styled3 };
    return <><Styled1 id="my-id" css={{ width: '100%' }}/><Styled2 /><X /><Styled4 /></>;
}
const Styled1 = styled.div({
    height: '100%',
});
/** @glitz-static */
const Styled2 = styled.div({
  height: '75%',
});
Styled2.displayName = 'Styled2';
const Styled3 = styled.div({
  height: '50%',
});
const Styled4 = styled.div({
  height: '25%',
});
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        function MyComponent(props) {
            const X = <Styled3 />;
            const Y = <Styled3>hello</Styled3>;
            window.exposeComponent = { x: Styled1, y: Styled3 };
            return <><Styled1 id=\\"my-id\\" css={{ width: '100%' }}/><Styled2 /><X /><div className={\\"d\\"} data-glitzname=\\"Styled4\\"/></>;
        }
        const Styled1 = /*#__PURE__*/ styled.div({
            height: '100%',
        });
        /** @glitz-static */
        const Styled2 = /*#__PURE__*/ styled.div({
            height: '75%',
        });
        Styled2.displayName = 'Styled2';
        const Styled3 = /*#__PURE__*/ styled.div({
            height: '50%',
        });
        const Styled4 = /*#__PURE__*/ styled.div({
            height: '25%',
        });
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`".a{height:100%}.b{height:75%}.c{height:50%}.d{height:25%}"`);
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "line": 5,
            "message": "Component 'Styled1' cannot be statically extracted since it's used outside of JSX",
            "severity": "info",
            "source": "(window as any).exposeComponent = { x: Styled1, y: Styled3 };",
          },
          Object {
            "file": "file1.tsx",
            "line": 15,
            "message": "Component 'Styled2' cannot be statically extracted since it's used outside of JSX",
            "severity": "error",
            "source": "Styled2.displayName = 'Styled2';",
          },
          Object {
            "file": "file1.tsx",
            "line": 5,
            "message": "Component 'Styled3' cannot be statically extracted since it's used outside of JSX",
            "severity": "info",
            "source": "(window as any).exposeComponent = { x: Styled1, y: Styled3 };",
          },
        ]
      `),
  );
});

test('it bails when it finds a variable that can not be statically evaluated', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <styled.Div css={{ height: window.innerHeight }}><DerivedStyled /></styled.Div>;
}

const Styled = styled.div({
    width: '100%',
    height: window.innerHeight + 'px',
});

const DerivedStyled = styled(Styled, {
    backgroundColor: 'black',
});
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      function MyComponent(props) {
          return <styled.Div css={{ height: window.innerHeight }}><DerivedStyled /></styled.Div>;
      }
      const Styled = /*#__PURE__*/ styled.div({
          width: '100%',
          height: window.innerHeight + 'px',
      });
      const DerivedStyled = /*#__PURE__*/ styled(Styled, {
          backgroundColor: 'black',
      });
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`""`);
  });
});

test('it bails when it finds theme functions and no static themes are specified', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';

function MyComponent(props: {}) {
    return (
        <>
            <styled.Div css={{ color: (theme: any) => theme.color }} />
            <DerivedStyled />
            <DeepStyled />
        </>
    );
}

const Styled = styled.div({
    color: (theme: any) => theme.color,
});

const DerivedStyled = styled(Styled, {
    backgroundColor: 'black',
});

const DeepStyled = styled.div({
    ':hover': {
        color: (theme: any) => theme.color,
    },
});
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      function MyComponent(props) {
          return (<>
                  <styled.Div css={{ color: (theme) => theme.color }}/>
                  <DerivedStyled />
                  <DeepStyled />
              </>);
      }
      const Styled = /*#__PURE__*/ styled.div({
          color: (theme) => theme.color,
      });
      const DerivedStyled = /*#__PURE__*/ styled(Styled, {
          backgroundColor: 'black',
      });
      const DeepStyled = /*#__PURE__*/ styled.div({
          ':hover': {
              color: (theme) => theme.color,
          },
      });
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{background-color:black}"`);
  });
});

test('injects theme usage correctly', () => {
  const code = {
    'themes.ts': `
export const staticThemes = [{
  id: 'black',
  margin: { s: '10px', l: '20px' }
}];
`,
    'file1.tsx': `
import * as React from 'react';
import { styled } from '@glitz/react';

const translate: any = () => null;

export function Customer() {
  return (
    <Form>
      <FirstName name="given_name" css={{ gridColumnStart: 'span 2' }}>
        {translate(t => t.customer.firstName)}
      </FirstName>

      <AlternativeShippingAddress>Alternativ adress</AlternativeShippingAddress>
    </Form>
  );
}

const Form = styled.form({
  display: 'grid',
  grid: {
    template: {
      columns: '1fr 1fr 1fr 1fr',
    },
  },
  columnGap: t => t.margin.l,
  rowGap: t => t.margin.l,
});

const FirstName = styled.input();

function AlternativeShippingAddress(props: any) {
  return (
    <styled.Span css={{ marginLeft: t => t.margin.s }}>{props.children}</styled.Span>
  );
}
`,
  };

  expectEqual(
    compile(code, { staticThemesFile: 'themes.ts' }),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import * as React from 'react';
        import { useTheme as useGlitzTheme } from \\"@glitz/react\\";
        import(\\"./themes\\");
        import { styled } from '@glitz/react';
        const translate = () => null;
        export function Customer() {
            const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
            return (<form className={\\"a c d e\\"} data-glitzname=\\"Form\\">
              <input name=\\"given_name\\" className={\\"f\\"} data-glitzname=\\"FirstName\\">
                {translate(t => t.customer.firstName)}
              </input>

              <AlternativeShippingAddress>Alternativ adress</AlternativeShippingAddress>
            </form>);
        }
        const Form = /*#__PURE__*/ styled.form({
            display: 'grid',
            grid: {
                template: {
                    columns: '1fr 1fr 1fr 1fr',
                },
            },
            columnGap: t => t.margin.l,
            rowGap: t => t.margin.l,
        });
        const FirstName = /*#__PURE__*/ styled.input();
        function AlternativeShippingAddress(props) {
            const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
            return (<span className={\\"b\\"} data-glitzname=\\"styled.Span\\">{props.children}</span>);
        }
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(
        `".a{display:grid}.b{margin-left:10px}.c{row-gap:20px}.d{column-gap:20px}.e{grid-template-columns:1fr 1fr 1fr 1fr}.f{grid-column-start:span 2}"`,
      );
    },
    diagnostics => expect(diagnostics).toMatchInlineSnapshot(`Array []`),
  );
});

test('bails on first level styled element inside extended components', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
import * as React from 'react';
const Styled1 = styled(() => <styled.Div><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>, { color: 'red' });
const node1 = <Styled1 />

const Styled2 = styled(
  (props: { someProp: boolean }) => {
    if (props.someProp) {
      return <styled.Div><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>;
    } else {
      return <styled.Div><styled.Div css={{ backgroundColor: 'green' }} /></styled.Div>
    }
  },
  { color: 'red' }
);
const node2 = <Styled2 />

const Base = styled.div({ borderLeftColor: 'blue' });

const SecondBase = styled.div({ opacity: 0 });

const Styled3 = styled(
  (props: { someProp: boolean }) => {
    if (props.someProp) {
      return <Base><styled.Div css={{ backgroundColor: 'red' }} /></Base>;
    } else {
      return <Base><SecondBase /></Base>
    }
  },
  { color: 'red' }
);
const node3 = <Styled3 />

const Image = styled.img({
  maxWidth: '100%',
  opacity: 0,
});

const fadeInDecorator = styled({ opacity: 1 });

const Placeholder = styled(Image, { backgroundColor: 'rgba(0, 0, 0, .05)' });

const Styled4 = styled(
  React.forwardRef(
    ({ src, ...restProps }: any, elementRef: any) => {
      if (src) {
        return <Image {...restProps} css={fadeInDecorator} src={src} ref={elementRef} />;
      }

      return <Placeholder css={fadeInDecorator} {...restProps} src="noimage.svg" ref={elementRef} />;
    },
  ),
);
const node4 = <Styled4 />
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        import * as React from 'react';
        const Styled1 = /*#__PURE__*/ styled(() => <styled.Div><div className={\\"a\\"} data-glitzname=\\"styled.Div\\"/></styled.Div>, { color: 'red' });
        const node1 = <Styled1 />;
        const Styled2 = /*#__PURE__*/ styled((props) => {
            if (props.someProp) {
                return <styled.Div><div className={\\"a\\"} data-glitzname=\\"styled.Div\\"/></styled.Div>;
            }
            else {
                return <styled.Div><div className={\\"b\\"} data-glitzname=\\"styled.Div\\"/></styled.Div>;
            }
        }, { color: 'red' });
        const node2 = <Styled2 />;
        const Base = /*#__PURE__*/ styled.div({ borderLeftColor: 'blue' });
        const SecondBase = /*#__PURE__*/ styled.div({ opacity: 0 });
        const Styled3 = /*#__PURE__*/ styled((props) => {
            if (props.someProp) {
                return <Base><div className={\\"a\\"} data-glitzname=\\"styled.Div\\"/></Base>;
            }
            else {
                return <Base><div className={\\"d\\"} data-glitzname=\\"SecondBase\\"/></Base>;
            }
        }, { color: 'red' });
        const node3 = <Styled3 />;
        const Image = /*#__PURE__*/ styled.img({
            maxWidth: '100%',
            opacity: 0,
        });
        const fadeInDecorator = /*#__PURE__*/ styled({ opacity: 1 });
        const Placeholder = /*#__PURE__*/ styled(Image, { backgroundColor: 'rgba(0, 0, 0, .05)' });
        const Styled4 = /*#__PURE__*/ styled(React.forwardRef(({ src, ...restProps }, elementRef) => {
            if (src) {
                return <Image {...restProps} css={fadeInDecorator} src={src} ref={elementRef}/>;
            }
            return <Placeholder css={fadeInDecorator} {...restProps} src=\\"noimage.svg\\" ref={elementRef}/>;
        }));
        const node4 = <Styled4 />;
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(
        `".a{background-color:red}.b{background-color:green}.c{border-left-color:blue}.d{opacity:0}.e{max-width:100%}.f{background-color:rgba(0, 0, 0, .05)}"`,
      );
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "line": 3,
            "message": "Functions in style objects requires runtime or statically declared themes",
            "severity": "info",
            "source": "() => <styled.Div><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>",
          },
          Object {
            "file": "file1.tsx",
            "line": 7,
            "message": "Functions in style objects requires runtime or statically declared themes",
            "severity": "info",
            "source": "(props: { someProp: boolean }) => {
            if (props.someProp) {
              return <styled.Div><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>;
            } else {
              return <styled.Div><styled.Div css={{ backgroundColor: 'green' }} /></styled.Div>
            }
          }",
          },
          Object {
            "file": "file1.tsx",
            "line": 23,
            "message": "Functions in style objects requires runtime or statically declared themes",
            "severity": "info",
            "source": "(props: { someProp: boolean }) => {
            if (props.someProp) {
              return <Base><styled.Div css={{ backgroundColor: 'red' }} /></Base>;
            } else {
              return <Base><SecondBase /></Base>
            }
          }",
          },
          Object {
            "file": "file1.tsx",
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 45,
              "message": "Static expressions does not support spread",
              "severity": "info",
              "source": "({ src, ...restProps }: any, elementRef: any) => {
              if (src) {
                return <Image {...restProps} css={fadeInDecorator} src={src} ref={elementRef} />;
              }

              return <Placeholder css={fadeInDecorator} {...restProps} src=\\"noimage.svg\\" ref={elementRef} />;
            }",
            },
            "line": 43,
            "message": "Unable to statically evaluate to a component or element",
            "severity": "info",
            "source": "styled(
          React.forwardRef(
            ({ src, ...restProps }: any, elementRef: any) => {
              if (src) {
                return <Image {...restProps} css={fadeInDecorator} src={src} ref={elementRef} />;
              }

              return <Placeholder css={fadeInDecorator} {...restProps} src=\\"noimage.svg\\" ref={elementRef} />;
            },
          ),
        )",
          },
        ]
      `),
  );
});

test('bails on top level inline styles inside extended components', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function StyledWrapper(props: {}) {
    return <styled.Div css={{ backgroundColor: 'green' }}><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>;
}
const Styled = styled(StyledWrapper, { color: 'red' });
function MyComponent(props: {}) {
    return <StyledWrapper />;
}
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        function StyledWrapper(props) {
            return <styled.Div css={{ backgroundColor: 'green' }}><div className={\\"b\\"} data-glitzname=\\"styled.Div\\"/></styled.Div>;
        }
        const Styled = /*#__PURE__*/ styled(StyledWrapper, { color: 'red' });
        function MyComponent(props) {
            return <StyledWrapper />;
        }
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`".a{background-color:green}.b{background-color:red}"`);
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "line": 2,
            "message": "Functions in style objects requires runtime or statically declared themes",
            "severity": "info",
            "source": "function StyledWrapper(props: {}) {
            return <styled.Div css={{ backgroundColor: 'green' }}><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>;
        }",
          },
        ]
      `),
  );
});

test('bails on second level inline styles inside extended components as long as top level is simple elements', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function StyledWrapper(props: {}) {
    return <div><styled.Div css={{ backgroundColor: 'green' }}><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div></div>;
}
const Styled = styled(StyledWrapper, { color: 'red' });
function MyComponent(props: {}) {
    return <StyledWrapper />;
}
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        function StyledWrapper(props) {
            return <div><styled.Div css={{ backgroundColor: 'green' }}><div className={\\"b\\"} data-glitzname=\\"styled.Div\\"/></styled.Div></div>;
        }
        const Styled = /*#__PURE__*/ styled(StyledWrapper, { color: 'red' });
        function MyComponent(props) {
            return <StyledWrapper />;
        }
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`".a{background-color:green}.b{background-color:red}"`);
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "line": 2,
            "message": "Functions in style objects requires runtime or statically declared themes",
            "severity": "info",
            "source": "function StyledWrapper(props: {}) {
            return <div><styled.Div css={{ backgroundColor: 'green' }}><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div></div>;
        }",
          },
        ]
      `),
  );
});

test('can extract advanced custom component', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';

const Base = styled.div({ backgroundColor: 'green' });

const Styled = styled(Base, { color: 'red' });

function MyComponent(props: {}) {
    return <Styled css={{ borderBottomColor: 'blue' }} />;
}
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      const Base = /*#__PURE__*/ styled.div({ backgroundColor: 'green' });
      const Styled = /*#__PURE__*/ styled(Base, { color: 'red' });
      function MyComponent(props) {
          return <div className={\\"c b a\\"} data-glitzname=\\"Styled\\"/>;
      }
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(
      `".a{background-color:green}.b{color:red}.c{border-bottom-color:blue}"`,
    );
  });
});

test('supports passing styles without element name to styled()', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
const List = styled.ul({
    color: 'red',
});

const listStyled = styled({
    listStyle: 'square',
});

export const ImportantList = listStyled(List, {
    fontWeight: 'bold',
});

const node = <ImportantList />;
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      const List = /*#__PURE__*/ styled.ul({
          color: 'red',
      });
      const listStyled = /*#__PURE__*/ styled({
          listStyle: 'square',
      });
      export const ImportantList = /*#__PURE__*/ listStyled(List, {
          fontWeight: 'bold',
      });
      const node = <ul className={\\"c b a\\"} data-glitzname=\\"ImportantList\\"/>;
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{color:red}.b{list-style:square}.c{font-weight:bold}"`);
  });
});

test('can use decorator in css prop', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
const colorDecorator = styled({ backgroundColor: 'red' });
const paddingDecorator = styled({ paddingTop: '10px' });
const decorator = colorDecorator(paddingDecorator());
const Image = styled.img({ color: 'red' });
const node1 = <styled.Div css={decorator()} />;
const node2 = <styled.Div css={decorator} />;
const node3 = <Image css={decorator()} />;
const node4 = <Image css={decorator} />;
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      const colorDecorator = /*#__PURE__*/ styled({ backgroundColor: 'red' });
      const paddingDecorator = /*#__PURE__*/ styled({ paddingTop: '10px' });
      const decorator = colorDecorator(paddingDecorator());
      const Image = /*#__PURE__*/ styled.img({ color: 'red' });
      const node1 = <div className={\\"b c\\"} data-glitzname=\\"styled.Div\\"/>;
      const node2 = <div className={\\"b c\\"} data-glitzname=\\"styled.Div\\"/>;
      const node3 = <img className={\\"b c a\\"} data-glitzname=\\"Image\\"/>;
      const node4 = <img className={\\"b c a\\"} data-glitzname=\\"Image\\"/>;
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{color:red}.b{padding-top:10px}.c{background-color:red}"`);
  });
});

test('can use decorator in styled', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
const colorDecorator = styled({ backgroundColor: 'red' });
const paddingDecorator = styled({ paddingTop: '10px' });
const decorator = colorDecorator(paddingDecorator());
const ColorDiv = styled(styled.Div, decorator());
const node1 = <ColorDiv />;
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      const colorDecorator = /*#__PURE__*/ styled({ backgroundColor: 'red' });
      const paddingDecorator = /*#__PURE__*/ styled({ paddingTop: '10px' });
      const decorator = /*#__PURE__*/ colorDecorator(paddingDecorator());
      const ColorDiv = /*#__PURE__*/ styled(styled.Div, decorator());
      const node1 = <div className={\\"b a\\"} data-glitzname=\\"ColorDiv\\"/>;
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{background-color:red}.b{padding-top:10px}"`);
  });
});

test('bails on loop variable in css prop', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
const node = [{x: 0}, {x: 1}, {x: 2}].map(i =>
  <styled.Span css={{ gridRow: { start: \`span \${i.x + 1}\`, end: 'auto' } }}>
    hello
  </styled.Span>
);
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      const node = [{ x: 0 }, { x: 1 }, { x: 2 }].map(i => <styled.Span css={{ gridRow: { start: \`span \${i.x + 1}\`, end: 'auto' } }}>
          hello
        </styled.Span>);
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`""`);
  });
});

test('can use useStyle()', () => {
  const code = {
    'file1.tsx': `
import { styled, useStyle } from '@glitz/react';
const className1 = useStyle({
  color: 'red',
});
export const decorator = styled({
  backgroundColor: 'red',
});
const className2 = useStyle([decorator(), { fontWeight: 'bold' }, undefined, [undefined]]);
const className3 = useStyle((window as any).someStyle);
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled, useStyle } from '@glitz/react';
      const className1 = \\"a\\";
      export const decorator = /*#__PURE__*/ styled({
          backgroundColor: 'red',
      });
      const className2 = \\"b c\\";
      const className3 = /*#__PURE__*/ useStyle(window.someStyle);
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{color:red}.b{font-weight:bold}.c{background-color:red}"`);
  });
});

test('can import a styled component', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
export const List = styled.ul({
    color: 'red',
});
export const listDecorator = styled({
    backgroundColor: 'red',
});
`,
    'file2.tsx': `
import { List } from './file1';
const node = <List />;
`,
    'file3.tsx': `
import { List as MyList, listDecorator } from './file1';
const MyNewList = listDecorator(MyList, {
    fontWeight: 'bold',
});
const node = <MyNewList />;
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      export const List = /*#__PURE__*/ styled.ul({
          color: 'red',
      });
      export const listDecorator = /*#__PURE__*/ styled({
          backgroundColor: 'red',
      });
      "
    `);
    expect(result['file2.jsx']).toMatchInlineSnapshot(`
      "import { List } from './file1';
      const node = <ul className={\\"a\\"} data-glitzname=\\"List\\"/>;
      "
    `);
    expect(result['file3.jsx']).toMatchInlineSnapshot(`
      "import { List as MyList, listDecorator } from './file1';
      const MyNewList = /*#__PURE__*/ listDecorator(MyList, {
          fontWeight: 'bold',
      });
      const node = <ul className={\\"c b a\\"} data-glitzname=\\"MyNewList\\"/>;
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{color:red}.b{background-color:red}.c{font-weight:bold}"`);
  });
});

test('bails on inline custom component', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
const MyComponent = styled((props: {}) => {
    return <styled.Div css={{ backgroundColor: 'green' }}/>;
}, { color: 'red' });
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
              "import { styled } from '@glitz/react';
              const MyComponent = /*#__PURE__*/ styled((props) => {
                  return <styled.Div css={{ backgroundColor: 'green' }}/>;
              }, { color: 'red' });
              "
          `);
      expect(result['style.css']).toMatchInlineSnapshot(`".a{background-color:green}"`);
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "line": 2,
            "message": "Functions in style objects requires runtime or statically declared themes",
            "severity": "info",
            "source": "(props: {}) => {
            return <styled.Div css={{ backgroundColor: 'green' }}/>;
        }",
          },
        ]
      `),
  );
});

test('bails on spread after css prop', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
const obj: any = {};
const Styled = styled.div({
  color: 'red',
})
const node1 = <styled.Div css={{ backgroundColor: 'green' }} {...obj} />;
const node2 = <styled.Div {...obj} />;
const node3 = <styled.Div {...obj} css={{ backgroundColor: 'green' }} />;
const node4 = <Styled {...obj} />;
const node5 = <Styled css={{ backgroundColor: 'green' }} {...obj} />;
const node6 = <Styled {...obj} css={{ backgroundColor: 'green' }} />;
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      const obj = {};
      const Styled = /*#__PURE__*/ styled.div({
          color: 'red',
      });
      const node1 = <styled.Div css={{ backgroundColor: 'green' }} {...obj}/>;
      const node2 = <styled.Div {...obj}/>;
      const node3 = <div {...obj} className={\\"b\\"} data-glitzname=\\"styled.Div\\"/>;
      const node4 = <Styled {...obj}/>;
      const node5 = <Styled css={{ backgroundColor: 'green' }} {...obj}/>;
      const node6 = <div {...obj} className={\\"b a\\"} data-glitzname=\\"Styled\\"/>;
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{color:red}.b{background-color:green}"`);
  });
});

test('can compile prop funcs for static themes', () => {
  const code = {
    'themes.ts': `
export const staticThemes = [{
  id: 'red',
  isDark: false,
  color: 'red',
  backgroundColor: 'pink',
  spacing: { small: '10px', large: '20px' },
}, {
  id: 'blue',
  isDark: false,
  color: 'blue',
  backgroundColor: 'lightblue',
  spacing: { small: '10px', large: '20px' },
}, {
  id: 'black',
  isDark: true,
  color: 'black',
  backgroundColor: 'black',
  spacing: { small: '10px', large: '20px' },
}];
`,
    'file1.tsx': `
import { styled } from '@glitz/react';

const Styled1 = styled.div({
  color: theme => theme.color,
});
const Styled2 = styled.div({
  color: theme => theme.color,
  fontWeight: 'bold',
});
const Styled3 = styled.div({
  color: theme => theme.isDark ? 'black' : 'white',
});
const Styled4 = styled.div({
  paddingLeft: theme => theme.spacing.small,
  paddingRight: theme => theme.spacing.large,
});
function MyComponent(props: any) {
  return (
    <>
      <styled.Div css={{ color: theme => theme.color, backgroundColor: theme => theme.isDark && props.someProp ? 'black' : 'white' }} />
      <styled.Div css={{ color: theme => theme.color, backgroundColor: theme => theme.isDark ? 'black' : 'white' }} />
    </>
  );
}

function MyOtherComponent() {
  const node1 = <Styled1 />;
  const node2 = <Styled2 />;
  const node3 = <Styled3 />;
  const node4 = <Styled4 />;
  return undefined;
}

const MyArrowFunction = () => <Styled1 />;

// This should not get transformed as it's a styled component with themes declared outside of a component
const node = <Styled1 />;
`,
  };

  expectEqual(
    compile(code, { staticThemesFile: 'themes.ts' }),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        import { useTheme as useGlitzTheme } from \\"@glitz/react\\";
        import(\\"./themes\\");
        const Styled1 = /*#__PURE__*/ styled.div({
            color: theme => theme.color,
        });
        const Styled2 = /*#__PURE__*/ styled.div({
            color: theme => theme.color,
            fontWeight: 'bold',
        });
        const Styled3 = /*#__PURE__*/ styled.div({
            color: theme => theme.isDark ? 'black' : 'white',
        });
        const Styled4 = /*#__PURE__*/ styled.div({
            paddingLeft: theme => theme.spacing.small,
            paddingRight: theme => theme.spacing.large,
        });
        function MyComponent(props) {
            const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
            return (<>
              <styled.Div css={{ color: theme => theme.color, backgroundColor: theme => theme.isDark && props.someProp ? 'black' : 'white' }}/>
              <div className={__glitzTheme.isDark === true ? \\"e f\\" : __glitzTheme.color === \\"blue\\" ? \\"b d\\" : __glitzTheme.color === \\"red\\" ? \\"b c\\" : (() => { throw new Error(\\"Unexpected theme, this theme did not exist during compile time: \\" + JSON.stringify(__glitzTheme)); })()} data-glitzname=\\"styled.Div\\"/>
            </>);
        }
        function MyOtherComponent() {
            const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
            const node1 = <div className={__glitzTheme.isDark === true ? \\"f\\" : __glitzTheme.color === \\"blue\\" ? \\"d\\" : __glitzTheme.color === \\"red\\" ? \\"c\\" : (() => { throw new Error(\\"Unexpected theme, this theme did not exist during compile time: \\" + JSON.stringify(__glitzTheme)); })()} data-glitzname=\\"Styled1\\"/>;
            const node2 = <div className={\\"a \\" + (__glitzTheme.isDark === true ? \\"f\\" : __glitzTheme.color === \\"blue\\" ? \\"d\\" : __glitzTheme.color === \\"red\\" ? \\"c\\" : (() => { throw new Error(\\"Unexpected theme, this theme did not exist during compile time: \\" + JSON.stringify(__glitzTheme)); })())} data-glitzname=\\"Styled2\\"/>;
            const node3 = <div className={__glitzTheme.isDark === true ? \\"f\\" : __glitzTheme.isDark === false ? \\"g\\" : (() => { throw new Error(\\"Unexpected theme, this theme did not exist during compile time: \\" + JSON.stringify(__glitzTheme)); })()} data-glitzname=\\"Styled3\\"/>;
            const node4 = <div className={\\"h i\\"} data-glitzname=\\"Styled4\\"/>;
            return undefined;
        }
        const MyArrowFunction = () => {
            const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
            return <div className={__glitzTheme.isDark === true ? \\"f\\" : __glitzTheme.color === \\"blue\\" ? \\"d\\" : __glitzTheme.color === \\"red\\" ? \\"c\\" : (() => { throw new Error(\\"Unexpected theme, this theme did not exist during compile time: \\" + JSON.stringify(__glitzTheme)); })()} data-glitzname=\\"Styled1\\"/>;
        };
        // This should not get transformed as it's a styled component with themes declared outside of a component
        const node = <Styled1 />;
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(
        `".a{font-weight:bold}.b{background-color:white}.c{color:red}.d{color:blue}.e{background-color:black}.f{color:black}.g{color:white}.h{padding-right:20px}.i{padding-left:10px}"`,
      );
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 20,
              "message": "Could not determine a static value for: props",
              "severity": "info",
              "source": "props",
            },
            "line": 20,
            "message": "Evaluation of theme function requires runtime",
            "severity": "info",
            "source": "<styled.Div css={{ color: theme => theme.color, backgroundColor: theme => theme.isDark && props.someProp ? 'black' : 'white' }} />",
          },
          Object {
            "file": "file1.tsx",
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 37,
              "message": "JSX expression outside of a component declaration cannot be statically evaluated",
              "severity": "info",
              "source": "<Styled1 />",
            },
            "line": 37,
            "message": "Evaluation of theme function requires runtime",
            "severity": "info",
            "source": "<Styled1 />",
          },
        ]
      `),
  );
});

test('generates as terse ternary expressions as possible', () => {
  const code = {
    'themes.ts': `
export const staticThemes = [{
  id: 'black1',
  color: 'black',
  gray: '#ccc',
  primary: 'red',
  isDark: true,
  isCompact: true,
}, {
  id: 'black2',
  color: 'black',
  gray: '#ccc',
  primary: 'blue',
  isDark: true,
  isCompact: false,
}, {
  id: 'black3',
  color: 'black',
  gray: '#ddd',
  primary: 'green',
  isDark: true,
  isCompact: false,
}, {
  id: 'black4',
  color: 'black',
  gray: '#ddd',
  primary: 'yellow',
  isDark: true,
  isCompact: true,
}, {
  id: 'black5',
  color: 'black',
  gray: '#ddd',
  primary: 'yellow',
  isDark: false,
  isCompact: false,
}];
`,
    'file1.tsx': `
import { styled } from '@glitz/react';

const Styled1 = styled.div({
  color: theme => theme.color,
});
const Styled2 = styled.div({
  color: theme => theme.gray,
});
const Styled3 = styled.div({
  color: theme => theme.primary,
});
const Styled4 = styled.div({
  color: theme => theme.isCompact ? 'green' : 'orange',
});
const Styled5 = styled.div({
  color: theme => theme.isCompact ? theme.primary : theme.color,
});

function MyOtherComponent() {
  return (
    <>
      <Styled1 />
      <Styled2 />
      <Styled3 />
      <Styled4 />
      <Styled5 />
    </>
  );
}
`,
  };

  expectEqual(compile(code, { staticThemesFile: 'themes.ts', mode: 'production' }), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      import { useTheme as useGlitzTheme } from \\"@glitz/react\\";
      const Styled1 = /*#__PURE__*/ styled.div({
          color: theme => theme.color,
      });
      const Styled2 = /*#__PURE__*/ styled.div({
          color: theme => theme.gray,
      });
      const Styled3 = /*#__PURE__*/ styled.div({
          color: theme => theme.primary,
      });
      const Styled4 = /*#__PURE__*/ styled.div({
          color: theme => theme.isCompact ? 'green' : 'orange',
      });
      const Styled5 = /*#__PURE__*/ styled.div({
          color: theme => theme.isCompact ? theme.primary : theme.color,
      });
      function MyOtherComponent() {
          const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
          return (<>
            <div className={\\"a\\"}/>
            <div className={__glitzTheme.gray === \\"#ccc\\" ? \\"b\\" : \\"c\\"}/>
            <div className={__glitzTheme.primary === \\"green\\" ? \\"f\\" : __glitzTheme.primary === \\"blue\\" ? \\"e\\" : __glitzTheme.primary === \\"red\\" ? \\"d\\" : \\"g\\"}/>
            <div className={__glitzTheme.isCompact === true ? \\"f\\" : \\"h\\"}/>
            <div className={__glitzTheme.id === \\"black4\\" ? \\"g\\" : __glitzTheme.primary === \\"red\\" ? \\"d\\" : \\"a\\"}/>
          </>);
      }
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(
      `".a{color:black}.b{color:#ccc}.c{color:#ddd}.d{color:red}.e{color:blue}.f{color:green}.g{color:yellow}.h{color:orange}"`,
    );
  });
});

test('compiles correctly for production mode', () => {
  const code = {
    'themes.ts': `
const allThemes = [{
  id: 'red',
  isDark: false,
  color: 'red',
  backgroundColor: 'pink',
}, {
  id: 'blue',
  isDark: false,
  color: 'blue',
  backgroundColor: 'lightblue',
}, {
  id: 'black',
  isDark: true,
  color: 'black',
  backgroundColor: 'black',
}];

export const staticThemes = allThemes.map(t => t);
`,
    'file1.tsx': `
import { styled } from '@glitz/react';

const Styled1 = styled.div({
  color: theme => theme.color,
});
const Styled2 = styled.div({
  margin: {top: '10px', left: '20px'},
});
function MyComponent(props: any) {
  return (
    <>
      <styled.Div css={{ color: 'black' }}>hello</styled.Div>
      <styled.Div css={{ color: theme => theme.color, backgroundColor: theme => theme.isDark ? 'black' : 'white' }} />
    </>
  );
}

function MyOtherComponent() {
  return (<>
    <Styled1 />
    <Styled2 />
  </>);
}

const MyArrowFunction = () => <Styled1 />;
`,
  };

  expectEqual(compile(code, { staticThemesFile: 'themes.ts', mode: 'production' }), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      import { useTheme as useGlitzTheme } from \\"@glitz/react\\";
      const Styled1 = /*#__PURE__*/ styled.div({
          color: theme => theme.color,
      });
      const Styled2 = /*#__PURE__*/ styled.div({
          margin: { top: '10px', left: '20px' },
      });
      function MyComponent(props) {
          const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
          return (<>
            <div className={\\"a\\"}>hello</div>
            <div className={__glitzTheme.isDark === true ? \\"a e\\" : __glitzTheme.color === \\"blue\\" ? \\"b d\\" : \\"b c\\"}/>
          </>);
      }
      function MyOtherComponent() {
          const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
          return (<>
          <div className={__glitzTheme.isDark === true ? \\"a\\" : __glitzTheme.color === \\"blue\\" ? \\"d\\" : \\"c\\"}/>
          <div className={\\"f g\\"}/>
        </>);
      }
      const MyArrowFunction = () => {
          const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
          return <div className={__glitzTheme.isDark === true ? \\"a\\" : __glitzTheme.color === \\"blue\\" ? \\"d\\" : \\"c\\"}/>;
      };
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(
      `".a{color:black}.b{background-color:white}.c{color:red}.d{color:blue}.e{background-color:black}.f{margin-left:20px}.g{margin-top:10px}"`,
    );
  });
});

test('can compile static theme with switch', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';

export enum Theme {
  Test,
}

const testTheme = {
  background: 'red',
  text: 'green',
  padding: '10px',
};

type ThemeType = typeof testTheme;

function theme<TValue>(
  value: (values: ThemeType) => TValue,
  type = Theme.Test
): TValue {
  switch (type) {
    case Theme.Test:
      return value(testTheme);
  }
}

function createThemeDecorator(type: Theme) {
  return styled({
    backgroundColor: theme(t => t.background, type),
    color: theme(t => t.text, type),
  });
}

const Base = createThemeDecorator(Theme.Test)(styled.Header, {
  padding: { xy: theme(t => t.padding) },
});

function Component() {
  return <Base />;
}
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      export var Theme;
      (function (Theme) {
          Theme[Theme[\\"Test\\"] = 0] = \\"Test\\";
      })(Theme || (Theme = {}));
      const testTheme = {
          background: 'red',
          text: 'green',
          padding: '10px',
      };
      function theme(value, type = Theme.Test) {
          switch (type) {
              case Theme.Test:
                  return value(testTheme);
          }
      }
      function createThemeDecorator(type) {
          return /*#__PURE__*/ styled({
              backgroundColor: theme(t => t.background, type),
              color: theme(t => t.text, type),
          });
      }
      const Base = /*#__PURE__*/ createThemeDecorator(Theme.Test)(styled.Header, {
          padding: { xy: theme(t => t.padding) },
      });
      function Component() {
          return <header className={\\"c d e f a b\\"} data-glitzname=\\"Base\\"/>;
      }
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(
      `".a{color:green}.b{background-color:red}.c{padding-bottom:10px}.d{padding-top:10px}.e{padding-right:10px}.f{padding-left:10px}"`,
    );
  });
});

test('compiles correctly for a single theme', () => {
  const code = {
    'themes.ts': `
export const staticThemes = [{
  id: 'dark',
  fontSize: { l: 60 },
  primary: { text: '#000', color: '#000' },
}];
`,
    'file1.tsx': `
import * as React from 'react';
import { styled } from '@glitz/react';

function Image(props: any) {
  return <img />;
}

function registerComponent(component: any) {
  return component;
}

export const ImageBlock = registerComponent((props: { image: any, textColor: string, showTitle: boolean, title: string }) => (
  <Container>
    <Image src={props.image} />
    {props.showTitle && (
      <>{props.textColor === 'Light' ? <LightText>{props.title}</LightText> : <DarkText>{props.title}</DarkText>}</>
    )}
  </Container>
));

const Text = styled.span({
  position: 'absolute',
  bottom: 60,
  left: 60,
  fontSize: t => t.fontSize.l,
});

const LightText = styled(Text, {
  color: t => t.primary.text,
});

const DarkText = styled(Text, {
  color: t => t.primary.color,
});

const Container = styled.div({
  position: 'relative',
});

`,
  };

  expectEqual(
    compile(code, { staticThemesFile: 'themes.ts' }),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import * as React from 'react';
        import { useTheme as useGlitzTheme } from \\"@glitz/react\\";
        import(\\"./themes\\");
        import { styled } from '@glitz/react';
        function Image(props) {
            return <img />;
        }
        function registerComponent(component) {
            return component;
        }
        export const ImageBlock = registerComponent((props) => {
            const __glitzTheme = /*#__PURE__*/ useGlitzTheme();
            return (<div className={\\"d\\"} data-glitzname=\\"Container\\">
            <Image src={props.image}/>
            {props.showTitle && (<>{props.textColor === 'Light' ? <span className={\\"a b c e f\\"} data-glitzname=\\"LightText\\">{props.title}</span> : <span className={\\"a b c e f\\"} data-glitzname=\\"DarkText\\">{props.title}</span>}</>)}
          </div>);
        });
        const Text = /*#__PURE__*/ styled.span({
            position: 'absolute',
            bottom: 60,
            left: 60,
            fontSize: t => t.fontSize.l,
        });
        const LightText = /*#__PURE__*/ styled(Text, {
            color: t => t.primary.text,
        });
        const DarkText = /*#__PURE__*/ styled(Text, {
            color: t => t.primary.color,
        });
        const Container = /*#__PURE__*/ styled.div({
            position: 'relative',
        });
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(
        `".a{left:60}.b{bottom:60}.c{position:absolute}.d{position:relative}.e{color:#000}.f{font-size:60}"`,
      );
    },
    diagnostics => expect(diagnostics).toMatchInlineSnapshot(`Array []`),
  );
});

test('can compile built-in styled components', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
export default function Header() {
  return <Base />;
}

/** @glitz-static */
const Base = styled(styled.Header, {
  paddingLeft: '10px',
});
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      export default function Header() {
          return <header className={\\"a\\"} data-glitzname=\\"Base\\"/>;
      }
      /** @glitz-static */
      const Base = /*#__PURE__*/ styled(styled.Header, {
          paddingLeft: '10px',
      });
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{padding-left:10px}"`);
  });
});

test('can compile decorators and multiple style arguments', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function Component() {
  return <Styled />;
}

const someDecorator = styled({ color: 'red' });
const anotherDecorator = styled({ backgroundColor: 'green' });
function createDecorator() {
  return styled({ borderLeftColor: 'blue' });
}
const Styled = styled.div(
  someDecorator,
  anotherDecorator,
  createDecorator(),
  { borderRightColor: 'yellow' }
);
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      function Component() {
          return <div className={\\"d c b a\\"} data-glitzname=\\"Styled\\"/>;
      }
      const someDecorator = /*#__PURE__*/ styled({ color: 'red' });
      const anotherDecorator = /*#__PURE__*/ styled({ backgroundColor: 'green' });
      function createDecorator() {
          return /*#__PURE__*/ styled({ borderLeftColor: 'blue' });
      }
      const Styled = /*#__PURE__*/ styled.div(someDecorator, anotherDecorator, createDecorator(), { borderRightColor: 'yellow' });
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(
      `".a{color:red}.b{background-color:green}.c{border-left-color:blue}.d{border-right-color:yellow}"`,
    );
  });
});

test('can handle React.forwardRef() and React.memo()', () => {
  const code = {
    'file1.tsx': `
import * as React from 'react';
import { styled } from '@glitz/react';

const Styled1 = styled(React.forwardRef((props: {}, ref: any) => <styled.Div ref={ref}><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>), { color: 'red' });
const node1 = <Styled1 />

const Styled2 = styled(React.memo((props: {}) => <styled.Div><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>), { color: 'red' });
const node2 = <Styled2 />
`,
  };

  expectEqual(
    compile(code),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import * as React from 'react';
        import { styled } from '@glitz/react';
        const Styled1 = /*#__PURE__*/ styled(React.forwardRef((props, ref) => <styled.Div ref={ref}><div className={\\"a\\"} data-glitzname=\\"styled.Div\\"/></styled.Div>), { color: 'red' });
        const node1 = <Styled1 />;
        const Styled2 = /*#__PURE__*/ styled(React.memo((props) => <styled.Div><div className={\\"a\\"} data-glitzname=\\"styled.Div\\"/></styled.Div>), { color: 'red' });
        const node2 = <Styled2 />;
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`".a{background-color:red}"`);
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "line": 4,
            "message": "Functions in style objects requires runtime or statically declared themes",
            "severity": "info",
            "source": "(props: {}, ref: any) => <styled.Div ref={ref}><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>",
          },
          Object {
            "file": "file1.tsx",
            "line": 7,
            "message": "Functions in style objects requires runtime or statically declared themes",
            "severity": "info",
            "source": "(props: {}) => <styled.Div><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>",
          },
        ]
      `),
  );
});

test('correctly handles functions in conditionals', () => {
  const code = {
    'themes.ts': `
export const staticThemes = [{
  id: 'something',
  negative: { color: 'red' },
  margin: { xs: 1 },
}];
`,
    'file1.tsx': `
import { styled } from '@glitz/react';
import * as React from 'react';

type PropType = {
  current: number;
  original?: number;
};

const Price = styled(({ current, original }: PropType) => {
  return (
    <Base>
      <CurrentPrice
        css={{
          color: typeof original === 'number' && current !== original ? t => t.negative.color : undefined,
        }}
      >
        {current} kr
      </CurrentPrice>
      <CurrentPrice
        css={{
          color: t => typeof original === 'number' && current !== original ? t.negative.color : undefined,
        }}
      >
        {current} :-
      </CurrentPrice>
      {typeof original === 'number' && <OriginalPrice>{original} kr</OriginalPrice>}
    </Base>
  );
});

export default Price;

const Base = styled.div({});

const CurrentPrice = styled.span({
  fontWeight: 'bold',
});

const OriginalPrice = styled.span({
  marginLeft: t => t.margin.xs,
  textDecoration: 'line-through',
});

const node = <Price current={100} />
`,
  };

  expectEqual(
    compile(code, { staticThemesFile: 'themes.ts' }),
    result => {
      expect(result['file1.jsx']).toMatchInlineSnapshot(`
        "import { styled } from '@glitz/react';
        import { useTheme as useGlitzTheme } from \\"@glitz/react\\";
        import(\\"./themes\\");
        import * as React from 'react';
        const Price = /*#__PURE__*/ styled(({ current, original }) => {
            return (<Base>
              <span className={typeof original === 'number' && current !== original ? \\"c\\" : \\"\\"} data-glitzname=\\"CurrentPrice\\">
                {current} kr
              </span>
              <CurrentPrice css={{
                color: t => typeof original === 'number' && current !== original ? t.negative.color : undefined,
            }}>
                {current} :-
              </CurrentPrice>
              {typeof original === 'number' && <span className={\\"b d\\"} data-glitzname=\\"OriginalPrice\\">{original} kr</span>}
            </Base>);
        });
        export default Price;
        const Base = /*#__PURE__*/ styled.div({});
        const CurrentPrice = /*#__PURE__*/ styled.span({
            fontWeight: 'bold',
        });
        const OriginalPrice = /*#__PURE__*/ styled.span({
            marginLeft: t => t.margin.xs,
            textDecoration: 'line-through',
        });
        const node = <Price current={100}/>;
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(
        `".a{font-weight:bold}.b{text-decoration:line-through}.c{color:red}.d{margin-left:1}"`,
      );
    },
    diagnostics =>
      expect(diagnostics).toMatchInlineSnapshot(`
        Array [
          Object {
            "file": "file1.tsx",
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 9,
              "message": "Static expressions does not support spread",
              "severity": "info",
              "source": "({ current, original }: PropType) => {
          return (
            <Base>
              <CurrentPrice
                css={{
                  color: typeof original === 'number' && current !== original ? t => t.negative.color : undefined,
                }}
              >
                {current} kr
              </CurrentPrice>
              <CurrentPrice
                css={{
                  color: t => typeof original === 'number' && current !== original ? t.negative.color : undefined,
                }}
              >
                {current} :-
              </CurrentPrice>
              {typeof original === 'number' && <OriginalPrice>{original} kr</OriginalPrice>}
            </Base>
          );
        }",
            },
            "line": 9,
            "message": "Unable to statically evaluate to a component or element",
            "severity": "info",
            "source": "styled(({ current, original }: PropType) => {
          return (
            <Base>
              <CurrentPrice
                css={{
                  color: typeof original === 'number' && current !== original ? t => t.negative.color : undefined,
                }}
              >
                {current} kr
              </CurrentPrice>
              <CurrentPrice
                css={{
                  color: t => typeof original === 'number' && current !== original ? t.negative.color : undefined,
                }}
              >
                {current} :-
              </CurrentPrice>
              {typeof original === 'number' && <OriginalPrice>{original} kr</OriginalPrice>}
            </Base>
          );
        })",
          },
          Object {
            "file": "file1.tsx",
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 21,
              "message": "Could not determine a static value for: original",
              "severity": "info",
              "source": "original",
            },
            "line": 19,
            "message": "Evaluation of theme function requires runtime",
            "severity": "info",
            "source": "<CurrentPrice
                css={{
                  color: t => typeof original === 'number' && current !== original ? t.negative.color : undefined,
                }}
              >
                {current} :-
              </CurrentPrice>",
          },
        ]
      `),
  );
});

test('can handle element like components individually', () => {
  const code = {
    'link.tsx': `
import * as React from 'react';
import { styled, applyClassName } from '@glitz/react';
export function MainLink(props) {
  return <a {...props}/>;
}
export default styled(applyClassName(MainLink));
`,
    'file1.tsx': `
import * as React from 'react';
import { styled } from '@glitz/react';
import Link from './link';

export function MainMenu(props: any) {
  return (
    <>
      <RowLink />
      <ColumnLink />
    </>
  );
}

const RowLink = styled(Link, {
  display: 'flex',
  flexDirection: 'row',
});
const ColumnLink = styled(Link, {
  display: 'flex',
  flexDirection: 'column',
});
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import * as React from 'react';
      import { MainLink as AutoImportedMainLink } from \\"./link\\";
      import { styled } from '@glitz/react';
      import Link from './link';
      export function MainMenu(props) {
          return (<>
            <AutoImportedMainLink className={\\"a b\\"}/>
            <AutoImportedMainLink className={\\"c b\\"}/>
          </>);
      }
      const RowLink = /*#__PURE__*/ styled(Link, {
          display: 'flex',
          flexDirection: 'row',
      });
      const ColumnLink = /*#__PURE__*/ styled(Link, {
          display: 'flex',
          flexDirection: 'column',
      });
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(
      `".a{flex-direction:row}.b{display:flex}.c{flex-direction:column}"`,
    );
  });
});

function expectEqual(
  results: readonly [Code, TransformerDiagnostics],
  test: (result: Code) => void,
  testDiagnostics?: (diagnostics: TransformerDiagnostics) => void,
) {
  const [compiled, diagnostics] = results;
  test(
    Object.keys(compiled).reduce<Code>((result, fileName) => {
      result[fileName] = compiled[fileName];
      return result;
    }, {}),
  );
  if (testDiagnostics) {
    testDiagnostics(diagnostics);
  }
}
