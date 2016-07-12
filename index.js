// we need to export using commonjs for ease of usage in all
// JavaScript environments

/* eslint-disable import/no-commonjs */

import places from './src/places';
import version from './src/version.js';

// must use module.exports to be commonJS compatible
module.exports = places;
module.exports.version = version;
