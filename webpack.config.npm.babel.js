import baseConfig from './webpack.config.babel';

export default {
  ...baseConfig,
  entry: undefined, // https://github.com/istarkov/babel-plugin-webpack-loaders#how-it-works
  devtool: undefined,
  output: {
    libraryTarget: 'commonjs2',
  },
};
