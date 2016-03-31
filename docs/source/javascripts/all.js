/* global places */

places({
  container: document.querySelector('#landing-demo')
});

// The following code is used to change the color of the navigation
// depending the level of page scroll.
const hero = document.querySelector('.hero-section');
const navigation = document.querySelector('.navigation');
const height = hero.offsetHeight;
const navHeight = navigation.offsetHeight;
const sidebar = document.getElementById('sidebar');


// automatically darken the top menu when going down
// Using requestAnimationFrame
const doc = document.querySelector('.documentation-section');


let [latestKnownScrollY, ticking] = [0, false];

function onScroll() {
  latestKnownScrollY = window.scrollY;
  requestTick();
}

function requestTick() {
  if (!ticking) {
    requestAnimationFrame(updateScroll);
  }
  ticking = true;
}
function updateScroll() {
  ticking = false;
  var currentScrollY = latestKnownScrollY;
  const value = currentScrollY;

  if (value > height) {
    navigation.classList.add('darken');
  } else if (value > (height - navHeight)) {
    navigation.classList.add('init');
    navigation.classList.remove('darken');
  } else {
    navigation.classList.remove('darken', 'init');
  }

  if (doc) {
    let paddingDoc = window.getComputedStyle(doc, null).getPropertyValue('padding-top').split('px')[0];
    paddingDoc = parseInt(paddingDoc, 10);
    // Fix the sidebar navigation
    if (value > ((height - navHeight) + paddingDoc) && sidebar) {
      sidebar.classList.add('fixed');
    } else {
      sidebar.classList.remove('fixed');
    }
  }
}
window.addEventListener('scroll', onScroll, false);


// Responsive navigation
const theSelect = document.createElement('select');

function selectizer() {
   // Let's make the select
  var isSelect = document.getElementById('selectNav');
  theSelect.id = 'selectNav';
  theSelect.classList.add('display-on-small');

  if (!isSelect) {
    document.querySelector('.navigation').appendChild(theSelect);
  }

  const links = document.querySelectorAll('.menu li a');
  var home = document.createElement('option');
  home.text = 'Homepage';
  home.value = 'index.html';
  theSelect.appendChild(home);
  for (let i = 0; i < links.length; i++) {
    let option = document.createElement('option');
    option.text = links[i].textContent;
    option.value = links[i].href;
    theSelect.appendChild(option);
  }
}

window.onload = function() {
  selectizer();
};


theSelect.addEventListener('change', () => {
  var value = this.options[this.selectedIndex].value;
  window.location = value;
});
