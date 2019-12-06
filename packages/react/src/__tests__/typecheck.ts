import { resolve } from 'path';
import { typescriptDiagnostics } from '../../../../test-utils';

test('typings', () => {
  const errors = typescriptDiagnostics(resolve(__dirname, '__fixtures__/typings.tsx'));
  expect(errors.length).toBe(14);
  for (const error of errors) {
    expect(error).toMatchSnapshot();
  }
});
