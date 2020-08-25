import compile from './compile';

type Code = { [fileName: string]: string };

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

test.only('it bails when it finds a function that can not be statically evaluated', () => {
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

function expectEqual(expected: Code, compiled: Code) {
  Object.keys(expected).forEach(fileName => {
    expect(fileName + ':\n' + compiled[fileName].trim().replace(/\r/g, '')).toBe(
      fileName + ':\n' + expected[fileName].trim().replace(/\r/g, ''),
    );
  });
}
