/* eslint no-console: 0 */
/* global places */

import responsiveNavigation from './responsiveNavigation.js';

responsiveNavigation();

const placesAutocomplete = places({
  container: document.querySelector('#landing-demo')
});

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
