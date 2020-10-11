module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: {
        target: 'es6',
        module: 'commonjs',
        sourceMap: true,
        inlineSourceMap: true,
      },
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^@glitz/core$': '<rootDir>/packages/core/src',
    '^@glitz/react$': '<rootDir>/packages/react/src',
  },
  transformIgnorePatterns: ['node_modules'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/src/**/!(typecheck).spec.(ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>jest.setup.ts'],
};
