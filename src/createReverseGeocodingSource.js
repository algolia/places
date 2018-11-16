import formatHit from './formatHit';
import configure from './configure';

const filterApplicableParams = params => {
  const { hitsPerPage, aroundLatLng, getRankingInfo, language } = params;

  const filtered = {};

  if (typeof hitsPerPage === 'number') {
    filtered.hitsPerPage = hitsPerPage;
  }

  if (typeof language === 'string') {
    filtered.language = language;
  }

  if (typeof getRankingInfo === 'boolean') {
    filtered.getRankingInfo = getRankingInfo;
  }
  if (typeof aroundLatLng === 'string') {
    filtered.aroundLatLng = aroundLatLng;
  }

  return filtered;
};

const createReverseGeocodingSource = ({
  apiKey,
  appId,
  hitsPerPage,
  aroundLatLng,
  getRankingInfo,
  formatInputValue,
  language = navigator.language.split('-')[0],
  onHits = () => {},
  onError = e => {
    throw e;
  },
  onRateLimitReached,
}) => {
  const configuration = configure({
    apiKey,
    appId,
    hitsPerPage,
    aroundLatLng,
    getRankingInfo,
    language,
    formatInputValue,
    onHits,
    onError,
    onRateLimitReached,
  });

  let params = filterApplicableParams(configuration.params);
  let controls = configuration.controls;

  const baseUrl = `https://places-dsn.algolia.net/1/places/reverse?x-algolia-application-id=${appId}&x-algolia-api-key=${apiKey}`;

  const searcher = (queryAroundLatLng, cb) => {
    const finalAroundLatLng = queryAroundLatLng || params.aroundLatLng;

    if (!finalAroundLatLng) {
      return Promise.reject(
        new Error('A location must be provided for reverse geocoding')
      );
    }

    const searchParams = { ...params, aroundLatLng: finalAroundLatLng };

    const args = Object.entries(searchParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    return fetch(`${baseUrl}&${args}`)
      .then(res => res.json())
      .then(content => {
        const hits = content.hits.map((hit, hitIndex) =>
          formatHit({
            formatInputValue: controls.formatInputValue,
            hit,
            hitIndex,
            query: finalAroundLatLng,
            rawAnswer: content,
          })
        );

        controls.onHits({
          hits,
          query: finalAroundLatLng,
          rawAnswer: content,
        });

        return hits;
      })
      .then(cb)
      .catch(e => {
        if (e.statusCode === 429) {
          controls.onRateLimitReached();
          return;
        }

        controls.onError(e);
      });
  };

  searcher.configure = partial => {
    const updated = configure({ ...params, ...controls, ...partial });

    params = filterApplicableParams(updated.params);
    controls = updated.controls;
  };

  return searcher;
};

export default createReverseGeocodingSource;
