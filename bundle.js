const path = require('path');
const fs = require('fs');
const gzipSize = require('gzip-size');
const { rollup } = require('rollup');

async function build(input, output, ...args) {
  const production = args.indexOf('--production') !== -1;
  const filename = path.resolve(process.cwd(), `${output}.js`);
  const target = args.indexOf('--es5') !== -1 ? 'es5' : 'es6';
  const format = args.indexOf('--cjs') !== -1 ? 'cjs' : 'es';

  const bundle = await rollup({
    input: path.resolve(process.cwd(), input),
    external: ['react', 'inline-style-prefixer/static'],
    plugins: [
      ...(production
        ? require('rollup-plugin-replace')({
            'process.env.NODE_ENV': JSON.stringify('production'),
          })
        : []),
      require('rollup-plugin-typescript')({
        typescript: require('typescript'),
        ...require('./tsconfig.base.json').compilerOptions,
        ...require('./tsconfig.json').compilerOptions,
        target,
        module: 'es6',
        declaration: false,
        importHelpers: true,
      }),
    ],
  });

  const generate = bundle.generate({ name: 'glitz', format, globals: { react: 'React' } });

  write(await generate, filename);
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

build(...process.argv.slice(process.argv.findIndex(arg => arg.endsWith('bundle.js')) + 1)).catch(error => {
  console.log(error);
  process.exit(1);
});
