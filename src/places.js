/* eslint no-console:0 */
import EventEmitter from 'events';

import algoliasearch from 'algoliasearch';
import autocomplete from 'autocomplete.js';

import defaultTemplates from './defaultTemplates.js';
import formatHit from './formatHit.js';
import version from './version.js';

import './places.scss';
import clearIcon from './icons/clear.svg';
import pinIcon from './icons/address.svg';

const filterSuggestionData = suggestion => ({
  ...suggestion,
  // omit _dropdownValue, _index and _query,
  // _dropdownValue is not needed user side
  // _index & _query are sent at the root of the element
  _dropdownValue: undefined,
  _index: undefined,
  _query: undefined
});

export default function places({
  countries,
  language = navigator.language.split('-')[0],
  container,
  apiKey = ' ',
  appId = ' ',
  templates: userTemplates = {},
  type,
  style
}) {
  const placesInstance = new EventEmitter();
  const client = algoliasearch.initPlaces(
    apiKey,
    appId,
    {hosts: ['c3-test-1.algolia.net']} // use staging for now, FIXME
  );

  const templates = {
    ...defaultTemplates,
    ...userTemplates,
    footer: defaultTemplates.footer
  };

  // when keys are empty, we need to force not sending them through the client
  if (apiKey === ' ' && appId === ' ') {
    client.as._computeRequestHeaders = function() {
      return {targetIndexingIndexes: true}; // no need for any appid or key
    };
  }

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

  const autocompleteInstance = autocomplete(
    container,
    autocompleteOptions, {
      // https://github.com/algolia/autocomplete.js#sources
      source: (query, cb) => client
        .search({query, language, countries, type, hitsPerPage: 5})
        .then(
          ({hits}) => hits.map((hit, hitIndex) =>
            formatHit({
              hit,
              hitIndex,
              query,
              templates
            })
          )
        )
        .then(suggestions => {
          placesInstance.emit('suggestions', {
            query,
            suggestions: suggestions.map(filterSuggestionData)
          });
          return suggestions;
        })
        .then(cb)
        .catch(err => console.error(err)),
      templates: {
        suggestion: hit => hit._dropdownValue,
        footer: defaultTemplates.footer
      },
      displayKey: 'value'
    }
  );

  const autocompleteContainer = container.parentNode;

  const autocompleteChangeEvents = ['selected', 'autocompleted'];
  autocompleteChangeEvents.forEach(eventName => {
    autocompleteInstance.on(`autocomplete:${eventName}`, (_, suggestion) => {
      placesInstance.emit('change', {
        suggestion: filterSuggestionData(suggestion),
        query: suggestion._query,
        suggestionIndex: suggestion._index
      });
    });
  });
  autocompleteInstance.on('autocomplete:cursorchanged', (_, suggestion) => {
    placesInstance.emit('cursorchanged', {
      suggestion: filterSuggestionData(suggestion),
      query: suggestion._query,
      suggestionIndex: suggestion._index
    });
  });

  const clear = document.createElement('button');
  clear.setAttribute('type', 'button');
  clear.classList.add('ap-input-icon');
  clear.classList.add('ap-input-icon-clear');
  clear.innerHTML = clearIcon;
  autocompleteContainer.appendChild(clear);
  clear.style.display = 'none';

  const pin = document.createElement('button');
  pin.setAttribute('type', 'button');
  pin.classList.add('ap-input-icon');
  pin.classList.add('ap-input-icon-pin');
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
