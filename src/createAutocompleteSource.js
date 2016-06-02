import formatHit from './formatHit.js';
import version from './version.js';

export default function createAutocompleteSource({
  algoliasearch,
  apiKey,
  appId,
  aroundLatLng,
  aroundRadius,
  aroundLatLngViaIP,
  countries,
  formatInputValue,
  language = navigator.language.split('-')[0],
  onHits = () => {},
  type
}) {
  const placesClient = algoliasearch.initPlaces(
    apiKey,
    appId,
    {hosts: ['c3-test-1.algolia.net']}
  );
  placesClient.as.setExtraHeader('targetIndexingIndexes', true);
  placesClient.as.addAlgoliaAgent(`Algolia Places ${version}`);

  let defaultQueryParams = {
    countries,
    hitsPerPage: 5,
    language,
    type
  };

  if (aroundLatLng) {
    defaultQueryParams.aroundLatLng = aroundLatLng;
  } else if (typeof aroundLatLngViaIP !== 'undefined') {
    defaultQueryParams.aroundLatLngViaIP = aroundLatLngViaIP;
  }

  if (aroundRadius) {
    defaultQueryParams.aroundRadius = aroundRadius;
  }

  return (query, cb) => placesClient
      .search({
        ...defaultQueryParams,
        query
      })
      .then(
        content => {
          const hits = content.hits.map((hit, hitIndex) => {
            return formatHit({
              formatInputValue,
              hit,
              hitIndex,
              query,
              rawAnswer: content
            });
          });

          onHits({
            hits,
            query,
            rawAnswer: content
          });

          return hits;
        }
      )
      .then(cb);
}
