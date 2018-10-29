import baseConfig from './webpack.config.babel';
import { join } from 'path';

export default {
  ...baseConfig,
  entry: `./docs/source/javascripts/${process.env.BUNDLE}.js`,
  output: {
    path: join(__dirname, 'docs/.webpack/js'),
    filename: `${process.env.BUNDLE}.js`,
  },
};
