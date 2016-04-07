/* global currentPath */
// currentPath is computed by Middleman, inlined in layout.erb and contains
// the source file name of the current page (index.html, documentation.html)

export default function responsiveNavigation() {
  const navigation = document.querySelector('.navigation');
  const links = navigation.querySelectorAll('a');
  const navigationAsSelect = document.createElement('select');
  navigationAsSelect.classList.add('display-on-small');

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
  navigation.addEventListener('change', e => window.location = e.target.value);
}
