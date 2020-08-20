module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: {
        target: 'es6',
        module: 'commonjs',
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
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/src/**/*.spec.(ts|tsx)', '**/__tests__/*.(ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>jest.setup.ts'],
};
