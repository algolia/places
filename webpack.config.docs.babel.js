import baseConfig from './webpack.config.babel.js';

export default {
  ...baseConfig,
  entry: './docs/source/javascripts/all.js',
  output: {
    path: './docs/.webpack/js',
    filename: 'all.js'
  }
};
