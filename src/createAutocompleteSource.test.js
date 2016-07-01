/* eslint-env jest, jasmine */

import formatHit from './formatHit.js';
import version from './version.js';
import createAutocompleteSource from './createAutocompleteSource.js';
import algoliasearch from 'algoliasearch/lite.js';

jest.unmock('./createAutocompleteSource.js');
jest.mock('./formatHit.js', () => jest.fn(hit => ({formattedHit: {...hit}})));
jest.mock('algoliasearch/lite.js', () => require.requireActual('./__mocks__/algoliasearch/lite.js'));

describe('createAutocompleteSource', () => {
  beforeEach(() => formatHit.mockClear());
  beforeEach(() => algoliasearch.__clearSearchStub());

  it('instantiates an Algolia Places client', () => {
    setup();
    expect(algoliasearch.initPlaces).toBeCalledWith(undefined, undefined, undefined);
  });

  it('supports appId and apiKey option', () => {
    const appId = 'id';
    const apiKey = 'key';
    setup({appId, apiKey});
    expect(algoliasearch.initPlaces).toBeCalledWith(appId, apiKey, undefined);
  });

  it('supports clientOptions', () => {
    const clientOptions = {
      some: 'param'
    };
    setup({clientOptions});
    expect(algoliasearch.initPlaces).toBeCalledWith(undefined, undefined, clientOptions);
  });

  it('configures the Algolia Places client agent', () => {
    setup();
    expect(algoliasearch.__addAlgoliaAgentSpy).toBeCalledWith(`Algolia Places ${version}`);
  });

  it('calls Algolia Places search with some default parameters', () => {
    const {source, defaults} = setup();
    source('rivoli');
    expect(algoliasearch.__searchSpy).toBeCalledWith({...defaults, query: 'rivoli'});
  });

  it('supports countries option', () => {
    const {source, defaults} = setup({countries: ['fr']});
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toBeCalledWith({...defaults, countries: ['fr']});
  });

  it('supports type option', () => {
    const {source, defaults} = setup({type: 'city'});
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toBeCalledWith({...defaults, type: 'city'});
  });

  it('supports language option', () => {
    const {source, defaults} = setup({language: 'en'});
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toBeCalledWith({...defaults, language: 'en'});
  });

  it('supports aroundLatLng option', () => {
    const {source, defaults} = setup({aroundLatLng: '123,456'});
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toBeCalledWith({...defaults, aroundLatLng: '123,456'});
  });

  it('supports aroundLatLngViaIP option', () => {
    const {source, defaults} = setup({aroundLatLngViaIP: true});
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toBeCalledWith({...defaults, aroundLatLngViaIP: true});
  });

  it('prefers aroundLatLng over aroundLatLngViaIP', () => {
    const {source, defaults} = setup({aroundLatLng: '123,456', aroundLatLngViaIP: true});
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toBeCalledWith({...defaults, aroundLatLng: '123,456'});
  });

  it('supports aroundRadius option', () => {
    const {source, defaults} = setup({aroundRadius: 2000});
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toBeCalledWith({...defaults, aroundRadius: 2000});
  });

  it('supports useDeviceLocation option', () => {
    const latitude = '456';
    const longitude = '789';
    navigator.geolocation = {watchPosition: fn => fn({coords: {latitude, longitude}})};

    const {source, defaults} = setup({useDeviceLocation: true});
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toBeCalledWith({...defaults, aroundLatLng: '456,789'});
  });

  it('supports computeQueryParams option', () => {
    const params = {myParams: 'wins'};
    const computeQueryParams = jest.fn(() => (params));
    const {source, defaults} = setup({computeQueryParams});
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toBeCalledWith(params);
    expect(computeQueryParams).toBeCalledWith(defaults);
  });

  it('calls the source callback with the formatted hits', () => {
    const {source, defaults, expectedHits, cb} = setup({aroundLatLngViaIP: true});
    return source(defaults.query, cb).then(() => {
      expect(cb).toBeCalledWith(expectedHits);
    });
  });

  it('supports formatInputValue option', () => {
    const {source, defaults, cb} = setup({formatInputValue: 'custom'});
    return source(defaults.query, cb).then(() => {
      expect(cb.mock.calls[0][0][0].formattedHit.formatInputValue).toEqual('custom');
    });
  });

  it('supports onHits option', () => {
    const onHits = jest.fn();
    const {source, defaults, expectedHits, content} = setup({onHits});
    return source(defaults.query).then(() => {
      expect(onHits).toBeCalledWith({
        hits: expectedHits,
        query: defaults.query,
        rawAnswer: content
      });
    });
  });

  it('supports onError option', () => {
    const error = new Error('Nope');
    const searchFn = jest.fn(() => Promise.reject(error));
    const onError = jest.fn();
    algoliasearch.__setSearchStub(searchFn);
    const source = createAutocompleteSource({algoliasearch, onError});
    return new Promise((resolve, reject) => {
      source()
        .then(() => {
          expect(onError).toBeCalledWith(error);
          resolve();
        })
        .catch(() => {
          reject(new Error('This should not happen'));
        });
    });
  });

  it('rejects when onError not present', () => {
    const error = new Error('Nope');
    const searchFn = jest.fn(() => Promise.reject(error));
    algoliasearch.__setSearchStub(searchFn);
    const source = createAutocompleteSource({algoliasearch});
    return new Promise((resolve, reject) => {
      source()
        .then(() => {
          reject(new Error('This should not happen'));
        })
        .catch(e => {
          expect(e).toEqual(error);
          resolve();
        });
    });
  });

  it('supports onRateLimitReached option', () => {
    const error = new Error('Too many requests');
    const searchFn = jest.fn(() => Promise.reject(error));
    const onRateLimitReached = jest.fn();
    algoliasearch.__setSearchStub(searchFn);
    const source = createAutocompleteSource({algoliasearch, onRateLimitReached});
    return new Promise((resolve, reject) => {
      source()
        .then(() => {
          expect(onRateLimitReached).toBeCalled();
          resolve();
        })
        .catch(() => {
          reject(new Error('This should not happen'));
        });
    });
  });
});

function setup(sourceOptions = {}) {
  const content = {hits: [1]};
  algoliasearch.__setSearchStub(jest.fn(() => Promise.resolve(content)));
  const source = createAutocompleteSource({algoliasearch, ...sourceOptions});
  const query = 'test';
  const defaults = {
    query: 'test',
    hitsPerPage: 5,
    language: navigator.language.split('-')[0]
  };
  const cb = jest.fn(hits => hits);
  const expectedHits = content.hits.map((hit, hitIndex) => ({
    formattedHit: {
      hit,
      hitIndex,
      query,
      rawAnswer: content,
      formatInputValue: sourceOptions.formatInputValue || undefined
    }
  }));
  return {source, defaults, expectedHits, content, cb};
}
