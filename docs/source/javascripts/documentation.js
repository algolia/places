import './responsive-navigation.js';

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
