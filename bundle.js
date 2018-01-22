const path = require('path');
const fs = require('fs');
const gzipSize = require('gzip-size');
const { rollup } = require('rollup');

async function build(input, ...args) {
  const estimate = args.indexOf('--estimate') !== -1;

  const filenameEs = path.resolve(process.cwd(), 'dist/index.es.js');
  const filenameCjs = path.resolve(process.cwd(), 'dist/index.cjs.js');

  const inputOptions = (target = 'es6') => ({
    input: path.resolve(process.cwd(), input),
    external: ['react', 'inline-style-prefixer/static'],
    plugins: [
      ...(estimate
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

  const outputOptions = (format = 'es') => ({
    name: 'glitz',
    format,
    globals: {
      react: 'React',
    },
  });

  const bundle = await rollup(inputOptions());

  const generateEs = bundle.generate(outputOptions());
  const generateCjs = bundle.generate(outputOptions('cjs'));

  write(await generateEs, filenameEs);
  write(await generateCjs, filenameCjs);

  if (estimate) {
    const options = inputOptions('es5');
    const bundle = await rollup({
      ...options,
      plugins: [...options.plugins, require('rollup-plugin-uglify')()],
    });
    const { code } = await bundle.generate(outputOptions('iife'));
    const gzip = gzipSize.sync(code);
    console.info(`Estimated (min/gz): ${filesize(code.length, gzip)}`);
  }

  if (args.indexOf('--es5') !== -1) {
    const options = inputOptions('es5');
    const bundle = await rollup(inputOptions('es5'));
    const generate = bundle.generate(outputOptions('iife'));
    write(await generate, path.resolve(process.cwd(), 'dist/index.es5.js'));
  }
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
