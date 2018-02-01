const path = require('path');
const fs = require('fs');
const gzipSize = require('gzip-size');
const { rollup } = require('rollup');
const replace = require('rollup-plugin-replace');
const typescript = require('rollup-plugin-typescript');
const uglify = require('rollup-plugin-uglify');
const resolver = require('rollup-plugin-node-resolve');

const JSM_TYPE = Symbol();
const CJS_SINGLE_TYPE = Symbol();
const CJS_DOUBLE_TYPE = Symbol();

const [input, ...args] = process.argv.slice(process.argv.findIndex(arg => arg.endsWith('bundle.js')) + 1);
const inputPath = path.join(process.cwd(), input);

const jsm = args.indexOf('--jsm') !== -1;
const cjsDouble = args.indexOf('--cjsx2') !== -1;
const cjsSingle = args.indexOf('--cjs') !== -1;

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
      {
        code: `'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${path.relative(path.dirname(entryPath), resolvePath(productionCjsTemplate))}');
} else {
  module.exports = require('./${path.relative(path.dirname(entryPath), resolvePath(developmentCjsTemplate))}');
}
`,
      },
      entryPath,
    );
  }
}

if (jsm) {
  const template = args[args.indexOf('--jsm') + 1];
  const developmentJsmBundlePath = resolvePath(template + '.js', true);
  build(inputPath, developmentJsmBundlePath, JSM_TYPE, false).catch(error => {
    console.log(error);
    process.exit(1);
  });
}

function resolvePath(relative, jsm = false) {
  return path.join(process.cwd(), jsm ? 'jsm' : 'cjs', relative);
}

async function build(input, output, type, production) {
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
        target: type === JSM_TYPE ? 'es6' : 'es5',
        module: 'es6',
        declaration: false,
        importHelpers: true,
      }),
      ...(type === CJS_DOUBLE_TYPE
        ? [
            replace({
              'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
            }),
          ]
        : []),
      ...(production ? [uglify({ toplevel: true })] : []),
    ],
  });

  const generate = bundle.generate({
    name: 'glitz',
    format: type === JSM_TYPE ? 'es' : 'cjs',
    globals: { react: 'React' },
  });

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
