export default function anchorableElements(elements) {
  [...elements].forEach(element => {
    // duplicate id in name to benefit from css :target
    element.setAttribute('name', element.getAttribute('id'));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', `#${element.id}`);
    anchor.classList.add('anchor');
    anchor.textContent = '#';
    element.appendChild(anchor);
  });
}
