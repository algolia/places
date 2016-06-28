import EventEmitter from 'events';

import algoliasearch from 'algoliasearch/lite';
import autocomplete from 'autocomplete.js';

import './navigatorLanguage.js';

import createAutocompleteDataset from './createAutocompleteDataset.js';

import clearIcon from './icons/clear.svg';
import pinIcon from './icons/address.svg';

import css from './places.scss';
import insertCss from 'insert-css';
insertCss(css, {prepend: true});

const errors = {
  multiContainers:
`Algolia Places: 'container' must point to a single <input> element.
Example: instantiate the library twice if you want to bind two <inputs>.

See https://community.algolia.com/places/documentation.html#api-options-container`,
  badContainer:
`Algolia Places: 'container' must point to an <input> element.

See https://community.algolia.com/places/documentation.html#api-options-container`
};

export default function places(options) {
  const {
    container,
    style,
    autocompleteOptions: userAutocompleteOptions = {}
  } = options;

  // multiple DOM elements targeted
  if (container instanceof NodeList) {
    if (container.length > 1) {
      throw new Error(errors.multiContainers);
    }

    // if single node NodeList received, resolve to the first one
    return places({container: container[0], ...options});
  }

  // container sent as a string, resolve it for multiple DOM elements issue
  if (typeof container === 'string') {
    const resolvedContainer = document.querySelectorAll(container);
    return places({container: resolvedContainer, ...options});
  }

  // if not an <input>, error
  if (!(container instanceof HTMLInputElement)) {
    throw new Error(errors.badContainer);
  }

  const placesInstance = new EventEmitter();
  const prefix = 'ap' + (style === false ? '-nostyle' : '');

  const autocompleteOptions = {
    autoselect: true,
    hint: false,
    cssClasses: {
      root: 'algolia-places' + (style === false ? '-nostyle' : ''),
      prefix
    },
    debug: process.env.NODE_ENV === 'development' ? true : false,
    ...userAutocompleteOptions
  };

  const autocompleteDataset = createAutocompleteDataset({
    ...options,
    algoliasearch,
    onHits: ({hits, rawAnswer, query}) => placesInstance.emit('suggestions', {
      rawAnswer,
      query,
      suggestions: hits
    }),
    onError: e => placesInstance.emit('error', e),
    onRateLimitReached: () => {
      const listeners = placesInstance.listenerCount('limit');
      if (listeners === 0) {
        console.log(
`Algolia Places: Current rate limit reached.

Sign up for a free 100,000 queries/month account at
https://www.algolia.com/users/sign_up/places.

Or upgrade your 100,000 queries/month plan by contacting us at
https://community.algolia.com/places/contact.html.`
);
        return;
      }

      placesInstance.emit('limit');
    }
  });
  const autocompleteInstance = autocomplete(container, autocompleteOptions, autocompleteDataset);
  const autocompleteContainer = container.parentNode;

  const autocompleteChangeEvents = ['selected', 'autocompleted'];

  autocompleteChangeEvents.forEach(eventName => {
    autocompleteInstance.on(`autocomplete:${eventName}`, (_, suggestion) => {
      placesInstance.emit('change', {
        rawAnswer: suggestion.rawAnswer,
        query: suggestion.query,
        suggestion,
        suggestionIndex: suggestion.hitIndex
      });
    });
  });
  autocompleteInstance.on('autocomplete:cursorchanged', (_, suggestion) => {
    placesInstance.emit('cursorchanged', {
      rawAnswer: suggestion.rawAnswer,
      query: suggestion.query,
      suggestion,
      suggestionIndex: suggestion.hitIndex
    });
  });

  const clear = document.createElement('button');
  clear.setAttribute('type', 'button');
  clear.classList.add(`${prefix}-input-icon`);
  clear.classList.add(`${prefix}-icon-clear`);
  clear.innerHTML = clearIcon;
  autocompleteContainer.appendChild(clear);
  clear.style.display = 'none';

  const pin = document.createElement('button');
  pin.setAttribute('type', 'button');
  pin.classList.add(`${prefix}-input-icon`);
  pin.classList.add(`${prefix}-input-icon-pin`);
  pin.innerHTML = pinIcon;
  autocompleteContainer.appendChild(pin);

  pin.addEventListener('click', () => autocompleteInstance.focus());
  clear.addEventListener('click', () => {
    autocompleteInstance.autocomplete.setVal('');
    autocompleteInstance.focus();
    clear.style.display = 'none';
    pin.style.display = '';
    placesInstance.emit('clear');
  });

  let previousQuery = '';

  const inputListener = () => {
    const query = autocompleteInstance.val();
    if (query === '') {
      pin.style.display = '';
      clear.style.display = 'none';
      if (previousQuery !== query) {
        placesInstance.emit('clear');
      }
    } else {
      clear.style.display = '';
      pin.style.display = 'none';
    }
    previousQuery = query;
  };

  autocompleteContainer.querySelector(`.${prefix}-input`).addEventListener('input', inputListener);

  placesInstance.destroy = () => {
    // this is the only event we need to manually remove because the input will still be here
    autocompleteContainer.querySelector(`.${prefix}-input`).removeEventListener('input', inputListener);
    autocompleteInstance.autocomplete.destroy();
  };

  return placesInstance;
}
