// we need to export using commonjs for ease of usage in all
// JavaScript environments

/* eslint-disable import/no-commonjs */

require('./src/navigatorLanguage');
const createAutocompleteDataset = require('./src/createAutocompleteDataset')
  .default;
const css = require('./babel-css').default;
const insertCss = require('insert-css');
insertCss(css, { prepend: true });

// must use module.exports to be commonJS compatible
module.exports = createAutocompleteDataset;
/* eslint-enable import/no-commonjs */
