module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false,
      tsconfig: {
        target: 'es6',
        module: 'commonjs',
        sourceMap: true,
        inlineSourceMap: true,
      },
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '^@glitz/core$': '<rootDir>/packages/core/src',
    '^@glitz/react$': '<rootDir>/packages/react/src',
  },
  transformIgnorePatterns: ['node_modules'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/src/**/!(typecheck).spec.(ts|tsx)'],
};
