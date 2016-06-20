import createAutocompleteDataset from './src/createAutocompleteDataset.js';
import css from './src/places.scss';
import insertCss from 'insert-css';
insertCss(css, {prepend: true});

// must use module.exports to be commonJS compatible
module.exports = createAutocompleteDataset;
