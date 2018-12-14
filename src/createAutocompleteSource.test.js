import formatHit from './formatHit';
import version from './version';
import createAutocompleteSource from './createAutocompleteSource';
import algoliasearch from 'algoliasearch/src/browser/builds/algoliasearchLite';

jest.mock('./formatHit.js', () =>
  jest.fn(hit => ({ formattedHit: { ...hit } }))
);
jest.mock('algoliasearch/src/browser/builds/algoliasearchLite.js', () =>
  require.requireActual(
    '../__mocks__/algoliasearch/src/browser/builds/algoliasearchLite.js'
  )
);

describe('createAutocompleteSource', () => {
  beforeEach(() => formatHit.mockClear());
  beforeEach(() => algoliasearch.__searchSpy.mockClear());
  beforeEach(() => algoliasearch.__clearSearchStub());

  it('instantiates an Algolia Places client', () => {
    setup();
    expect(algoliasearch.initPlaces).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined
    );
  });

  it('supports appId and apiKey option', () => {
    const appId = 'id';
    const apiKey = 'key';
    setup({ appId, apiKey });
    expect(algoliasearch.initPlaces).toHaveBeenCalledWith(
      appId,
      apiKey,
      undefined
    );
  });

  it('supports clientOptions', () => {
    const clientOptions = {
      some: 'param',
    };
    setup({ clientOptions });
    expect(algoliasearch.initPlaces).toHaveBeenCalledWith(
      undefined,
      undefined,
      clientOptions
    );
  });

  it('configures the Algolia Places client agent', () => {
    setup();
    expect(algoliasearch.__addAlgoliaAgentSpy).toHaveBeenCalledWith(
      `Algolia Places ${version}`
    );
  });

  it('calls Algolia Places search with some default parameters', () => {
    const { source, defaults } = setup();
    source('rivoli');
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      query: 'rivoli',
    });
  });

  it('supports countries option', () => {
    const { source, defaults } = setup({ countries: ['fr'] });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      countries: ['fr'],
    });
  });

  it('lowercases countries option', () => {
    const { source, defaults } = setup({ countries: ['FR'] });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      countries: ['fr'],
    });
  });

  it('supports type option', () => {
    const { source, defaults } = setup({ type: 'city' });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      type: 'city',
    });
  });

  it('supports language option', () => {
    const { source, defaults } = setup({ language: 'en' });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      language: 'en',
    });
  });

  it('lowercases language option', () => {
    const { source, defaults } = setup({ language: 'EN' });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      language: 'en',
    });
  });

  it('supports aroundLatLng option', () => {
    const { source, defaults } = setup({ aroundLatLng: '123,456' });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      aroundLatLng: '123,456',
    });
  });

  it('supports aroundLatLngViaIP option', () => {
    const { source, defaults } = setup({ aroundLatLngViaIP: true });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      aroundLatLngViaIP: true,
    });
  });

  it('prefers aroundLatLng over aroundLatLngViaIP', () => {
    const { source, defaults } = setup({
      aroundLatLng: '123,456',
      aroundLatLngViaIP: true,
    });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      aroundLatLng: '123,456',
    });
  });

  it('supports aroundRadius option', () => {
    const { source, defaults } = setup({ aroundRadius: 2000 });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      aroundRadius: 2000,
    });
  });

  it('supports insidePolygon option', () => {
    const { source, defaults } = setup({ insidePolygon: 2000 });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      insidePolygon: 2000,
    });
  });

  it('supports insideBoundingBox option', () => {
    const { source, defaults } = setup({ insideBoundingBox: 2000 });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      insideBoundingBox: 2000,
    });
  });

  it('supports getRankingInfo option', () => {
    const { source, defaults } = setup({ getRankingInfo: true });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      getRankingInfo: true,
    });
  });

  it('supports hitsPerPage option', () => {
    const { source, defaults } = setup({ hitsPerPage: 2 });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      hitsPerPage: 2,
    });
  });

  it('supports useDeviceLocation option', () => {
    const latitude = '456';
    const longitude = '789';
    navigator.geolocation = {
      watchPosition: fn => fn({ coords: { latitude, longitude } }),
    };

    const { source, defaults } = setup({ useDeviceLocation: true });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
      ...defaults,
      aroundLatLng: '456,789',
    });
  });

  it('supports computeQueryParams option', () => {
    const params = { myParams: 'wins' };
    const computeQueryParams = jest.fn(() => params);
    const { source, defaults } = setup({ computeQueryParams });
    source(defaults.query);
    expect(algoliasearch.__searchSpy).toHaveBeenCalledWith(params);
    expect(computeQueryParams).toHaveBeenCalledWith(defaults);
  });

  it('calls the source callback with the formatted hits', () => {
    const { source, defaults, expectedHits, cb } = setup({
      aroundLatLngViaIP: true,
    });
    return source(defaults.query, cb).then(() => {
      expect(cb).toHaveBeenCalledWith(expectedHits);
    });
  });

  it('supports formatInputValue option', () => {
    const { source, defaults, cb } = setup({ formatInputValue: 'custom' });
    return source(defaults.query, cb).then(() => {
      expect(cb.mock.calls[0][0][0].formattedHit.formatInputValue).toEqual(
        'custom'
      );
    });
  });

  it('supports onHits option', () => {
    const onHits = jest.fn();
    const { source, defaults, expectedHits, content } = setup({ onHits });
    return source(defaults.query).then(() => {
      expect(onHits).toHaveBeenCalledWith({
        hits: expectedHits,
        query: defaults.query,
        rawAnswer: content,
      });
    });
  });

  it('supports onError option', () => {
    const error = new Error('Nope');
    const searchFn = jest.fn(() => Promise.reject(error));
    const onError = jest.fn();
    algoliasearch.__setSearchStub(searchFn);
    const source = createAutocompleteSource({ algoliasearch, onError });
    return new Promise((resolve, reject) => {
      source()
        .then(() => {
          expect(onError).toHaveBeenCalledWith(error);
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
    const source = createAutocompleteSource({ algoliasearch });
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
    const error = new Error('Some error message');
    error.statusCode = 429;
    const searchFn = jest.fn(() => Promise.reject(error));
    const onRateLimitReached = jest.fn();
    algoliasearch.__setSearchStub(searchFn);
    const source = createAutocompleteSource({
      algoliasearch,
      onRateLimitReached,
    });
    return new Promise((resolve, reject) => {
      source()
        .then(() => {
          expect(onRateLimitReached).toHaveBeenCalled();
          resolve();
        })
        .catch(() => {
          reject(new Error('This should not happen'));
        });
    });
  });
});

describe('createAutocompleteSource.configure', () => {
  beforeEach(() => formatHit.mockClear());
  beforeEach(() => algoliasearch.__searchSpy.mockClear());
  beforeEach(() => algoliasearch.__clearSearchStub());

  describe('controls', () => {
    it('allows reconfiguration of geolocation controls', () => {
      const latitude = '456';
      const longitude = '789';
      navigator.geolocation = {
        watchPosition: fn => fn({ coords: { latitude, longitude } }),
      };

      const { source, defaults } = setup({ useDeviceLocation: false });
      source(defaults.query);
      expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({ ...defaults });
      source.configure({ useDeviceLocation: true });
      source(defaults.query);
      expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
        ...defaults,
        aroundLatLng: '456,789',
      });
    });

    it('allows reconfiguration of onHits controls', async () => {
      const onHits = jest.fn();
      const otherOnHits = jest.fn();
      const { source, defaults, expectedHits, content } = setup({ onHits });

      await source(defaults.query);
      expect(onHits).toHaveBeenCalledWith({
        hits: expectedHits,
        query: defaults.query,
        rawAnswer: content,
      });

      expect(otherOnHits).not.toHaveBeenCalled();

      onHits.mockClear();
      source.configure({ onHits: otherOnHits });

      await source(defaults.query);
      expect(otherOnHits).toHaveBeenCalledWith({
        hits: expectedHits,
        query: defaults.query,
        rawAnswer: content,
      });

      expect(onHits).not.toHaveBeenCalled();
    });

    it('allows reconfiguration of onError controls', async () => {
      const error = new Error('Nope');
      const searchFn = jest.fn(() => Promise.reject(error));
      const onError = jest.fn();
      const otherOnError = jest.fn();
      algoliasearch.__setSearchStub(searchFn);
      const source = createAutocompleteSource({ algoliasearch, onError });

      await source();
      expect(onError).toHaveBeenCalledWith(error);
      expect(otherOnError).not.toHaveBeenCalled();

      onError.mockClear();

      source.configure({ onError: otherOnError });

      await source();
      expect(otherOnError).toHaveBeenCalledWith(error);
      expect(onError).not.toHaveBeenCalled();
    });

    it('allows reconfiguration of onRateLimitReached controls', async () => {
      const error = new Error('Some error message');
      error.statusCode = 429;
      const searchFn = jest.fn(() => Promise.reject(error));
      const onRateLimitReached = jest.fn();
      const otherOnRateLimitReached = jest.fn();
      algoliasearch.__setSearchStub(searchFn);
      const source = createAutocompleteSource({
        algoliasearch,
        onRateLimitReached,
      });

      await source();
      expect(onRateLimitReached).toHaveBeenCalled();
      expect(otherOnRateLimitReached).not.toHaveBeenCalled();

      onRateLimitReached.mockClear();

      source.configure({
        onRateLimitReached: otherOnRateLimitReached,
      });

      await source();
      expect(otherOnRateLimitReached).toHaveBeenCalled();
      expect(onRateLimitReached).not.toHaveBeenCalled();
    });

    it('allows reconfiguration of formatInputValue controls', async () => {
      const { source, defaults, cb } = setup({ formatInputValue: 'custom' });
      await source(defaults.query, cb);

      expect(cb.mock.calls[0][0][0].formattedHit.formatInputValue).toEqual(
        'custom'
      );

      source.configure({ formatInputValue: 'otherCustom' });
      await source(defaults.query, cb);

      expect(cb.mock.calls[1][0][0].formattedHit.formatInputValue).toEqual(
        'otherCustom'
      );
    });

    it('allows reconfiguration of computeQueryParams controls', async () => {
      const params = { myParams: 'wins' };
      const computeQueryParams = jest.fn(() => params);

      const otherParams = { myParams: 'winsMore' };
      const otherComputeQueryParams = jest.fn(() => otherParams);

      const { source, defaults } = setup({ computeQueryParams });
      await source(defaults.query);
      expect(algoliasearch.__searchSpy).toHaveBeenCalledWith(params);
      expect(computeQueryParams).toHaveBeenCalledWith(defaults);
      expect(otherComputeQueryParams).not.toHaveBeenCalled();

      algoliasearch.__searchSpy.mockClear();
      computeQueryParams.mockClear();

      source.configure({
        computeQueryParams: otherComputeQueryParams,
      });

      await source(defaults.query);
      expect(algoliasearch.__searchSpy).toHaveBeenCalledWith(otherParams);
      expect(otherComputeQueryParams).toHaveBeenCalledWith(defaults);
      expect(computeQueryParams).not.toHaveBeenCalled();
    });
  });

  describe('params', () => {
    it('allows reconfiguration of query parameters', async () => {
      const { source, defaults } = setup();

      await source('rivoli');
      expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
        ...defaults,
        query: 'rivoli',
      });

      algoliasearch.__searchSpy.mockClear();

      const params = {
        hitsPerPage: 2,
        aroundLatLng: `123,234`,
        aroundRadius: 10000,
        insideBoundingBox: `boundingBox`,
        insidePolygon: `polygon`,
        getRankingInfo: true,
        countries: ['fr'],
        language: 'pt',
        type: 'city',
      };

      source.configure(params);

      await source('rivoli');

      expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
        ...defaults,
        ...params,
        query: 'rivoli',
      });
    });

    it('allows partial reconfiguration of query parameters', async () => {
      const { source, defaults } = setup();

      await source('rivoli');
      expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
        ...defaults,
        query: 'rivoli',
      });

      algoliasearch.__searchSpy.mockClear();

      const params = {
        aroundLatLngViaIP: false,
        getRankingInfo: true,
        countries: ['fr'],
        language: 'pt',
        type: 'city',
      };

      source.configure(params);

      await source('rivoli');

      expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
        ...defaults,
        ...params,
        query: 'rivoli',
      });
    });
  });

  describe('reset', () => {
    it('allows reset of query parameters to defaults', async () => {
      const initialParams = {
        hitsPerPage: 2,
        aroundLatLng: `123,234`,
        aroundRadius: 10000,
        insideBoundingBox: `boundingBox`,
        insidePolygon: `polygon`,
        getRankingInfo: true,
        countries: ['fr'],
        language: 'pt',
        type: 'city',
      };
      const { source, defaults } = setup(initialParams);

      await source('rivoli');

      expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
        ...defaults,
        ...initialParams,
        query: 'rivoli',
      });

      algoliasearch.__searchSpy.mockClear();

      const params = {
        hitsPerPage: undefined,
        aroundLatLng: undefined,
        aroundRadius: undefined,
        insideBoundingBox: undefined,
        insidePolygon: undefined,
        getRankingInfo: undefined,
        countries: undefined,
        language: undefined,
        type: undefined,
      };

      source.configure(params);

      await source('rivoli');

      /* defaults are
       * {
       *   hitsPerPage: 5,
       *   language: 'en'
       * }
       */
      const expectedParams = {
        hitsPerPage: 5,
        aroundRadius: undefined,
        insideBoundingBox: undefined,
        insidePolygon: undefined,
        getRankingInfo: undefined,
        countries: undefined,
        language: 'en',
        type: undefined,
      };

      expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
        ...expectedParams,
        query: 'rivoli',
      });
    });

    it('allows reset of controls to defaults', async () => {
      const latitude = '456';
      const longitude = '789';
      navigator.geolocation = {
        watchPosition: fn => fn({ coords: { latitude, longitude } }),
        clearWatch: jest.fn(),
      };

      const initialControls = {
        useDeviceLocation: true,
      };
      const { source, defaults } = setup(initialControls);

      await source('rivoli');

      expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
        ...defaults,
        aroundLatLng: `${latitude},${longitude}`,
        query: 'rivoli',
      });
      expect(navigator.geolocation.clearWatch).not.toHaveBeenCalled();

      algoliasearch.__searchSpy.mockClear();

      const controls = {
        useDeviceLocation: undefined,
      };

      source.configure(controls);

      await source('rivoli');

      expect(algoliasearch.__searchSpy).toHaveBeenCalledWith({
        ...defaults,
        query: 'rivoli',
      });
      expect(navigator.geolocation.clearWatch).toHaveBeenCalled();
    });
  });
});

function setup(sourceOptions = {}) {
  const content = { hits: [1] };
  algoliasearch.__setSearchStub(jest.fn(() => Promise.resolve(content)));
  const source = createAutocompleteSource({ algoliasearch, ...sourceOptions });
  const query = 'test';
  const defaults = {
    query: 'test',
    hitsPerPage: 5,
    language: navigator.language.split('-')[0],
  };
  const cb = jest.fn(hits => hits);
  const expectedHits = content.hits.map((hit, hitIndex) => ({
    formattedHit: {
      hit,
      hitIndex,
      query,
      rawAnswer: content,
      formatInputValue: sourceOptions.formatInputValue || undefined,
    },
  }));
  return { source, defaults, expectedHits, content, cb };
}
