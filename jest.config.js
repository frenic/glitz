module.exports = {
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^@glitz/core$': '<rootDir>/packages/core/src',
    '^@glitz/react$': '<rootDir>/packages/react/src',
  },
  transformIgnorePatterns: ['node_modules'],
  transform: {
    '^.+\\.ts$': '<rootDir>/jest.preprocessor.js',
  },
  testMatch: ['**/src/**/*.spec.ts'],
  setupTestFrameworkScriptFile: '<rootDir>jest.setup.ts',
};
