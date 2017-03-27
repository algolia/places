import webpack from 'webpack';
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
  // replace usage of process.env.NODE_ENV with the actual NODE_ENV from command line
  // when building. Some modules might be using it, this way we will reduce the code output when
  // NODE_ENV === 'production' and NODE_ENV=production was used to build
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
};
