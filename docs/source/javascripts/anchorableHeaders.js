export default function anchorableHeaders(headersContainer) {
  const headers = headersContainer.querySelectorAll('h2, h3');

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
