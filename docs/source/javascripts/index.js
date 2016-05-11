/* eslint no-console: 0 */
/* global places */

import responsiveNavigation from './responsiveNavigation.js';
import './docsearch.js';

responsiveNavigation();

const $input = document.querySelector('#landing-demo');
const $response = document.querySelector('#json-response');
const placesAutocomplete = places({
  container: $input
});
$input.style.opacity = 1; // we initially hide the input to avoid size flickering

if (process.env.NODE_ENV === 'development') {
  const events = ['change', 'suggestions', 'cursorchanged'];
  events.forEach(eventName =>
    placesAutocomplete.on(eventName, eventData => {
      console.log(`Algolia Places: received event **${eventName}**`);
      if (typeof console.table === 'function') {
        Object.keys(eventData).forEach(dataKeyName => {
          console.log(`data: ${dataKeyName}`);
          console.table(eventData[dataKeyName]);
        });
      } else {
        console.log('event data:', eventData);
      }
    })
  );
}

placesAutocomplete.on('change', function(e) {
  if (e.query === '') {
    $response.textContent = '';
    $response.classList.remove('display');
  } else {
    $response.textContent = JSON.stringify(e, null, 2);
    $response.classList.add('display');
  }
});
