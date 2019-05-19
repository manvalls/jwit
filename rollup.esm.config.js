import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/wit.esm.js',
    format: 'esm',
  },
  plugins: [
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        ['@babel/env', {loose: true}]
      ]
    }),
  ],
};
