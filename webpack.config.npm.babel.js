import baseConfig from './webpack.config.babel.js';

// https://github.com/istarkov/babel-plugin-webpack-loaders#how-it-works

export default {
  ...baseConfig,
  entry: undefined,
  devtool: undefined,
  output: {
    libraryTarget: 'commonjs2',
  },
};
