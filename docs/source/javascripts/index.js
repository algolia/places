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

const processingTime = time => {
  switch (true) {
    case time < 26:
      return 'data-highlight-fast';
    case time < 46:
      return 'data-highlight-medium';
    case time < 66:
      return 'data-highlight-slow';
    default:
      return 'data-highlight-fast';
  }
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
  const output = JSON.stringify(content, null, 2);

  const regex = {
    key: /"(.*)"/g,
    value: /"(.*)":/g,
    float: /[-]?(\d+\.\d+)/g,
    highlight: /(<em>(.*)<\/em>)/g,
    default: /[:]/g,
  };

  const codes = output
    .replace(regex.value, '<span data-highlight-value>"$1"</span>:')
    .replace(regex.key, '<span data-highlight-key>"$1"</span>')
    .replace(regex.float, '<span data-highlight-value>$1</span>')
    .replace(regex.highlight, '<span data-highlight-match>&lt;em&gt;$1&lt;/em&gt;</span>')
    .replace(regex.default, '<span data-highlight-default>:</span>');

  $responseText.innerHTML = codes;
  $responseTiming.innerHTML = `Computed in <span ${processingTime(e.rawAnswer.processingTimeMS)}>${e.rawAnswer.processingTimeMS}ms</span>`;
  $response.classList.add('display');
});
placesAutocomplete.on('clear', () => {
  $responseText.textContent = '';
  $response.classList.remove('display');
});
