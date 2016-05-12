/* global places */

import anchorableElements from './anchorableElements.js';
import responsiveNavigation from './responsiveNavigation.js';
import sidebar from './sidebar.js';
import activateClipboard from './activateClipboard.js';
import './docsearch.js';

responsiveNavigation();
sidebar({
  headersContainer: document.querySelector('.documentation-container'),
  sidebarContainer: document.querySelector('#sidebar'),
  headerStartLevel: 2
});
anchorableElements(
  document
    .querySelector('.documentation-container')
    .querySelectorAll('h2, h3, .api-entry')
);
demo();
activateClipboard([...document.querySelectorAll('.code')]);

function demo() {
  places({
    container: document.querySelector('#docs-getting-started-demo')
  });
}
