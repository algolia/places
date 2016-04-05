/* eslint no-console: 0 */
/* global places */

import './responsive-navigation.js';

const placesAutocomplete = places({
  container: document.querySelector('#landing-demo')
});

const events = ['change', 'suggestions', 'cursorchanged'];
events.forEach(eventName =>
  placesAutocomplete.on(eventName, eventData => {
    if (!Array.isArray(eventData)) {
      eventData = [eventData];
    }

    console.log(`Algolia Places: received event **${eventName}**`);
    if (typeof console.table === 'function') {
      console.table(eventData);
    } else {
      console.log('event data:', eventData);
    }
  })
);
