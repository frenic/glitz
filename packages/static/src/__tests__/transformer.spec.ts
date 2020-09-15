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
          return <div id=\\"some-id\\" className=\\"a b\\" data-glitzname=\\"Styled\\">hello</div>;
      }
      const styleObject = {
          width: '100%',
          height: '100%'
      };
      const Styled = /*#__PURE__*/ styled.div(styleObject);
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{width:100%}.b{height:100%}"`);
  });
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
      expect(result['style.css']).toMatchInlineSnapshot(`".a{height:100%}"`);
    },
    [
      {
        message: 'Component marked with @glitz-static could not be statically evaluated',
        severity: 'error',
        file: 'file1.tsx',
        line: 4,
        source: `const Styled = styled.div({
    width: (window as any).theWidth,
    height: '100%'
});`,
        innerDiagnostic: {
          file: 'file1.tsx',
          line: 8,
          message: "Unable to resolve identifier 'window'",
          severity: 'error',
          source: 'window',
        },
      },
    ],
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
    [
      {
        message: 'Styled component could not be statically evaluated',
        severity: 'info',
        file: 'file1.tsx',
        line: 4,
        source: `const Styled = styled.div({
    width: (theme) => theme.theWidth,
    height: '100%'
});`,
        innerDiagnostic: {
          file: 'file1.tsx',
          line: 7,
          message: 'Functions in style objects requires runtime',
          severity: 'info',
          source: '(theme) => theme.theWidth',
        },
      },
    ],
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
      expect(result['style.css']).toMatchInlineSnapshot(`".a{height:100%}.b{width:100%}"`);
    },
    [
      {
        message: 'Component marked with @glitz-static could not be statically evaluated',
        severity: 'error',
        file: 'file1.tsx',
        line: 5,
        source: `const Styled1 = styled.div({
    width: (window as any).theWidth,
    height: '100%'
});`,
        innerDiagnostic: {
          file: 'file1.tsx',
          line: 8,
          message: "Unable to resolve identifier 'window'",
          severity: 'error',
          source: 'window',
        },
      },
      {
        message: 'Component marked with @glitz-static could not be statically evaluated',
        severity: 'error',
        file: 'file1.tsx',
        line: 10,
        source: `const Styled2 = styled.div({
    width: '100%',
    height: (window as any).theHeight
});`,
        innerDiagnostic: {
          file: 'file1.tsx',
          line: 14,
          message: "Unable to resolve identifier 'window'",
          severity: 'error',
          source: 'window',
        },
      },
    ],
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
          return <div onClick={() => alert('woah!')} className=\\"a b c\\" data-glitzname=\\"DerivedStyled\\">hello</div>;
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
    expect(result['style.css']).toMatchInlineSnapshot(`".a{width:100%}.b{height:100%}.c{background-color:black}"`);
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
          return <><div className=\\"c d e f a\\" data-glitzname=\\"Styled\\">hello</div><div className=\\"b g\\" data-glitzname=\\"MediaComp\\"/></>;
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
      `".a{background:#000}.b{margin:10px}@media (min-width: 768px){.c{width:50%}.d{height:50%}.g{margin:20px}}@media (max-width: 768px){.e{width:100%}.f{height:100%}}"`,
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
          return <div className=\\"a\\" data-glitzname=\\"styled.Div\\">hello</div>;
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
          return <div className=\\"a\\" data-glitzname=\\"Styled\\">hello1</div>;
      }
      const Styled = /*#__PURE__*/ styled.div({
          backgroundColor: 'black',
      });
      "
    `);
    expect(result['file2.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      function MyComponent(props) {
          return <div className=\\"b\\" data-glitzname=\\"Styled\\">hello2</div>;
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
          return <div className=\\"a\\" data-glitzname=\\"Styled\\">hello1</div>;
      }
      function MyComponent2(props) {
          const Styled = /*#__PURE__*/ styled.div({
              backgroundColor: 'red',
          });
          return <div className=\\"b\\" data-glitzname=\\"Styled\\">hello2</div>;
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
          return <div className=\\"a\\" data-glitzname=\\"styled.Div\\">hello</div>;
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
          return <div id=\\"my-id\\" className=\\"a b\\" data-glitzname=\\"Styled1\\"/>;
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
            return <><Styled1 id=\\"my-id\\" css={{ width: '100%' }}/><Styled2 /><X /><div className=\\"d\\" data-glitzname=\\"Styled4\\"/></>;
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
    [
      {
        file: 'file1.tsx',
        message: "Component 'Styled1' cannot be statically extracted since it's used outside of JSX",
        source: '(window as any).exposeComponent = { x: Styled1, y: Styled3 };',
        severity: 'info',
        line: 4,
      },
      {
        file: 'file1.tsx',
        message: "Component 'Styled2' cannot be statically extracted since it's used outside of JSX",
        source: "Styled2.displayName = 'Styled2';",
        severity: 'error',
        line: 13,
      },
      {
        file: 'file1.tsx',
        message: "Component 'Styled3' cannot be statically extracted since it's used outside of JSX",
        source: '(window as any).exposeComponent = { x: Styled1, y: Styled3 };',
        severity: 'info',
        line: 4,
      },
    ],
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
    expect(result['style.css']).toMatchInlineSnapshot(`".a{width:100%}.b{background-color:black}"`);
  });
});

test('it bails when it finds a function that can not be statically evaluated', () => {
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
            return <styled.Div css={{ backgroundColor: 'green' }}><div className=\\"a\\" data-glitzname=\\"styled.Div\\"/></styled.Div>;
        }
        const Styled = /*#__PURE__*/ styled(StyledWrapper, { color: 'red' });
        function MyComponent(props) {
            return <StyledWrapper />;
        }
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`".a{background-color:red}"`);
    },
    [
      {
        message:
          'Top level styled.[Element] cannot be statically extracted inside components that are decorated by other components',
        file: 'file1.tsx',
        line: 3,
        severity: 'info',
        source:
          "<styled.Div css={{ backgroundColor: 'green' }}><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>",
      },
    ],
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
            return <div><styled.Div css={{ backgroundColor: 'green' }}><div className=\\"a\\" data-glitzname=\\"styled.Div\\"/></styled.Div></div>;
        }
        const Styled = /*#__PURE__*/ styled(StyledWrapper, { color: 'red' });
        function MyComponent(props) {
            return <StyledWrapper />;
        }
        "
      `);
      expect(result['style.css']).toMatchInlineSnapshot(`".a{background-color:red}"`);
    },
    [
      {
        message:
          'Top level styled.[Element] cannot be statically extracted inside components that are decorated by other components',
        file: 'file1.tsx',
        line: 3,
        severity: 'info',
        source:
          "<styled.Div css={{ backgroundColor: 'green' }}><styled.Div css={{ backgroundColor: 'red' }} /></styled.Div>",
      },
    ],
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
          return <div className=\\"a b c\\" data-glitzname=\\"Styled\\"/>;
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
      const node = <ul className=\\"a b c\\" data-glitzname=\\"ImportantList\\"/>;
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{color:red}.b{list-style:square}.c{font-weight:bold}"`);
  });
});

test('can use decorator in css prop', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
const colorDecorator = styled({
    backgroundColor: 'red',
});
const node1 = <styled.Div css={colorDecorator()} />;
`,
  };

  expectEqual(compile(code), result => {
    expect(result['file1.jsx']).toMatchInlineSnapshot(`
      "import { styled } from '@glitz/react';
      const colorDecorator = /*#__PURE__*/ styled({
          backgroundColor: 'red',
      });
      const node1 = <div className=\\"a\\" data-glitzname=\\"styled.Div\\"/>;
      "
    `);
    expect(result['style.css']).toMatchInlineSnapshot(`".a{background-color:red}"`);
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
      const node = <ul className=\\"a\\" data-glitzname=\\"List\\"/>;
      "
    `);
    expect(result['file3.jsx']).toMatchInlineSnapshot(`
      "import { List as MyList, listDecorator } from './file1';
      const MyNewList = /*#__PURE__*/ listDecorator(MyList, {
          fontWeight: 'bold',
      });
      const node = <ul className=\\"a b c\\" data-glitzname=\\"MyNewList\\"/>;
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
    expect(result['style.css']).toMatchInlineSnapshot(`""`);
  });
});

function expectEqual(
  results: readonly [Code, TransformerDiagnostics],
  test: (result: Code) => void,
  expectedDiagnostics: TransformerDiagnostics = [],
) {
  const [compiled, diagnostics] = results;
  test(
    Object.keys(compiled).reduce<Code>((result, fileName) => {
      if (!fileName.endsWith('fake-glitz.js')) {
        result[fileName] = compiled[fileName];
      }
      return result;
    }, {}),
  );
  for (let i = 0; i < expectedDiagnostics.length; i++) {
    const expectedDiagnostic = expectedDiagnostics[i];
    const diagnostic = diagnostics[i];

    expect(diagnostic).toEqual(expectedDiagnostic);
  }
}
