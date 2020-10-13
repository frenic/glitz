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
            "message": "css prop could not be statically evaluated",
            "severity": "info",
            "source": "<styled.Div css={{ ['@media (min-width: 768px)']: { width: props.isLarge ? '10px' : '1px' } }}>What color am I?</styled.Div>",
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
              "message": "Could not determine a static value for: props",
              "severity": "info",
              "source": "props",
            },
            "line": 48,
            "message": "css prop could not be statically evaluated",
            "severity": "info",
            "source": "<styled.Div css={superDynamic()}>Super dynamic</styled.Div>",
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
            "line": 49,
            "message": "css prop could not be statically evaluated",
            "severity": "info",
            "source": "<styled.Div css={exportedDecorator} />",
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

test('bails if it finds a comment that it should skip', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <Styled id="some-id">hello</Styled>;
}

/** @glitz-dynamic */
const Styled = styled.div({
    width: '100%',
    height: '100%'
});
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      function MyComponent(props) {
          return <Styled id=\\"some-id\\">hello</Styled>;
      }
      /** @glitz-dynamic */
      const Styled = /*#__PURE__*/ styled.div({
          width: '100%',
          height: '100%'
      });
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`""`);
  });
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
            "message": "Styled component could not be statically evaluated",
            "severity": "error",
            "source": "const Styled = styled.div({
            width: (window as any).theWidth,
            height: '100%'
        });",
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
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 7,
              "message": "Functions in style objects requires runtime or statically declared themes",
              "severity": "info",
              "source": "(theme) => theme.theWidth",
            },
            "line": 6,
            "message": "Styled component could not be statically evaluated",
            "severity": "info",
            "source": "const Styled = styled.div({
            width: (theme) => theme.theWidth,
            height: '100%'
        });",
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
            "message": "Styled component could not be statically evaluated",
            "severity": "info",
            "source": "const Styled = createStyledComponent();",
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
            "message": "Styled component could not be statically evaluated",
            "severity": "error",
            "source": "const Styled1 = styled.div({
            width: (window as any).theWidth,
            height: '100%'
        });",
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
            "message": "Styled component could not be statically evaluated",
            "severity": "error",
            "source": "const Styled2 = styled.div({
            width: '100%',
            height: (window as any).theHeight
        });",
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
            "line": 4,
            "message": "Component 'Styled1' cannot be statically extracted since it's used outside of JSX",
            "severity": "info",
            "source": "(window as any).exposeComponent = { x: Styled1, y: Styled3 };",
          },
          Object {
            "file": "file1.tsx",
            "line": 14,
            "message": "Component 'Styled2' cannot be statically extracted since it's used outside of JSX",
            "severity": "error",
            "source": "Styled2.displayName = 'Styled2';",
          },
          Object {
            "file": "file1.tsx",
            "line": 4,
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
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 5,
              "message": "Styled component expression requires runtime",
              "severity": "info",
              "source": "const Styled = styled(StyledWrapper, { color: 'red' });",
            },
            "line": 5,
            "message": "Styled component could not be statically evaluated",
            "severity": "info",
            "source": "const Styled = styled(StyledWrapper, { color: 'red' });",
          },
          Object {
            "file": "file1.tsx",
            "line": 3,
            "message": "Top level styled.[Element] cannot be statically extracted inside components that are decorated by other components",
            "severity": "info",
            "source": "<styled.Div css={{ backgroundColor: 'green' }}><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>",
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
            "innerDiagnostic": Object {
              "file": "file1.tsx",
              "line": 5,
              "message": "Styled component expression requires runtime",
              "severity": "info",
              "source": "const Styled = styled(StyledWrapper, { color: 'red' });",
            },
            "line": 5,
            "message": "Styled component could not be statically evaluated",
            "severity": "info",
            "source": "const Styled = styled(StyledWrapper, { color: 'red' });",
          },
          Object {
            "file": "file1.tsx",
            "line": 3,
            "message": "Top level styled.[Element] cannot be statically extracted inside components that are decorated by other components",
            "severity": "info",
            "source": "<styled.Div css={{ backgroundColor: 'green' }}><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>",
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
const node1 = <styled.Div css={decorator()} />;
const node2 = <styled.Div css={decorator} />;
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      const colorDecorator = /*#__PURE__*/ styled({ backgroundColor: 'red' });
      const paddingDecorator = /*#__PURE__*/ styled({ paddingTop: '10px' });
      const decorator = colorDecorator(paddingDecorator());
      const node1 = <div className={\\"a b\\"} data-glitzname=\\"styled.Div\\"/>;
      const node2 = <div className={\\"a b\\"} data-glitzname=\\"styled.Div\\"/>;
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{padding-top:10px}.b{background-color:red}"`);
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

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      const MyComponent = /*#__PURE__*/ styled((props) => {
          return <styled.Div css={{ backgroundColor: 'green' }}/>;
      }, { color: 'red' });
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{background-color:green}"`);
  });
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

test('can compile build-in styled components', () => {
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
