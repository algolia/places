jest.disableAutomock();
jest.mock(
  'algoliasearch/src/browser/builds/algoliasearchLite',
  () => 'algoliasearch'
);
jest.mock('./icons/clear.svg', () => 'clear');
jest.mock('./places.css', () => 'places.css');

jest.mock('./createAutocompleteDataset', () =>
  jest.fn(() => ({
    source: {
      configure: 'configure',
    },
    other: 'autocompleteDataset',
  }))
);

jest.mock('./createReverseGeocodingSource', () =>
  jest.fn(() => ({
    configure: 'configure',
  }))
);

import places from './places';
import errors from './errors';
import EventEmitter from 'events';
import createAutocompleteDataset from './createAutocompleteDataset';
import createReverseGeocodingSource from './createReverseGeocodingSource';
import autocomplete from 'autocomplete.js';

jest.mock('autocomplete.js');

describe('places', () => {
  beforeEach(() => {
    document.querySelector('body').innerHTML = '';
  });

  describe('container', () => {
    it('fails when container is made of multiple HTMLElements', () => {
      document
        .querySelector('body')
        .appendChild(document.createElement('span'));
      document
        .querySelector('body')
        .appendChild(document.createElement('span'));
      const container = document.querySelectorAll('span');
      expect(() => places({ container })).toThrow(errors.multiContainers);
    });

    it('fails when container is a css selector resoling to multiple elements', () => {
      document
        .querySelector('body')
        .appendChild(document.createElement('span'));
      document
        .querySelector('body')
        .appendChild(document.createElement('span'));
      const container = 'span';
      expect(() => places({ container })).toThrow(errors.multiContainers);
    });

    it('fails when container does not resolves to an HTMLInputElement', () => {
      document
        .querySelector('body')
        .appendChild(document.createElement('span'));
      const container = 'span';
      expect(() => places({ container })).toThrow(errors.badContainer);
    });

    it('works when using document.querySelectorAll', () => {
      document
        .querySelector('body')
        .appendChild(document.createElement('input'));
      const container = document.querySelectorAll('input');
      expect(() => places({ container })).not.toThrow();
    });

    it('works when using a css selector', () => {
      document
        .querySelector('body')
        .appendChild(document.createElement('input'));
      const container = 'input';
      expect(() => places({ container })).not.toThrow();
    });
  });

  describe('dataset', () => {
    let args;
    let placesInstance;

    beforeEach(() => {
      createAutocompleteDataset.mockClear();
      document
        .querySelector('body')
        .appendChild(document.createElement('input'));
      const container = document.querySelector('input');
      placesInstance = places({ container, autocomplete: 'option' });
      args = createAutocompleteDataset.mock.calls[0][0];
    });

    it('creates an autocomplete dataset', () =>
      expect(createAutocompleteDataset).toHaveBeenCalled());
    it('passes the algoliasearch client', () =>
      expect(args.algoliasearch).toEqual('algoliasearch'));
    it('passes provided options', () =>
      expect(args.autocomplete).toEqual('option'));

    it('triggers a suggestions event when onHits called', done => {
      placesInstance.once('suggestions', eventData => {
        expect(eventData).toEqual({
          suggestions: 'hits',
          rawAnswer: 'rawAnswer',
          query: 'query',
        });
        done();
      });

      args.onHits({ hits: 'hits', rawAnswer: 'rawAnswer', query: 'query' });
    });

    it('triggers an error event when onError called', done => {
      placesInstance.once('error', eventData => {
        expect(eventData).toEqual('error');
        done();
      });

      args.onError('error');
    });

    it('triggers a limit event when onRateLimitReached called', done => {
      placesInstance.once('limit', eventData => {
        expect(eventData).toEqual({ message: errors.rateLimitReached });
        done();
      });

      args.onRateLimitReached();
    });

    it('writes a message to console when nobody listening to the limit event', () => {
      const consoleLog = console.log; // eslint-disable-line no-console
      console.log = jest.fn(); // eslint-disable-line no-console
      args.onRateLimitReached();
      expect(console.log).toHaveBeenCalledWith(errors.rateLimitReached); // eslint-disable-line no-console
      console.log = consoleLog; // eslint-disable-line no-console
    });
  });

  describe('places autocomplete', () => {
    let placesInstance;

    beforeEach(() => {
      autocomplete.mockClear();
      const container = document
        .querySelector('body')
        .appendChild(document.createElement('input'));
      placesInstance = places({
        container,
        autocompleteOptions: { option: 'value' },
      });
    });

    it('creates an autocomplete instance', () => {
      expect(autocomplete).toHaveBeenCalledWith(
        document.querySelector('input'),
        {
          autoselect: true,
          cssClasses: { prefix: 'ap', root: 'algolia-places' },
          debug: false,
          hint: false,
          option: 'value',
        },
        {
          source: {
            configure: 'configure',
          },
          other: 'autocompleteDataset',
        }
      );
    });

    it('triggers a change event on autocomplete:selected', done => {
      const args = autocomplete.__instance.on.mock.calls[0];
      const eventName = args[0];
      const eventHandler = args[1];

      // .on(eventName)
      const expectedEventName = 'autocomplete:selected';
      expect(eventName).toEqual(expectedEventName);

      // .on(eventName, eventHandler)
      const expectedEventData = {
        rawAnswer: 'rawAnswer',
        query: 'query',
        suggestion: { rawAnswer: 'rawAnswer', query: 'query', hitIndex: 0 },
        suggestionIndex: 0,
      };
      placesInstance.once('change', eventData => {
        expect(eventData).toEqual(expectedEventData);
        done();
      });
      eventHandler(null, {
        rawAnswer: 'rawAnswer',
        query: 'query',
        hitIndex: 0,
      });
    });

    it('triggers a change event on autocomplete:autocompleted', done => {
      const args = autocomplete.__instance.on.mock.calls[1];
      const eventName = args[0];
      const eventHandler = args[1];

      // .on(eventName)
      const expectedEventName = 'autocomplete:autocompleted';
      expect(eventName).toEqual(expectedEventName);

      // .on(eventName, eventHandler)
      const expectedEventData = {
        rawAnswer: 'rawAnswer',
        query: 'query',
        suggestion: { rawAnswer: 'rawAnswer', query: 'query', hitIndex: 0 },
        suggestionIndex: 0,
      };
      placesInstance.once('change', eventData => {
        expect(eventData).toEqual(expectedEventData);
        done();
      });
      eventHandler(null, {
        rawAnswer: 'rawAnswer',
        query: 'query',
        hitIndex: 0,
      });
    });

    it('triggers a cursorchanged event on autocomplete:cursorchanged', done => {
      const args = autocomplete.__instance.on.mock.calls[2];
      const eventName = args[0];
      const eventHandler = args[1];

      // .on(eventName)
      const expectedEventName = 'autocomplete:cursorchanged';
      expect(eventName).toEqual(expectedEventName);

      // .on(eventName, eventHandler)
      const expectedEventData = {
        rawAnswer: 'rawAnswer',
        query: 'query',
        suggestion: { rawAnswer: 'rawAnswer', query: 'query', hitIndex: 0 },
        suggestionIndex: 0,
      };
      placesInstance.once('cursorchanged', eventData => {
        expect(eventData).toEqual(expectedEventData);
        done();
      });
      eventHandler(null, {
        rawAnswer: 'rawAnswer',
        query: 'query',
        hitIndex: 0,
      });
    });

    it('has a clear button', done => {
      const clearButton = document.querySelector(
        'button.ap-input-icon.ap-icon-clear'
      );
      const pinButton = document.querySelector('.ap-icon-pin');
      expect(clearButton.innerHTML).toEqual('clear');
      expect(clearButton.getAttribute('aria-label')).toEqual('clear');

      placesInstance.once('clear', () => {
        expect(
          autocomplete.__instance.autocomplete.setVal
        ).toHaveBeenCalledWith('');
        expect(autocomplete.__instance.focus).toHaveBeenCalled();
        expect(clearButton.style.display).toEqual('none');
        expect(pinButton.style.display).toEqual('');
        done();
      });

      clearButton.dispatchEvent(new Event('click'));
    });

    it('has a pin button', () => {
      const pinButton = document.querySelector(
        'button.ap-input-icon.ap-icon-pin'
      );
      expect(pinButton.style.display).toEqual('');
      expect(pinButton.getAttribute('aria-label')).toEqual('focus');
    });

    describe('input listener', () => {
      let input;
      let pinButton;
      let clearButton;

      beforeEach(() => {
        input = document.querySelector('.ap-input');
        pinButton = document.querySelector('.ap-icon-pin');
        clearButton = document.querySelector('.ap-icon-clear');
      });

      it('listens to the input event', () => {
        expect(autocomplete.__instance.val).not.toHaveBeenCalled();
        input.dispatchEvent(new Event('input'));
        expect(autocomplete.__instance.val).toHaveBeenCalled();
      });

      // eslint-disable-next-line jasmine/missing-expect
      it('emits a clear event when necessary', done => {
        placesInstance.once('clear', done);
        autocomplete.__setQuery('a');
        input.dispatchEvent(new Event('input'));
        autocomplete.__setQuery('');
        input.dispatchEvent(new Event('input'));
      });

      it('does not emits a clear event when unecessary', () => {
        jest.spyOn(placesInstance, 'emit');
        autocomplete.__setQuery('a');
        input.dispatchEvent(new Event('input'));
        autocomplete.__setQuery('');
        input.dispatchEvent(new Event('input'));
        autocomplete.__setQuery('');
        input.dispatchEvent(new Event('input'));
        expect(placesInstance.emit.mock.calls).toHaveLength(1);
      });

      it('hides or show icons given the query', () => {
        autocomplete.__setQuery('hello');
        input.dispatchEvent(new Event('input'));
        expect(clearButton.style.display).toEqual('');
        expect(pinButton.style.display).toEqual('none');

        autocomplete.__setQuery('');
        input.dispatchEvent(new Event('input'));
        expect(clearButton.style.display).toEqual('none');
        expect(pinButton.style.display).toEqual('');
      });

      it('is no more called when destroyed', () => {
        placesInstance.destroy();
        autocomplete.__setQuery('');
        input.dispatchEvent(new Event('input'));
        expect(autocomplete.__instance.val).not.toHaveBeenCalled();
      });
    });

    it('has a destroy method', () => {
      placesInstance.destroy();
      expect(autocomplete.__instance.autocomplete.destroy).toHaveBeenCalled();
    });

    it('has all autocomplete methods', () => {
      const autocompleteMethods = [
        'open',
        'close',
        'getVal',
        'setVal',
        'destroy',
      ];
      autocompleteMethods.forEach(methodName => {
        placesInstance[methodName]('hello');
        expect(
          autocomplete.__instance.autocomplete[methodName]
        ).toHaveBeenCalledWith('hello');
      });
    });

    it('inserts the css file on top', () =>
      expect(document.querySelector('head > style').textContent).toEqual(
        'places.css'
      ));

    it('returns an EventEmitter', () =>
      expect(placesInstance instanceof EventEmitter).toEqual(true));
  });

  it('has a configure method which ignores unsafe params', () => {
    autocomplete.mockClear();
    const container = document
      .querySelector('body')
      .appendChild(document.createElement('input'));

    const configureMock = jest.fn();
    createAutocompleteDataset.mockImplementation(() => ({
      source: {
        configure: configureMock,
      },
      other: 'autocompleteDataset',
    }));

    const placesInstance = places({
      container,
      autocompleteOptions: { option: 'value' },
    });

    placesInstance.configure({
      onHits: () => 123,
      onError: () => 234,
      onRateLimitReached: () => 345,
      templates: {
        value: () => 456,
      },
      type: 'address',
      countries: ['fr'],
    });

    expect(configureMock).toHaveBeenCalledWith({
      type: 'address',
      countries: ['fr'],
    });
  });

  it('has a reverse method which calls createReverseGeocodingSource', () => {
    autocomplete.mockClear();
    const container = document
      .querySelector('body')
      .appendChild(document.createElement('input'));

    const reverseMock = jest.fn();
    createReverseGeocodingSource.mockImplementation(() => reverseMock);

    const placesInstance = places({
      container,
      autocompleteOptions: { option: 'value' },
    });

    placesInstance.reverse('123,234', { language: 'de' });

    expect(reverseMock).toHaveBeenCalledWith('123,234', {
      language: 'de',
    });
  });
});
