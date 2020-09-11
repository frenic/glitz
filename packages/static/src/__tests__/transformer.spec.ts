import compile, { Code, TransformerDiagnostics } from './compile';

test('can extract simple component', () => {
  const code = {
    'file1.tsx': `
import { styled } from '@glitz/react';
function MyComponent(props: {}) {
    return <Styled id="some-id">hello</Styled>;
}

const Styled = styled.div({
    width: '100%',
    height: '100%'
});
`,
  };

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
function MyComponent(props) {
    return <div id="some-id" className="a b">hello</div>;
}
`,
    'style.css': `.a{width:100%}.b{height:100%}`,
  };

  expectEqual(expected, compile(code));
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

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
function MyComponent(props) {
    return <Styled id="some-id">hello</Styled>;
}
/** @glitz-dynamic */
const Styled = styled.div({
    width: '100%',
    height: '100%'
});
`,
    'style.css': ``,
  };

  expectEqual(expected, compile(code));
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

  const expected = {
    'file1.jsx': `
/** @glitz-all-dynamic */
import { styled } from '@glitz/react';
function MyComponent(props) {
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
    'style.css': ``,
  };

  expectEqual(expected, compile(code));
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

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
function MyComponent(props) {
    return <Styled id="some-id">hello</Styled>;
}
/** @glitz-static */
const Styled = styled.div({
    width: window.theWidth,
    height: '100%'
});
`,
    'style.css': ``,
  };

  expectEqual(expected, compile(code), [
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
  ]);
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

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
function MyComponent(props) {
    return <Styled id="some-id">hello</Styled>;
}
const Styled = styled.div({
    width: (theme) => theme.theWidth,
    height: '100%'
});
`,
    'style.css': ``,
  };

  expectEqual(expected, compile(code), [
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
  ]);
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

  const expected = {
    'file1.jsx': `
/** @glitz-all-static */
import { styled } from '@glitz/react';
function MyComponent(props) {
    return <Styled1 id="some-id"><Styled2 /></Styled1>;
}
const Styled1 = styled.div({
    width: window.theWidth,
    height: '100%'
});
const Styled2 = styled.div({
    width: '100%',
    height: window.theHeight
});
`,
    'style.css': ``,
  };

  expectEqual(expected, compile(code), [
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
  ]);
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

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
function MyComponent(props) {
    return <div onClick={() => alert('woah!')} className="a b c">hello</div>;
}
`,
    'style.css': `.a{width:100%}.b{height:100%}.c{background-color:black}`,
  };

  expectEqual(expected, compile(code));
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

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
function MyComponent(props) {
    return <><div className="a b c d e">hello</div><div className="f g"/></>;
}
function createCompactStyled(compactStyle, style) {
    return styled(compactStyle)({ '@media (min-width: 768px)': style });
}
function largeScreen() {
    return '@media (min-width: 768px)';
}
function smallScreen() {
    return '@media (max-width: 768px)';
}
`,
    'style.css': `.e{background:#000}.f{margin:10px}@media (min-width: 768px){.a{width:50%}.b{height:50%}.g{margin:20px}}@media (max-width: 768px){.c{width:100%}.d{height:100%}}`,
  };

  expectEqual(expected, compile(code));
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

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
function MyComponent(props) {
    return <div className="a">hello</div>;
}
`,
    'style.css': `.a{background-color:black}`,
  };

  expectEqual(expected, compile(code));
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

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
function MyComponent(props) {
    return <div className="a">hello1</div>;
}
`,
    'file2.jsx': `
import { styled } from '@glitz/react';
function MyComponent(props) {
    return <div className="b">hello2</div>;
}
`,
    'style.css': `.a{background-color:black}.b{background-color:red}`,
  };

  expectEqual(expected, compile(code));
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

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
function MyComponent1(props) {
    return <div className="a">hello1</div>;
}
function MyComponent2(props) {
    return <div className="b">hello2</div>;
}
`,
    'style.css': `.a{background-color:black}.b{background-color:red}`,
  };

  expectEqual(expected, compile(code));
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

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
const size = '100' + '%';
function MyComponent(props) {
    return <div className="a">hello</div>;
}
`,
    'style.css': `.a{height:100%}`,
  };

  expectEqual(expected, compile(code));
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

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
function MyComponent(props) {
    return <div id="my-id" className="a b"/>;
}
`,
    'style.css': `.a{height:100%}.b{width:100%}`,
  };

  expectEqual(expected, compile(code));
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

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
function MyComponent(props) {
    const X = <Styled3 />;
    window.exposeComponent = { x: Styled1, y: Styled3 };
    return <><Styled1 id="my-id" css={{ width: '100%' }}/><Styled2 /><X /><div className="b"/></>;
}
const Styled1 = styled.div({
    height: '100%',
});
const Styled2 = styled.div({
    height: '75%',
});
Styled2.displayName = 'Styled2';
const Styled3 = styled.div({
    height: '50%',
});
`,
    'style.css': `.a{height:50%}.b{height:25%}`,
  };

  expectEqual(expected, compile(code));
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

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
function MyComponent(props) {
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
    'style.css': ``,
  };

  expectEqual(expected, compile(code));
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

  const expected = {
    'file1.jsx': `
import { styled } from '@glitz/react';
function MyComponent(props) {
    return (<>
            <styled.Div css={{ color: (theme) => theme.color }}/>
            <DerivedStyled />
            <DeepStyled />
        </>);
}
const Styled = styled.div({
    color: (theme) => theme.color,
});
const DerivedStyled = styled(Styled, {
    backgroundColor: 'black',
});
const DeepStyled = styled.div({
    ':hover': {
        color: (theme) => theme.color,
    },
});
`,
    'style.css': ``,
  };

  expectEqual(expected, compile(code));
});

function expectEqual(
  expected: Code,
  results: readonly [Code, TransformerDiagnostics],
  expectedDiagnostics: TransformerDiagnostics = [],
) {
  const [compiled, diagnostics] = results;
  Object.keys(expected).forEach(fileName => {
    expect(fileName + ':\n' + compiled[fileName].trim().replace(/\r/g, '')).toBe(
      fileName + ':\n' + expected[fileName].trim().replace(/\r/g, ''),
    );
  });
  for (let i = 0; i < expectedDiagnostics.length; i++) {
    const expectedDiagnostic = expectedDiagnostics[i];
    const diagnostic = diagnostics[i];

    expect(diagnostic).toEqual(expectedDiagnostic);
  }
}
