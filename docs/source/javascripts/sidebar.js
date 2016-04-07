export default function sidebar({headersContainer, sidebarContainer, headerStartLevel}) {
  const headers = headersContainer.querySelectorAll('h2, h3');
  const select = document.createElement('select');
  const list = document.createElement('ul');
  const startLevel = headerStartLevel; // we start at h2
  list.classList.add('no-mobile');
  let currentList = list;
  let currentLevel = startLevel;

  [...headers].forEach(header => {
    const level = parseInt(header.tagName.split('')[1], 10);

    if (level > currentLevel) {
      // we enter a sublist
      currentLevel = level;
      currentList = currentList.lastChild.appendChild(document.createElement('ul'));
    } else if (level < currentLevel) {
      // we exit a sublit
      currentLevel = level;
      currentList = currentList.parentNode.parentNode;
    }

    const title = header.textContent;
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.setAttribute('href', `#${header.getAttribute('id')}`);
    link.textContent = title;
    listItem.appendChild(link);
    currentList.appendChild(listItem);
    const option = document.createElement('option');
    option.setAttribute('value', link.getAttribute('href'));
    option.textContent = `${spacer(currentLevel - startLevel)}${title}`;
    select.classList.add('display-on-small');
    select.appendChild(option);
  });

  select.addEventListener('change', e => window.location = e.target.value);
  sidebarContainer.appendChild(list);
  sidebarContainer.appendChild(select);
  sidebarFollowScroll(sidebarContainer);
  activeLinks(sidebarContainer);
}

function sidebarFollowScroll(sidebarContainer) {
  document.addEventListener('scroll', () => {
    // The following code is used to change the color of the navigation
    // depending the level of page scroll.
    const hero = document.querySelector('.hero-section');
    const navigation = document.querySelector('.navigation');
    const height = hero.offsetHeight;
    const navHeight = navigation.offsetHeight;

    const currentScroll = window.pageYOffset;
    const doc = document.querySelector('.documentation-section');
    let paddingDoc = window.getComputedStyle(doc, null).getPropertyValue('padding-top').split('px')[0];
    paddingDoc = parseInt(paddingDoc, 10);
    // Fix the sidebar navigation
    if (currentScroll > ((height - navHeight) + paddingDoc) && sidebar) {
      sidebarContainer.classList.add('fixed');
    } else {
      sidebarContainer.classList.remove('fixed');
    }
  });
}

// The Following code is used to set active items
// On the documentation sidebar depending on the
// clicked item
function activeLinks(sidebarContainer) {
  const linksContainer = sidebarContainer.querySelector('ul');

  linksContainer.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      [...linksContainer.querySelectorAll('a')].forEach(item => item.classList.remove('active'));
      e.target.classList.add('active');
    }
  });
}

function spacer(n) {
  if (n === 0) return '';
  const arr = new Array(n + 1);
  return `${arr.join('-')}> `;
}
