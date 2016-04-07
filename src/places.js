/* eslint no-console:0 */

import algoliasearch from 'algoliasearch';
import autocomplete from 'autocomplete.js';

import createHitFormatter from './createHitFormatter.js';
import formatInputValue from './formatInputValue.js';
import formatAutocompleteSuggestion from './formatAutocompleteSuggestion.js';
import './places.scss';
import EventEmitter from 'events';
import clearIcon from './icons/clear.svg';
import pinIcon from './icons/address.svg';

const hitFormatter = createHitFormatter({
  formatAutocompleteSuggestion,
  formatInputValue
});

export default function places({
  countries,
  language = navigator.language.split('-')[0],
  container
}) {
  const placesInstance = new EventEmitter();
  const client = algoliasearch.initPlaces(
    '6TZ2RYGYRQ',
    '20b9e128b7e37ff38a4e86b08477980b',
    {hosts: ['places-de-1.algolia.net']} // use staging for now, FIXME
  );
  client.as.setExtraHeader('targetIndexingIndexes', true);

  // https://github.com/algolia/autocomplete.js#options
  const options = {
    autoselect: true,
    hint: true,
    cssClasses: {
      root: 'algolia-places',
      prefix: 'ap'
    }
  };

  if (process.env.NODE_ENV === 'development') {
    options.debug = true;
  }

  // https://github.com/algolia/autocomplete.js#options
  const templates = {
    suggestion: hit => hit._dropdownHTMLFormatted
  };

  const autocompleteInstance = autocomplete(
    container,
    options, {
      // https://github.com/algolia/autocomplete.js#sources
      source: (query, cb) => client
        .search({query, language, countries})
        .then(({hits}) => hits.slice(0, 5).map(hitFormatter))
        .then(suggestions => {
          placesInstance.emit('suggestions', {suggestions, query: autocompleteInstance.val()});
          return suggestions;
        })
        .then(cb)
        .catch(err => console.error(err)),
      templates,
      displayKey: '_inputValue'
    }
  );

  const autocompleteContainer = container.parentNode;

  const autocompleteChangeEvents = ['selected', 'autocompleted'];
  autocompleteChangeEvents.forEach(eventName => {
    autocompleteInstance.on(`autocomplete:${eventName}`, (_, suggestion) => {
      placesInstance.emit('change', {suggestion, query: autocompleteInstance.val()});
    });
  });
  autocompleteInstance.on('autocomplete:cursorchanged', (_, suggestion) => {
    placesInstance.emit('cursorchanged', {suggestion, query: autocompleteInstance.val()});
  });

  const clear = document.createElement('button');
  clear.classList.add('ap-input-icon');
  clear.innerHTML = clearIcon;
  autocompleteContainer.appendChild(clear);
  clear.style.display = 'none';

  const pin = document.createElement('button');
  pin.classList.add('ap-input-icon');
  pin.innerHTML = pinIcon;
  autocompleteContainer.appendChild(pin);

  pin.addEventListener('click', () => autocompleteInstance.focus());
  clear.addEventListener('click', () => {
    autocompleteInstance.autocomplete.setVal('');
    autocompleteInstance.focus();
  });

  let previousQuery = '';
  autocompleteContainer.querySelector('.ap-input').addEventListener('input', () => {
    const query = autocompleteInstance.val();
    if (query === '') {
      pin.style.display = '';
      clear.style.display = 'none';
      if (previousQuery !== query) {
        placesInstance.emit('change', {query});
      }
    } else {
      clear.style.display = '';
      pin.style.display = 'none';
    }
    previousQuery = query;
  });

  return placesInstance;
}
