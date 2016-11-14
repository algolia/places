/* eslint no-console: 0 */
/* global places */

const $input = document.querySelector('#landing-demo');
const placesAutocomplete = places({
  container: $input,
  useDeviceLocation: true,
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
          const data = eventData[dataKeyName];
          if (Array.isArray(data)) {
            console.table(data);
          } else {
            console.log(data);
          }
        });
      } else {
        console.log('event data:', eventData);
      }
    })
  );
}

const $response = document.querySelector('#json-response');
const $responseText = document.querySelector('#json-response-text');
const $responseTiming = document.querySelector('#json-response-timing');
placesAutocomplete.on('change', e => {
  const content = {
    ...e,
    // hide advanced API event data in demo
    suggestion: {
      ...e.suggestion,
      hit: undefined,
      hitIndex: undefined,
      query: undefined,
      rawAnswer: undefined,
    },
    rawAnswer: undefined,
    suggestionIndex: undefined,
  };
  $responseText.textContent = JSON.stringify(content, null, 2);
  $responseTiming.innerHTML = `Computed in <u>${e.rawAnswer.processingTimeMS}ms</u>`;
  $response.classList.add('display');
});
placesAutocomplete.on('clear', () => {
  $responseText.textContent = '';
  $response.classList.remove('display');
});
