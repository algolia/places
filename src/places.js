/* eslint no-console:0 */
import EventEmitter from 'events';

import algoliasearch from 'algoliasearch';
import autocomplete from 'autocomplete.js';

import formatHit from './formatHit.js';

import './places.scss';
import clearIcon from './icons/clear.svg';
import pinIcon from './icons/address.svg';
import algoliaLogo from './icons/algolia.svg';
import osmLogo from './icons/osm.svg';
import version from './version.js';

const footerTemplate =
`<div class="ap-footer">
Built by <a href="https://www.algolia.com/?UTMFIXME" title="Search by Algolia" class="ap-footer-algolia">${algoliaLogo.trim()}</a>
using <a href="https://community.algolia.com/places/documentation.html#license" class="ap-footer-osm" title="Algolia Places data © OpenStreetMap contributors">${osmLogo.trim()} <span>data</span></a>
</div>`;

const filterSuggestionData = suggestion => ({
  ...suggestion,
  // omit _dropdownValue and _index,
  // _dropdownValue is not needed user side
  // _index is sent at the root of the element
  _dropdownValue: undefined,
  _index: undefined
});

export default function places({
  countries,
  language = navigator.language.split('-')[0],
  container,
  type,
  style
}) {
  const placesInstance = new EventEmitter();
  const client = algoliasearch.initPlaces(
    '  ',
    '  ',
    {hosts: ['c3-test-1.algolia.net']} // use staging for now, FIXME
  );
  client.as._computeRequestHeaders = function() {
    return {targetIndexingIndexes: true}; // no need for any appid or key
  };
  client.as.setExtraHeader('targetIndexingIndexes', true);
  client.as.addAlgoliaAgent += `Algolia Places ${version}`;

  // https://github.com/algolia/autocomplete.js#options
  const autocompleteOptions = {
    autoselect: true,
    hint: false,
    cssClasses: {
      root: 'algolia-places' + (style === false ? '' : ' algolia-places-styled'),
      prefix: 'ap'
    }
  };

  if (process.env.NODE_ENV === 'development') {
    autocompleteOptions.debug = true;
  }

  const templates = {
    suggestion: hit => hit._dropdownValue,
    footer: footerTemplate
  };

  const autocompleteInstance = autocomplete(
    container,
    autocompleteOptions, {
      // https://github.com/algolia/autocomplete.js#sources
      source: (query, cb) => client
        .search({query, language, countries, type, hitsPerPage: 5})
        .then(({hits}) => hits.map(formatHit))
        .then(suggestions => {
          placesInstance.emit('suggestions', {
            suggestions: suggestions.map(filterSuggestionData),
            query: autocompleteInstance.val()
          });
          return suggestions;
        })
        .then(cb)
        .catch(err => console.error(err)),
      templates,
      displayKey: 'value'
    }
  );

  const autocompleteContainer = container.parentNode;

  const autocompleteChangeEvents = ['selected', 'autocompleted'];
  autocompleteChangeEvents.forEach(eventName => {
    autocompleteInstance.on(`autocomplete:${eventName}`, (_, suggestion) => {
      placesInstance.emit('change', {
        suggestion: filterSuggestionData(suggestion),
        query: autocompleteInstance.val(),
        suggestionIndex: suggestion._index
      });
    });
  });
  autocompleteInstance.on('autocomplete:cursorchanged', (_, suggestion) => {
    placesInstance.emit('cursorchanged', {
      suggestion: filterSuggestionData(suggestion),
      query: autocompleteInstance.val(),
      suggestionIndex: suggestion._index
    });
  });

  const clear = document.createElement('button');
  clear.setAttribute('type', 'button');
  clear.classList.add('ap-input-icon');
  clear.innerHTML = clearIcon;
  autocompleteContainer.appendChild(clear);
  clear.style.display = 'none';

  const pin = document.createElement('button');
  pin.setAttribute('type', 'button');
  pin.classList.add('ap-input-icon');
  pin.innerHTML = pinIcon;
  autocompleteContainer.appendChild(pin);

  pin.addEventListener('click', () => autocompleteInstance.focus());
  clear.addEventListener('click', () => {
    autocompleteInstance.autocomplete.setVal('');
    autocompleteInstance.focus();
    clear.style.display = 'none';
    pin.style.display = '';
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
