import anchorableHeaders from './anchorableHeaders.js';
import responsiveNavigation from './responsiveNavigation.js';
import sidebar from './sidebar.js';

responsiveNavigation();
sidebar({
  headersContainer: document.querySelector('.documentation-container'),
  sidebarContainer: document.querySelector('#sidebar'),
  headerStartLevel: 2
});
anchorableHeaders(document.querySelector('.documentation-container'));
