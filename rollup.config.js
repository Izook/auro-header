import { terser } from 'rollup-plugin-terser';
import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import resolve from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';

const production = !process.env.ROLLUP_WATCH;

const getSharedPlugins = (isLegacy) => [
  resolve({
    // in case of multiple lit-element versions (e.g. importing another auro component)
    dedupe: ['lit-element', 'lit-html']
  }),
  commonjs(),
  // skipPreflightCheck flag needed or else build fails
  // see https://github.com/rollup/plugins/issues/381
  babel({
    babelHelpers: 'bundled',
    envName: isLegacy ? 'legacy' : 'modern',
    skipPreflightCheck: true
  }),
  minifyHTML(),
  terser()
];

const modernConfig = {
  input: 'index.js',
  output: {
    format: 'esm',
    file: 'dist/auro-header__bundled.js'
  },
  plugins: [
    // remove shady DOM polyfill for modern browsers
    // https://lit-element.polymer-project.org/guide/build#compile-out-the-shady-render-module
    alias({
      entries: [
        {
          find: 'lit-html/lib/shady-render.js',
          replacement: 'node_modules/lit-html/lit-html.js'
        }
      ]
    }),
    ...getSharedPlugins(false),
    !production &&
      serve({
        open: true,
        openPage: '/docs/'
      })
  ]
};

const legacyConfig = {
  input: 'src/es5.js',
  output: {
    format: 'iife',
    file: 'dist/auro-header__bundled.es5.js'
  },
  plugins: getSharedPlugins(true)
};

export default [modernConfig, legacyConfig];
