import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import gzip from 'rollup-plugin-gzip';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/wit.min.js',
    format: 'iife',
    name: 'wit',
  },
  plugins: [
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        ['@babel/env']
      ],
      plugins: [
        ['@babel/plugin-proposal-class-properties']
      ]
    }),
    uglify(),
    gzip()
  ],
};
