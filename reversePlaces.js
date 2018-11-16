// we need to export using commonjs for ease of usage in all
// JavaScript environments

/* eslint-disable import/no-commonjs */

require('./src/navigatorLanguage');
const createReverseGeocodingSource = require('./src/createReverseGeocodingSource')
  .default;

// must use module.exports to be commonJS compatible
module.exports = createReverseGeocodingSource;
