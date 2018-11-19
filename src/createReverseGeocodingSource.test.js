import formatHit from './formatHit';
// import version from './version';
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
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        hits: [1],
      }),
  })
);

describe('createReverseGeocodingSource', () => {
  beforeEach(() => formatHit.mockClear());
  beforeEach(() => global.fetch.mockClear());

  it('supports appId and apiKey option', () => {
    const appId = 'id';
    const apiKey = 'key';
    setup({ appId, apiKey });
  });

  it('supports hitsPerPage option', async () => {
    const { source, baseUrl, defaults } = setup({ hitsPerPage: 2 });
    await source(defaults.query);

    const expectedUrl = `${baseUrl}&hitsPerPage=2&language=en&aroundLatLng=${
      defaults.query
    }`;
    expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
  });

  it('supports language option', async () => {
    const { source, baseUrl, defaults } = setup({ language: 'de' });
    await source(defaults.query);

    const expectedUrl = `${baseUrl}&hitsPerPage=5&language=de&aroundLatLng=${
      defaults.query
    }`;
    expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
  });

  it('supports aroundLatLng option', async () => {
    const { source, baseUrl } = setup({ aroundLatLng: '123,234' });
    await source();

    const expectedUrl = `${baseUrl}&hitsPerPage=5&language=en&aroundLatLng=123%2C234`;
    expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
  });

  it('prefers query to aroundLatLng option', async () => {
    const { source, baseUrl } = setup({ aroundLatLng: '123,234' });
    await source('345,456');

    const expectedUrl = `${baseUrl}&hitsPerPage=5&language=en&aroundLatLng=345%2C456`;
    expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
  });

  it('supports getRankingInfo option', async () => {
    const { source, baseUrl, defaults } = setup({ getRankingInfo: true });
    await source(defaults.query);

    const expectedUrl = `${baseUrl}&hitsPerPage=5&language=en&getRankingInfo=true&aroundLatLng=${
      defaults.query
    }`;
    expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
  });

  it('calls the source callback with the formatted hits', async () => {
    const { source, defaults, expectedHits, cb } = setup({
      aroundLatLngViaIP: true,
    });

    await source(defaults.query, cb);

    expect(cb).toHaveBeenCalledWith(expectedHits);
  });

  it('supports formatInputValue option', async () => {
    const formatInputValue = jest.fn(() => 'custom');
    const { source, defaults, cb } = setup({ formatInputValue });

    await source(defaults.query, cb);

    expect(cb.mock.calls[0][0][0].formattedHit.formatInputValue).toEqual(
      'custom'
    );
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

  it('supports onError option', async () => {
    const error = new Error('Nope');
    global.fetch.mockImplementation(() => Promise.reject(error));
    const onError = jest.fn();
    const source = createReverseGeocodingSource({ onError });

    await source('test');

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('rejects when onError not present', async () => {
    const error = new Error('Nope');
    global.fetch.mockImplementation(() => Promise.reject(error));
    const source = createReverseGeocodingSource({});
    try {
      await source('test');
    } catch (e) {
      expect(e).toEqual(error);
    }
  });

  it('supports onRateLimitReached option', async () => {
    const error = new Error('Some error message');
    error.statusCode = 429;
    global.fetch.mockImplementation(() => Promise.reject(error));
    const onRateLimitReached = jest.fn();
    const source = createReverseGeocodingSource({
      onRateLimitReached,
    });

    await source('test');
    expect(onRateLimitReached).toHaveBeenCalled();
  });
});

function setup(sourceOptions = {}) {
  const content = { hits: [1] };
  const source = createReverseGeocodingSource({
    appId: '123',
    apiKey: '234',
    ...sourceOptions,
  });
  const query = 'test';
  const baseUrl = `https://places-dsn.algolia.net/1/places/reverse?x-algolia-application-id=123&x-algolia-api-key=234`;
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
      formatInputValue: sourceOptions.formatInputValue || 'valueTemplate',
    },
  }));
  return { source, baseUrl, defaults, expectedHits, content, cb };
}
