import sidebar from './sidebar';
import activateClipboard from './activateClipboard';
import anchorableElements from './anchorableElements';

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
