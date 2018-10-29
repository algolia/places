// we need to export using commonjs for ease of usage in all
// JavaScript environments

/* eslint-disable import/no-commonjs */

import './src/navigatorLanguage';
import createAutocompleteDataset from './src/createAutocompleteDataset';
import css from './src/places.css';
import insertCss from 'insert-css';
insertCss(css, { prepend: true });

// must use module.exports to be commonJS compatible
module.exports = createAutocompleteDataset;
