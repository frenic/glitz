const path = require('path');
const fs = require('fs');
const gzipSize = require('gzip-size');
const { rollup } = require('rollup');
const replace = require('rollup-plugin-replace');
const typescript = require('rollup-plugin-typescript');
const { terser } = require('rollup-plugin-terser');
const resolver = require('rollup-plugin-node-resolve');

const CJS_SINGLE_TYPE = Symbol();
const CJS_DOUBLE_TYPE = Symbol();
const ESNEXT_TYPE = Symbol();
const MJS_TYPE = Symbol();

const [input, ...args] = process.argv.slice(process.argv.findIndex(arg => arg.endsWith('bundle.js')) + 1);
const inputPath = path.join(process.cwd(), input);

const cjsDouble = args.indexOf('--cjsx2') !== -1;
const cjsSingle = args.indexOf('--cjs') !== -1;
const esnext = args.indexOf('--esnext') !== -1;
const mjs = args.indexOf('--mjs') !== -1;

if (cjsSingle || cjsDouble) {
  const template = args[args.indexOf('--cjsx2') !== -1 ? args.indexOf('--cjsx2') + 1 : args.indexOf('--cjs') + 1];
  const developmentCjsTemplate = `${template}${cjsSingle ? '' : '.development'}`;

  const developmentCjsBundlePath = resolvePath(developmentCjsTemplate + '.js');
  build(inputPath, developmentCjsBundlePath, cjsSingle ? CJS_SINGLE_TYPE : CJS_DOUBLE_TYPE, false).catch(error => {
    console.log(error);
    process.exit(1);
  });

  if (cjsDouble) {
    const productionCjsTemplate = `${template}.production`;
    const productionCjsBundlePath = resolvePath(productionCjsTemplate + '.js');
    build(inputPath, productionCjsBundlePath, CJS_DOUBLE_TYPE, true).catch(error => {
      console.log(error);
      process.exit(1);
    });

    const entryPath = resolvePath(`${template}.js`);
    write(
      `'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${path.relative(path.dirname(entryPath), resolvePath(productionCjsTemplate))}');
} else {
  module.exports = require('./${path.relative(path.dirname(entryPath), resolvePath(developmentCjsTemplate))}');
}
`,
      entryPath,
    );
  }
}

if (mjs) {
  const template = args[args.indexOf('--mjs') + 1];
  const developmentMjsBundlePath = resolvePath(template + '.js', MJS_TYPE);
  build(inputPath, developmentMjsBundlePath, MJS_TYPE, false).catch(error => {
    console.log(error);
    process.exit(1);
  });
}

if (esnext) {
  const template = args[args.indexOf('--esnext') + 1];
  const developmentEsnextBundlePath = resolvePath(template + '.js', ESNEXT_TYPE);
  build(inputPath, developmentEsnextBundlePath, ESNEXT_TYPE, false).catch(error => {
    console.log(error);
    process.exit(1);
  });
}

function resolvePath(relative, type) {
  return path.join(process.cwd(), type === MJS_TYPE ? 'mjs' : type === ESNEXT_TYPE ? 'esnext' : 'cjs', relative);
}

async function build(input, output, type, production) {
  // @ts-ignore
  const bundle = await rollup({
    input,
    external: [
      '@glitz/core',
      '@glitz/devtool-transformer',
      '@glitz/length-transformer',
      '@glitz/prefixer-transformer',
      '@glitz/react',
      '@glitz/transformers',
      'react',
      'react-is',
      'inline-style-prefixer',
    ],
    plugins: [
      resolver(),
      typescript({
        typescript: require('typescript'),
        ...require('./tsconfig.base.json').compilerOptions,
        ...require('./tsconfig.json').compilerOptions,
        target: type === ESNEXT_TYPE ? 'esnext' : 'es5',
        module: 'es6',
        declaration: false,
      }),
      ...(type === CJS_DOUBLE_TYPE
        ? [
            replace({
              'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
            }),
          ]
        : []),
      ...(production ? [terser({ toplevel: true })] : []),
    ],
  });

  const { output: chunks } = await bundle.generate({
    name: 'glitz',
    format: type === MJS_TYPE || type === ESNEXT_TYPE ? 'es' : 'cjs',
    globals: { react: 'React' },
  });

  for (const { code } of chunks) {
    write(code, output);
  }
}

function write(code, filename) {
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
