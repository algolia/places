/* global currentPath */
// currentPath is computed by Middleman, inlined in layout.erb and contains
// the source file name of the current page (index.html, documentation.html)

export default function responsiveNavigation() {
  const navigation = document.querySelector('.ac-nav');
  const links = navigation.querySelectorAll('a');
  const navigationAsSelect = document.createElement('select');

  if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) {
    navigationAsSelect.classList.add('display-on-small', 'device');
  } else {
    navigationAsSelect.classList.add('display-on-small');
  }

  [...links].forEach(link => {
    let option = document.createElement('option');
    option.text = link.title;
    option.value = link.href;
    if (link.dataset.path === currentPath) {
      option.selected = true;
    }
    navigationAsSelect.appendChild(option);
  });

  navigation.appendChild(navigationAsSelect);
  navigationAsSelect.addEventListener('change', e => window.location = e.target.value);
}
