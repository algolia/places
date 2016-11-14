import baseConfig from './webpack.config.babel.js';

export default {
  ...baseConfig,
  entry: `./docs/source/javascripts/${process.env.BUNDLE}.js`,
  output: {
    path: './docs/.webpack/js',
    filename: `${process.env.BUNDLE}.js`,
  },
};
