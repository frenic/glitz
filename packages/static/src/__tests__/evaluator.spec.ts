import * as ts from 'typescript';
import { isRequiresRuntimeResult, RequiresRuntimeResult, cacheHits } from '../evaluator';
import { evaluate, partiallyEvaluate } from './evaluate';

test('can evaluate a variable', () => {
  const code = {
    'entry.ts': `
const x = 100;
`,
  };
  expect(evaluate('x', code)).toBe(100);
});

test('can reference other variables', () => {
  const code = {
    'entry.ts': `
const x = 100;
const y = x;
`,
  };
  expect(evaluate('y', code)).toBe(100);
});

test('can evaluate addition', () => {
  const code = {
    'entry.ts': `
const x = 100;
const y = x + 100;
`,
  };
  expect(evaluate('y', code)).toBe(100 + 100);
});

test('can evaluate subtraction', () => {
  const code = {
    'entry.ts': `
const x = 100;
const y = x - 100;
`,
  };
  expect(evaluate('y', code)).toBe(100 - 100);
});

test('can partially evaluate', () => {
  const code = {
    'entry.ts': `
const w = 1;
const x = {
  y: 1,
  z: w ? 1 : 2,
};
`,
  };
  const x = partiallyEvaluate('x', node => !ts.isConditionalExpression(node), code);
  expect(x.y).toBe(1);
  expect(ts.isConditionalExpression(x.z)).toBeTruthy();
});

test('can evaluate multiplication', () => {
  const code = {
    'entry.ts': `
const x = 100;
const y = x * 100;
`,
  };
  expect(evaluate('y', code)).toBe(100 * 100);
});

test('can evaluate division', () => {
  const code = {
    'entry.ts': `
const x = 100;
const y = x / 100;
`,
  };
  expect(evaluate('y', code)).toBe(100 / 100);
});

test('can evaluate string concat', () => {
  const code = {
    'entry.ts': `
const x = 'hello ';
const y = x + 'world';
`,
  };
  expect(evaluate('y', code)).toBe('hello world');
});

test('can evaluate string template', () => {
  const code = {
    'entry.ts': `
const x = 'hello';
const y = \`\${x} world\`;
`,
  };
  expect(evaluate('y', code)).toBe('hello world');
});

test('can evaluate a conditional', () => {
  const code = {
    'entry.ts': `
const one: number = 1;
const otherOne: number = 1;
const two: number = 2;
const otherTwo: number = 2;

const allTrue = one === one && 
                one === 1 &&
                one <= 1 &&
                one >= 1 &&
                one === otherOne &&
                !(one === two) &&
                one < two &&
                two > one;
`,
  };
  expect(evaluate('allTrue', code)).toBe(true);
});

test('can evaluate a function', () => {
  const code = {
    'entry.ts': `
const x = 1;
const y = 2;

function doSomething(z: number) {
  return z < 0 ? x : y;
}
`,
  };
  expect(evaluate('doSomething(-100)', code)).toBe(1);
  expect(evaluate('doSomething(100)', code)).toBe(2);
});

test('can evaluate a switch', () => {
  const code = {
    'entry.ts': `
function isTwo(x: number) {
  switch (x) {
    case 1:
      return false;
    case 2:
      return true;
    default:
      return false;
  }
}
`,
  };
  expect(evaluate('isTwo(1)', code)).toBe(false);
  expect(evaluate('isTwo(2)', code)).toBe(true);
  expect(evaluate('isTwo(3)', code)).toBe(false);
});

test('can evaluate a single if statement', () => {
  const code = {
    'entry.ts': `
function isTwo(x: number) {
  const y = x + 1 - 1;
  if (y === 1) {
    return false;
  } else if (y === 2) {
    return true;
  } else {
    return false;
  }
}
`,
  };
  expect(evaluate('isTwo(1)', code)).toBe(false);
  expect(evaluate('isTwo(2)', code)).toBe(true);
  expect(evaluate('isTwo(3)', code)).toBe(false);
});

test('can evaluate a function in a different file', () => {
  const code = {
    'shared1.ts': `
const one = 1;
function calculator(a: number, b: number) {
  return a + b + one;
}
export { calculator };
export default function() {
  return 1;
}
export const oneHundred = 100;
export const twoHundred = 200;
`,
    'shared2.ts': `
export { calculator as theCalculator, oneHundred } from './shared1';
`,
    'shared3.ts': `
export { theCalculator } from './shared2';
import { oneHundred } from './shared2';
export const oneHundredExported = oneHundred;
`,
    'entry.ts': `
import { theCalculator, oneHundredExported } from './shared3';
import { twoHundred } from './shared1';
import getOne from './shared1';
const x = oneHundredExported;
const y = twoHundred;
`,
  };
  expect(evaluate('theCalculator(x, y) + getOne()', code)).toBe(100 + 200 + 1 + 1);
});

test('can use JS globals', () => {
  const code = {
    'entry.ts': `
const res = {
  x: String(1),
  z: Boolean('true'),
  u: Number('123'),
  y: Object.assign({x: 1}, {y: 2}),
}
`.trim(),
  };
  expect(evaluate('res', code)).toMatchObject({
    x: '1',
    z: true,
    u: 123,
    y: { x: 1, y: 2 },
  });
});

test('can inject variables', () => {
  const code = {
    'entry.ts': `
const y = window.innerHeight + 100;
`,
  };
  expect(evaluate('y', code, { window: { innerHeight: 100 } })).toBe(200);
});

test('correctly deals with function overloads', () => {
  const code = {
    'entry.ts': `
function add(a: string, b: string): string;
function add(a: number, b: number): number;
function add(a: any, b: any) {
  return a + b;
}
`,
  };
  expect(evaluate('add(1, 2)', code)).toBe(3);
  expect(evaluate('add("a", "b")', code)).toBe('ab');
});

test('can use rest args', () => {
  const code = {
    'entry.ts': `
const y = (...args: any[]) => args.join(', ');
const x = (arg1: any, ...args: any[]) => arg1 + ': ' + args.join(', ');
const z = y(1, 2, 3) + ', ' + x(1, 2, 3);
`,
  };
  expect(evaluate('z', code)).toBe('1, 2, 3, 1: 2, 3');
});

test('can use spread', () => {
  const code = {
    'entry.ts': `
const y = [1, ...[2, 3]];
const x = (...args: any[]) => args.join(', ');
const z = x(...y);
`,
  };
  expect(evaluate('z', code)).toBe('1, 2, 3');
});

test('can use default args', () => {
  const code = {
    'entry.ts': `
const func1 = (y = 1, x = 2) => y + x;
function func2(z: number, y = 1, x = 2) {
  return z + y + x;
}
`,
  };
  expect(evaluate('func1() + func2(1, 1)', code)).toBe(3 + (1 + 1 + 2));
});

test('handles function scope correctly', () => {
  const code = {
    'entry.ts': `
function func() {
  const myVar = 'local myVar';
  return myVar;
}
function entry(myVar) {
  return func();
}
`,
  };
  expect(evaluate('entry("outside myVar")', code)).toBe('local myVar');
});

test('can have functions with variables', () => {
  const code = {
    'entry.ts': `
const y = () => {
  const local = 1;
  return local + 1;
};

const x = () => {
  const local = 1;
  const localFunc = () => {
    const z = 1;
    return z + local;
  };
  return local + localFunc();
};
`,
  };
  expect(evaluate('y() + x()', code)).toBe(2 + 3);
});

test('handles semi complex functions', () => {
  const code = {
    'entry.ts': `
const y = () => {
  let local = 1;
  if (local === 1) {
    local = 2;
    let innerLocal = local + 2;

    function returnSameThing(x: number) {
      return x + 1 - 1;
    }

    if (false || true) {
      switch (innerLocal) {
        case 1:
          local = returnSameThing(1);
          break;
        case 4:
          local = returnSameThing(4);
          break;
        default:
          local = returnSameThing(-1);
      }
    }
  }
  return local + 1;
};
`,
  };
  expect(evaluate('y()', code)).toBe(5);
});

test('bails if functions have loop statements', () => {
  const code = {
    'entry.ts': `
const y = () => {
  let local = 1;
  while (local < 10) {
    local++;
  }
  return local + 1;
};
`,
  };
  const res = evaluate('y()', code);
  expect(isRequiresRuntimeResult(res)).toBe(true);
});

test('values that are unknown at compile time gets reported correctly', () => {
  const code = {
    'entry.ts': `
const x = 'random value';
const z = 'other random value';
const u = 'some other random value';
const y = window.innerHeight + 100;
`.trim(),
  };
  const res = evaluate('y', code) as RequiresRuntimeResult;
  expect(isRequiresRuntimeResult(res)).toBe(true);
  const diagnostics = res.getDiagnostics();
  expect(diagnostics?.source).toBe('window');
  expect(diagnostics?.line).toBe(4);
  expect(diagnostics?.file).toBe('entry.ts');
});

test('can inject variables', () => {
  const code = {
    'entry.ts': `
const y = window.innerHeight + 100;
`,
  };
  expect(evaluate('y', code, { window: { innerHeight: 100 } })).toBe(200);
});

test('can evaluate enums', () => {
  const code = {
    'entry.ts': `
enum MyEnum {
  Option1,
  Option2,
}
`,
  };
  expect(evaluate('MyEnum[0]', code)).toBe('Option1');
  expect(evaluate('MyEnum.Option1', code)).toBe(0);
  expect(evaluate('MyEnum[1]', code)).toBe('Option2');
  expect(evaluate('MyEnum.Option2', code)).toBe(1);
});

test('can evaluate complex expression', () => {
  const code = {
    'entry.ts': `
const themes = [{id: 'red', color: 'red'}, {id: 'blue', color: 'blue'}];
const staticThemes = themes.reduce((acc, theme) => [
   ...acc,
   Object.assign({}, theme, {isCompact: false, id: theme.id + 'desktop'}),
   Object.assign({}, theme, {isCompact: true, id: theme.id + 'mobile'}),
 ], []);
`,
  };
  expect(evaluate('staticThemes', code)).toMatchInlineSnapshot(`
    Array [
      Object {
        "color": "red",
        "id": "reddesktop",
        "isCompact": false,
      },
      Object {
        "color": "red",
        "id": "redmobile",
        "isCompact": true,
      },
      Object {
        "color": "blue",
        "id": "bluedesktop",
        "isCompact": false,
      },
      Object {
        "color": "blue",
        "id": "bluemobile",
        "isCompact": true,
      },
    ]
  `);
});

test('exported values are cached', () => {
  const code = {
    'cached-file1.ts': `
export function func() {
  return 1;
}
    `,
    'file2.ts': `
import { func } from './cached-file1';
export function otherFunc() {
  return 2 + func();
}
    `,
    'entry.ts': `
import { func } from './cached-file1';
import { otherFunc } from './file2';

const x = func() + otherFunc();
`,
  };
  expect(evaluate('x', code)).toBe(1 + 2 + 1);
  expect('cached-file1.ts' in cacheHits).toBeTruthy();
  expect(cacheHits['cached-file1.ts'].func).toBe(1);
});

test('can inject variables', () => {
  const code = {
    'entry.ts': `
const y = window.innerHeight + 100;
`,
  };
  expect(evaluate('y', code, { window: { innerHeight: 100 } })).toBe(200);
});
