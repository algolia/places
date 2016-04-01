/* eslint no-console: 0 */
/* global places */

import './responsive-navigation.js';

places({
  container: document.querySelector('#landing-demo')
}).on('change', suggestion => console.log(suggestion));
