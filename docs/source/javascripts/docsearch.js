import docsearch from 'docsearch.js';

const search = docsearch({
  apiKey: '5718722ffb11e109821befd53a1d9fde',
  indexName: 'places',
  inputSelector: '#docsearch',
});

const form = document.querySelector('#docsearch-form');
const docsearchInput = document.querySelector('#docsearch');
const reset = form.querySelector('[type="reset"]');
const searchbox = form.querySelector('.aa-input');

reset.addEventListener('click', () => {
  searchbox.focus();
  reset.classList.add('hide');
  search.autocomplete.autocomplete.setVal('');
});

docsearchInput.addEventListener('keyup', () => {
  if (searchbox.value.length === 0) {
    reset.classList.add('hide');
  } else {
    reset.classList.remove('hide');
  }
});

docsearchInput.addEventListener('change', () =>
  docsearchInput.classList.add('filled')
);

docsearchInput.addEventListener('blur', () => {
  if (docsearchInput.value.length === 0) {
    docsearchInput.classList.remove('filled');
  }
});

search.autocomplete.on('autocomplete:selected', () =>
  reset.classList.add('hide')
);
