const path = require('path');
const fs = require('fs');
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

  await (await rollup(inputOptionsPretty)).write(outputOptionsPretty);
  await (await rollup(inputOptionsUgly)).write(outputOptionsUgly);

  [filenamePretty, filenameUgly].forEach(filename => {
    if (!fs.existsSync(filename)) {
      throw new Error(`Rollup was not able to create bundle ${filename}`);
    }

    const exports = require(filename);
    const names = Object.keys(exports);

    if (names.length === 0) {
      throw new Error(`Bundle ${filename} does not have any export members`);
    }

    console.info(`Package ${filename} exports: ${names.join(', ')}`);
  })
}

build(...process.argv.slice(process.argv.findIndex(arg => arg.endsWith('bundle.js')) + 1)).catch(error => {
  console.error(error);
  process.exit(1);
});
