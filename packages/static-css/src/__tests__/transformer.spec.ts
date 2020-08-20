import compile from './compile';
import { generatedClassNames } from '..';

type Code = { [fileName: string]: string };

beforeEach(() => {
  for (const key of Object.keys(generatedClassNames)) {
    delete generatedClassNames[key];
    generatedClassNames[''] = {};
  }
});

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
    return <div id="some-id" className="a0 a1">hello</div>;
}
`,
    'style.css': `
.a0 { width: '100%' }
.a1 { height: '100%' }
`,
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
    return <div onClick={() => alert('woah!')} className="a2 a0 a1">hello</div>;
}
`,
    'style.css': `
.a0 { width: '100%' }
.a1 { height: '100%' }
.a2 { backgroundColor: 'black' }
`,
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
    return <><div className="m10 m11 m20 m21 a0">hello</div><div className="a1 m12"/></>;
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
    'style.css': `
.a0 { background: '#000' }
.a1 { margin: '10px' }
@media (min-width: 768px) {
  .m10 { width: '50%' }
  .m11 { height: '50%' }
  .m12 { margin: '20px' }
}
@media (max-width: 768px) {
  .m20 { width: '100%' }
  .m21 { height: '100%' }
}
`,
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
    return <div className="a0">hello</div>;
}
`,
    'style.css': `
.a0 { backgroundColor: 'black' }
`,
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
    return <div className="a0">hello</div>;
}
`,
    'style.css': `
.a0 { height: '100%' }
`,
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

function expectEqual(expected: Code, compiled: Code) {
  Object.keys(expected).forEach(fileName => {
    expect(fileName + ':\n' + compiled[fileName].trim().replace(/\r/g, '')).toBe(
      fileName + ':\n' + expected[fileName].trim().replace(/\r/g, ''),
    );
  });
}
