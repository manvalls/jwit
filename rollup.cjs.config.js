import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/wit.cjs.js',
    format: 'cjs',
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
  ],
};
