/* global currentPath */

const navigation = document.querySelector('.navigation');
const links = navigation.querySelectorAll('a');
const responsiveNavigation = document.createElement('select');
responsiveNavigation.classList.add('display-on-small');

for (const link of links) {
  let option = document.createElement('option');
  option.text = link.title;
  option.value = link.href;
  if (link.dataset.path === currentPath) {
    option.selected = true;
  }
  responsiveNavigation.appendChild(option);
}

navigation.appendChild(responsiveNavigation);
navigation.addEventListener('change', e => {
  window.location = e.target.value;
});
