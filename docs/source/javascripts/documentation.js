/* global places */

import './responsive-navigation.js';

demo();
anchorableTitles();
sidebarFollowScroll();
activeLinks();

function demo() {
  places({
    container: document.querySelector('#docs-getting-started-demo')
  });
}

function anchorableTitles() {
  const headers =
    document
      .querySelector('.documentation-container')
      .querySelectorAll('h1, h2, h3');

  [...headers].forEach(header => {
    // duplicate id in name to benefit from css :target
    header.setAttribute('name', header.getAttribute('id'));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', `#${header.id}`);
    anchor.classList.add('anchor');
    anchor.textContent = '#';
    header.appendChild(anchor);
  });
}

function sidebarFollowScroll() {
  document.addEventListener('scroll', () => {
    // The following code is used to change the color of the navigation
    // depending the level of page scroll.
    const hero = document.querySelector('.hero-section');
    const navigation = document.querySelector('.navigation');
    const height = hero.offsetHeight;
    const navHeight = navigation.offsetHeight;
    const sidebar = document.getElementById('sidebar');

    const currentScroll = window.pageYOffset;
    const doc = document.querySelector('.documentation-section');
    let paddingDoc = window.getComputedStyle(doc, null).getPropertyValue('padding-top').split('px')[0];
    paddingDoc = parseInt(paddingDoc, 10);
    // Fix the sidebar navigation
    if (currentScroll > ((height - navHeight) + paddingDoc) && sidebar) {
      sidebar.classList.add('fixed');
    } else {
      sidebar.classList.remove('fixed');
    }
  });
}

// The Following code is used to set active items
// On the documentation sidebar depending on the
// clicked item
function activeLinks() {
  const linksContainer = document.querySelector('#sidebar ul');
  const removeActive = (item) => {
    item.classList.remove('active');
  };

  linksContainer.addEventListener('click', function(e) {
    if (e.target.tagName === 'A') {
      [].forEach.call(this.children, removeActive);
      e.target.parentNode.classList.add('active');
    }
  });
}


