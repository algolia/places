import { join } from 'path';

export default {
  entry: {
    places: './index.js',
    placesAutocompleteDataset: './autocompleteDataset.js',
    placesInstantsearchWidget: './instantsearchWidget.js',
  },
  devtool: 'source-map',
  output: {
    path: join(__dirname, './dist/cdn'),
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(svg|css)$/,
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
    ],
  },
  optimization: {
    minimize: false,
  },
};
