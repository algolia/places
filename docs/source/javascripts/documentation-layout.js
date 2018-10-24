import sidebar from './sidebar.js';
import activateClipboard from './activateClipboard.js';
import anchorableElements from './anchorableElements.js';

sidebar({
  headersContainer: document.querySelector('.documentation-container'),
  sidebarContainer: document.querySelector('#sidebar'),
  headerStartLevel: 2,
});
anchorableElements(
  document
    .querySelector('.documentation-container')
    .querySelectorAll('h2, h3, .api-entry')
);
activateClipboard(document.querySelectorAll('.rouge-code'));
