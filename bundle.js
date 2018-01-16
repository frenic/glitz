const path = require('path');
const fs = require('fs');
const gzipSize = require('gzip-size');
const { rollup } = require('rollup');

async function build(input, name) {
  const filenamePretty = path.resolve(process.cwd(), name + '.js');
  const filenameUgly = path.resolve(process.cwd(), name + '.min.js');

  const inputOptionsPretty = {
    input: path.resolve(process.cwd(), input),
    external: ['react'],
    plugins: [
      require('rollup-plugin-node-resolve')(),
      require('rollup-plugin-replace')({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      require('rollup-plugin-typescript')({
        typescript: require('typescript'),
        ...require('./tsconfig.base.json').compilerOptions,
        ...require('./tsconfig.json').compilerOptions,
        target: 'es5',
        module: 'es6',
        declaration: false,
        importHelpers: true,
      }),
    ],
  };
  const inputOptionsUgly = {
    ...inputOptionsPretty,
    plugins: [...inputOptionsPretty.plugins, require('rollup-plugin-uglify')()],
  };

  const outputOptionsPretty = {
    file: filenamePretty,
    name: 'glitz',
    format: 'umd',
    globals: {
      react: 'React',
    },
  }
  const outputOptionsUgly = {
    ...outputOptionsPretty,
    file: filenameUgly,
  };

  generate(inputOptionsPretty, outputOptionsPretty, filenamePretty);
  generate(inputOptionsUgly, outputOptionsUgly, filenameUgly);
}

async function generate(inputOptions, outputOptions, filename) {
  const bundle = await rollup(inputOptions);
  const {code} = await bundle.generate(outputOptions);

  const gzip = await gzipSize(code);

  fs.writeFileSync(filename, code, 'utf-8');

  if (!fs.existsSync(filename)) {
    throw new Error(`Rollup was not able to create bundle ${filename}`);
  }

  const exports = require(filename);
  const names = Object.keys(exports);

  if (names.length === 0) {
    throw new Error(`Bundle ${filename} does not have any export members`);
  }

  console.info(`Package: ${path.relative(__dirname, filename)} / Exports: ${names.join(', ')} / Filesize: ${(code.length / 1024).toFixed(2)}KB (${(gzip / 1024).toFixed(2)}KB gz)`);
}

build(...process.argv.slice(process.argv.findIndex(arg => arg.endsWith('bundle.js')) + 1)).catch(error => {
  console.error(error);
  process.exit(1);
});
