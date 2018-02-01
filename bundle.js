const path = require('path');
const fs = require('fs');
const gzipSize = require('gzip-size');
const { rollup } = require('rollup');
const replace = require('rollup-plugin-replace');
const typescript = require('rollup-plugin-typescript');
const uglify = require('rollup-plugin-uglify');
const resolver = require('rollup-plugin-node-resolve');

const [input, template, ...args] = process.argv.slice(process.argv.findIndex(arg => arg.endsWith('bundle.js')) + 1);
const double = args.indexOf('--double') !== -1;

const inputPath = resolvePath(input);
const developmentTemplate = `${template}${double ? '.development' : ''}`;

if (double) {
  const productionTemplate = `${template}.production`;
  const productionBundlePath = resolvePath(productionTemplate + '.js');
  build(inputPath, productionBundlePath, true, true).catch(error => {
    console.log(error);
    process.exit(1);
  });

  const entryPath = resolvePath(`${template}.js`);
  write({ code: `'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${path.relative(path.dirname(entryPath), resolvePath(productionTemplate))}');
} else {
  module.exports = require('./${path.relative(path.dirname(entryPath), resolvePath(developmentTemplate))}');
}
` }, entryPath);
}

const developmentBundlePath = resolvePath(developmentTemplate + '.js');
build(inputPath, developmentBundlePath, double, false).catch(error => {
  console.log(error);
  process.exit(1);
});

function resolvePath(relative) {
  return path.join(process.cwd(), relative);
}

async function build(input, output, double, production) {
  // @ts-ignore
  const bundle = await rollup({
    input,
    external: ['react', 'inline-style-prefixer/static'],
    plugins: [
      resolver(),
      typescript({
        typescript: require('typescript'),
        // @ts-ignore
        ...require('./tsconfig.base.json').compilerOptions,
        // @ts-ignore
        ...require('./tsconfig.json').compilerOptions,
        target: 'es5',
        module: 'es6',
        declaration: false,
        importHelpers: true,
      }),
      ...(double
        ? [
            replace({
              'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
            }),
          ]
        : []),
      ...(production ? [uglify({ toplevel: true })] : []),
    ],
  });

  const generate = bundle.generate({ name: 'glitz', format: 'cjs', globals: { react: 'React' } });

  write(await generate, output);
}

function write({ code }, filename) {
  try {
    const gzip = gzipSize.sync(code);

    const dir = path.dirname(filename);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    fs.writeFileSync(filename, code, 'utf-8');

    if (!fs.existsSync(filename)) {
      throw new Error(`Rollup was not able to create bundle ${filename}`);
    }

    console.info(`Package: ${path.relative(__dirname, filename)} (${filesize(code.length, gzip)})`);
  } catch (error) {
    throw error;
  }
}

function filesize(origSize, gzipSize) {
  return `${(origSize / 1024).toFixed(2)}KB / ${(gzipSize / 1024).toFixed(2)}KB gz`;
}
