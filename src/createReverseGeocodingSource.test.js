import formatHit from './formatHit';
import version from './version';
import algoliasearch from 'algoliasearch/src/browser/builds/algoliasearchLite';
import createReverseGeocodingSource from './createReverseGeocodingSource';
jest.mock('./defaultTemplates.js', () => ({
  value: jest.fn(() => 'valueTemplate'),
}));

jest.mock('./formatHit.js', () =>
  jest.fn(hit => {
    const { formatInputValue } = hit;
    return {
      formattedHit: { ...hit, formatInputValue: formatInputValue() },
    };
  })
);

jest.mock('algoliasearch/src/browser/builds/algoliasearchLite.js', () =>
  require.requireActual(
    '../__mocks__/algoliasearch/src/browser/builds/algoliasearchLite.js'
  )
);

describe('createReverseGeocodingSource', () => {
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

  it('configures the Algolia Places client agent', () => {
    setup();
    expect(algoliasearch.__addAlgoliaAgentSpy).toHaveBeenCalledWith(
      `Algolia Places ${version}`
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

  it('supports hitsPerPage option', async () => {
    const { source, query, defaults } = setup({ hitsPerPage: 2 });
    await source(query);

    expect(algoliasearch.__reverseSpy).toHaveBeenCalledWith({
      ...defaults,
      hitsPerPage: 2,
    });
  });

  it('supports language option', async () => {
    const { source, query, defaults } = setup({ language: 'de' });
    await source(query);

    expect(algoliasearch.__reverseSpy).toHaveBeenCalledWith({
      ...defaults,
      language: 'de',
    });
  });

  it('supports aroundLatLng option', async () => {
    const { source, defaults } = setup({ aroundLatLng: '123,234' });
    await source();

    expect(algoliasearch.__reverseSpy).toHaveBeenCalledWith({
      ...defaults,
      aroundLatLng: '123,234',
    });
  });

  it('prefers query to aroundLatLng option', async () => {
    const { source, defaults } = setup({ aroundLatLng: '123,234' });
    await source('345,456');

    expect(algoliasearch.__reverseSpy).toHaveBeenCalledWith({
      ...defaults,
      aroundLatLng: '345,456',
    });
  });

  it('supports getRankingInfo option', async () => {
    const { source, query, defaults } = setup({ getRankingInfo: true });
    await source(query);

    expect(algoliasearch.__reverseSpy).toHaveBeenCalledWith({
      ...defaults,
      getRankingInfo: true,
    });
  });

  it('calls the source callback with the formatted hits', async () => {
    const { source, query, expectedHits, cb } = setup({
      aroundLatLngViaIP: true,
    });

    await source(query, cb);

    expect(cb).toHaveBeenCalledWith(expectedHits);
  });

  it('supports formatInputValue option', async () => {
    const formatInputValue = jest.fn(() => 'custom');
    const { source, query, cb } = setup({ formatInputValue });

    await source(query, cb);

    expect(cb.mock.calls[0][0][0].formattedHit.formatInputValue).toEqual(
      'custom'
    );
  });

  it('supports onHits option', () => {
    const onHits = jest.fn();
    const { source, query, expectedHits, content } = setup({ onHits });
    return source(query).then(() => {
      expect(onHits).toHaveBeenCalledWith({
        hits: expectedHits,
        query,
        rawAnswer: content,
      });
    });
  });

  it('supports onError option', async () => {
    const error = new Error('Nope');
    const searchFn = jest.fn(() => Promise.reject(error));
    const onError = jest.fn();
    algoliasearch.__setSearchStub(searchFn);
    const source = createReverseGeocodingSource({ algoliasearch, onError });

    await source('test');

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('rejects when onError not present', async () => {
    const error = new Error('Nope');
    const searchFn = jest.fn(() => Promise.reject(error));
    algoliasearch.__setSearchStub(searchFn);
    const source = createReverseGeocodingSource({ algoliasearch });
    try {
      await source('test');
    } catch (e) {
      expect(e).toEqual(error);
    }
  });

  it('supports onRateLimitReached option', async () => {
    const error = new Error('Some error message');
    error.statusCode = 429;
    const searchFn = jest.fn(() => Promise.reject(error));
    const onRateLimitReached = jest.fn();
    algoliasearch.__setSearchStub(searchFn);
    const source = createReverseGeocodingSource({
      algoliasearch,
      onRateLimitReached,
    });

    await source('test');
    expect(onRateLimitReached).toHaveBeenCalled();
  });
});

function setup(sourceOptions = {}) {
  const content = { hits: [1] };
  algoliasearch.__setSearchStub(jest.fn(() => Promise.resolve(content)));
  const source = createReverseGeocodingSource({
    algoliasearch,
    ...sourceOptions,
  });
  const query = 'test';
  const defaults = {
    aroundLatLng: query,
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
      formatInputValue: sourceOptions.formatInputValue || 'valueTemplate',
    },
  }));
  return { source, query, defaults, expectedHits, content, cb };
}
