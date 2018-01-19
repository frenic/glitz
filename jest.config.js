module.exports = {
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^@glitz/core$': '<rootDir>/packages/core/src',
    '^@glitz/core/server$': '<rootDir>/packages/core/src/server',
    '^@glitz/react$': '<rootDir>/packages/react/src',
    '^@glitz/prefixer$': '<rootDir>/packages/prefixer/src',
  },
  transformIgnorePatterns: ['node_modules'],
  transform: {
    '^.+\\.ts$': '<rootDir>/jest.preprocessor.js',
  },
  testMatch: ['**/src/**/*.spec.ts'],
  setupTestFrameworkScriptFile: '<rootDir>jest.setup.ts',
};
