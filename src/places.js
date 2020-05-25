import EventEmitter from 'events';

import algoliasearch from 'algoliasearch/src/browser/builds/algoliasearchLite';
import autocomplete from 'autocomplete.js';

import './navigatorLanguage';

import createAutocompleteDataset from './createAutocompleteDataset';

import clearIcon from './icons/clear.svg';
import pinIcon from './icons/address.svg';

import css from './places.css';
import insertCss from 'insert-css';
insertCss(css, { prepend: true });

import errors from './errors';
import createReverseGeocodingSource from './createReverseGeocodingSource';

const applyAttributes = (elt, attrs) => {
  Object.entries(attrs).forEach(([name, value]) => {
    elt.setAttribute(name, `${value}`);
  });

  return elt;
};

export default function places(options) {
  const {
    container,
    style,
    accessibility,
    autocompleteOptions: userAutocompleteOptions = {},
  } = options;

  // multiple DOM elements targeted
  if (container instanceof NodeList) {
    if (container.length > 1) {
      throw new Error(errors.multiContainers);
    }

    // if single node NodeList received, resolve to the first one
    return places({ ...options, container: container[0] });
  }

  // container sent as a string, resolve it for multiple DOM elements issue
  if (typeof container === 'string') {
    const resolvedContainer = document.querySelectorAll(container);
    return places({ ...options, container: resolvedContainer });
  }

  // if not an <input>, error
  if (!(container instanceof HTMLInputElement)) {
    throw new Error(errors.badContainer);
  }

  const placesInstance = new EventEmitter();
  const prefix = `ap${style === false ? '-nostyle' : ''}`;

  const autocompleteOptions = {
    autoselect: true,
    hint: false,
    cssClasses: {
      root: `algolia-places${style === false ? '-nostyle' : ''}`,
      prefix,
    },
    debug: process.env.NODE_ENV === 'development',
    ...userAutocompleteOptions,
  };

  const autocompleteDataset = createAutocompleteDataset({
    ...options,
    algoliasearch,
    onHits: ({ hits, rawAnswer, query }) =>
      placesInstance.emit('suggestions', {
        rawAnswer,
        query,
        suggestions: hits,
      }),
    onError: (e) => placesInstance.emit('error', e),
    onRateLimitReached: () => {
      const listeners = placesInstance.listenerCount('limit');
      if (listeners === 0) {
        console.log(errors.rateLimitReached); // eslint-disable-line no-console
        return;
      }

      placesInstance.emit('limit', { message: errors.rateLimitReached });
    },
    onInvalidCredentials: () => {
      if (options && options.appId && options.appId.startsWith('pl')) {
        console.error(errors.invalidCredentials); // eslint-disable-line no-console
      } else {
        console.error(errors.invalidAppId); // eslint-disable-line no-console
      }
    },
    container: undefined,
  });

  const autocompleteInstance = autocomplete(
    container,
    autocompleteOptions,
    autocompleteDataset
  );
  const autocompleteContainer = container.parentNode;

  const autocompleteChangeEvents = ['selected', 'autocompleted'];

  autocompleteChangeEvents.forEach((eventName) => {
    autocompleteInstance.on(`autocomplete:${eventName}`, (_, suggestion) => {
      placesInstance.emit('change', {
        rawAnswer: suggestion.rawAnswer,
        query: suggestion.query,
        suggestion,
        suggestionIndex: suggestion.hitIndex,
      });
    });
  });
  autocompleteInstance.on('autocomplete:cursorchanged', (_, suggestion) => {
    placesInstance.emit('cursorchanged', {
      rawAnswer: suggestion.rawAnswer,
      query: suggestion.query,
      suggestion,
      suggestionIndex: suggestion.hitIndex,
    });
  });

  const clear = document.createElement('button');
  clear.setAttribute('type', 'button');
  clear.setAttribute('aria-label', 'clear');
  if (
    accessibility &&
    accessibility.clearButton &&
    accessibility.clearButton instanceof Object
  ) {
    applyAttributes(clear, accessibility.clearButton);
  }
  clear.classList.add(`${prefix}-input-icon`);
  clear.classList.add(`${prefix}-icon-clear`);
  clear.innerHTML = clearIcon;
  autocompleteContainer.appendChild(clear);
  clear.style.display = 'none';

  const pin = document.createElement('button');
  pin.setAttribute('type', 'button');
  pin.setAttribute('aria-label', 'focus');
  if (
    accessibility &&
    accessibility.pinButton &&
    accessibility.pinButton instanceof Object
  ) {
    applyAttributes(pin, accessibility.pinButton);
  }
  pin.classList.add(`${prefix}-input-icon`);
  pin.classList.add(`${prefix}-icon-pin`);
  pin.innerHTML = pinIcon;
  autocompleteContainer.appendChild(pin);

  pin.addEventListener('click', () => {
    autocompleteDataset.source.configure({ useDeviceLocation: true });
    autocompleteInstance.focus();
    placesInstance.emit('locate');
  });

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

  autocompleteContainer
    .querySelector(`.${prefix}-input`)
    .addEventListener('input', inputListener);

  const autocompleteIsomorphicMethods = ['open', 'close'];
  autocompleteIsomorphicMethods.forEach((methodName) => {
    placesInstance[methodName] = (...args) => {
      autocompleteInstance.autocomplete[methodName](...args);
    };
  });

  placesInstance.getVal = () => {
    return autocompleteInstance.val();
  };

  placesInstance.destroy = (...args) => {
    autocompleteContainer
      .querySelector(`.${prefix}-input`)
      .removeEventListener('input', inputListener);

    autocompleteInstance.autocomplete.destroy(...args);
  };

  placesInstance.setVal = (...args) => {
    previousQuery = args[0];
    if (previousQuery === '') {
      pin.style.display = '';
      clear.style.display = 'none';
    } else {
      clear.style.display = '';
      pin.style.display = 'none';
    }
    autocompleteInstance.autocomplete.setVal(...args);
  };

  placesInstance.autocomplete = autocompleteInstance;

  placesInstance.search = (query = '') =>
    new Promise((resolve) => {
      autocompleteDataset.source(query, resolve);
    });

  placesInstance.configure = (configuration) => {
    const safeConfig = { ...configuration };

    delete safeConfig.onHits;
    delete safeConfig.onError;
    delete safeConfig.onRateLimitReached;
    delete safeConfig.onInvalidCredentials;
    delete safeConfig.templates;

    autocompleteDataset.source.configure(safeConfig);
    return placesInstance;
  };

  placesInstance.reverse = createReverseGeocodingSource({
    ...options,
    algoliasearch,
    formatInputValue: (options.templates || {}).value,
    onHits: ({ hits, rawAnswer, query }) =>
      placesInstance.emit('reverse', {
        rawAnswer,
        query,
        suggestions: hits,
      }),
    onError: (e) => placesInstance.emit('error', e),
    onRateLimitReached: () => {
      const listeners = placesInstance.listenerCount('limit');
      if (listeners === 0) {
        console.log(errors.rateLimitReached); // eslint-disable-line no-console
        return;
      }

      placesInstance.emit('limit', { message: errors.rateLimitReached });
    },
    onInvalidCredentials: () => {
      if (options && options.appId && options.appId.startsWith('pl')) {
        console.error(errors.invalidCredentials); // eslint-disable-line no-console
      } else {
        console.error(errors.invalidAppId); // eslint-disable-line no-console
      }
    },
  });

  return placesInstance;
}
