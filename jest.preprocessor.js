const tsc = require('typescript');
const config = {
  ...require('./tsconfig.base.json').compilerOptions,
  ...require('./tsconfig.json').compilerOptions,
  target: 'es6',
  module: 'commonjs',
};

module.exports = {
  process(src, path) {
    if (path.endsWith('.ts')) {
      return tsc.transpile(src, config, path, []);
    }
    return src;
  },
};
