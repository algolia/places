// we need to export using commonjs for ease of usage in all
// JavaScript environments
// We therefore need to import in commonjs too. see:
// https://github.com/webpack/webpack/issues/4039

/* eslint-disable import/no-commonjs */

const places = require('./src/places');
const version = require('./src/version');

// must use module.exports to be commonJS compatible
module.exports = places.default;
module.exports.version = version.default;
