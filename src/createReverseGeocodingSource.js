import configure from './configure';
import formatHit from './formatHit';
import version from './version';
import defaultTemplates from './defaultTemplates';

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
  algoliasearch,
  clientOptions,
  apiKey,
  appId,
  hitsPerPage,
  aroundLatLng,
  getRankingInfo,
  formatInputValue = defaultTemplates.value,
  language = navigator.language.split('-')[0],
  onHits = () => {},
  onError = e => {
    throw e;
  },
  onRateLimitReached,
}) => {
  const placesClient = algoliasearch.initPlaces(appId, apiKey, clientOptions);
  placesClient.as.addAlgoliaAgent(`Algolia Places ${version}`);

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

  const searcher = (queryAroundLatLng, cb) => {
    const finalAroundLatLng = queryAroundLatLng || params.aroundLatLng;

    if (!finalAroundLatLng) {
      const error = new Error(
        'A location must be provided for reverse geocoding'
      );
      return Promise.reject(error);
    }

    return placesClient
      .reverse({ ...params, aroundLatLng: finalAroundLatLng })
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

    return searcher;
  };

  return searcher;
};

export default createReverseGeocodingSource;
