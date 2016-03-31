/* eslint no-console:0 */

import algoliasearch from 'algoliasearch';
import autocomplete from 'autocomplete.js';

import createHitFormatter from './createHitFormatter.js';
import formatInputValue from './formatInputValue.js';
import formatAutocompleteSuggestion from './formatAutocompleteSuggestion.js';
import './places.scss';
import EventEmitter from 'events';

const hitFormatter = createHitFormatter({
  formatAutocompleteSuggestion,
  formatInputValue
});

export default function places({
  // countries,
  // language = navigator.language,
  container
}) {
  const placesInstance = new EventEmitter();
  const client = algoliasearch.initPlaces('6TZ2RYGYRQ', '20b9e128b7e37ff38a4e86b08477980b');

  // https://github.com/algolia/autocomplete.js#options
  const options = {
    debug: true,
    openOnFocus: true,
    autoselect: true,
    hint: true
  };

  // https://github.com/algolia/autocomplete.js#options
  const templates = {
    suggestion: hit => hit.suggestion
  };

  // https://github.com/algolia/autocomplete.js#sources
  const source = (query, cb) => client
    .search({query})
    .then(({hits}) => hits.slice(0, 5).map(hitFormatter))
    .then(hits => {console.log(hits); return hits;})
    .then(cb)
    .catch(err => console.error(err));

  const autocompleteInstance = autocomplete(
    container,
    options, {
      source,
      templates
    }
  );

  const autocompleteEvents = ['selected', 'autocompleted'];
  autocompleteEvents.forEach(eventName => {
    autocompleteInstance.on(`autocomplete:${eventName}`, (_, suggestion) => {
      placesInstance.emit('change', suggestion);
    });
  });

  const autocompleteContainer = container.parentNode;
  autocompleteContainer.classList.add('algolia-places');

  return placesInstance;
}
