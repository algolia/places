import formatHit from './formatHit.js';
import version from './version.js';

export default function createAutocompleteSource({
  algoliasearch,
  clientOptions,
  apiKey,
  appId,
  aroundLatLng,
  aroundRadius,
  aroundLatLngViaIP,
  countries,
  formatInputValue,
  computeQueryParams = params => params,
  useDeviceLocation = false,
  language = navigator.language.split('-')[0],
  onHits = () => {},
  type
}) {
  const placesClient = algoliasearch.initPlaces(
    apiKey,
    appId,
    clientOptions
  );
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

  let userCoords;
  if (useDeviceLocation) {
    navigator.geolocation.watchPosition(
      ({coords}) => userCoords = `${coords.latitude},${coords.longitude}`
    );
  }

  return (query, cb) => placesClient
      .search(computeQueryParams({
        ...defaultQueryParams,
        [userCoords ? 'aroundLatLng' : undefined]: userCoords,
        query
      }))
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
