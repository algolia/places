import formatHit from './formatHit.js';
import version from './version.js';

export default function createAutocompleteSource({
  algoliasearch,
  clientOptions,
  apiKey,
  appId,
  hitsPerPage,
  aroundLatLng,
  aroundRadius,
  aroundLatLngViaIP,
  countries,
  formatInputValue,
  computeQueryParams = params => params,
  useDeviceLocation = false,
  language = navigator.language.split('-')[0],
  onHits = () => {},
  onError = e => { throw e; },
  onRateLimitReached,
  type,
}) {
  const placesClient = algoliasearch.initPlaces(
    appId,
    apiKey,
    clientOptions
  );
  placesClient.as.addAlgoliaAgent(`Algolia Places ${version}`);

  const defaultQueryParams = {
    countries,
    hitsPerPage: hitsPerPage || 5,
    language,
    type,
  };

  if (typeof defaultQueryParams.countries === 'string') {
    defaultQueryParams.countries = defaultQueryParams.countries.toLowerCase();
  }

  if (typeof defaultQueryParams.language === 'string') {
    defaultQueryParams.language = defaultQueryParams.language.toLowerCase();
  }

  if (aroundLatLng) {
    defaultQueryParams.aroundLatLng = aroundLatLng;
  } else if (aroundLatLngViaIP !== undefined) {
    defaultQueryParams.aroundLatLngViaIP = aroundLatLngViaIP;
  }

  if (aroundRadius) {
    defaultQueryParams.aroundRadius = aroundRadius;
  }

  let userCoords;
  if (useDeviceLocation) {
    navigator.geolocation.watchPosition(
      ({coords}) => { userCoords = `${coords.latitude},${coords.longitude}`; }
    );
  }

  return (query, cb) => placesClient
      .search(computeQueryParams({
        ...defaultQueryParams,
        [userCoords ? 'aroundLatLng' : undefined]: userCoords,
        query,
      }))
      .then(
        content => {
          const hits = content.hits.map((hit, hitIndex) =>
            formatHit({
              formatInputValue,
              hit,
              hitIndex,
              query,
              rawAnswer: content,
            })
          );

          onHits({
            hits,
            query,
            rawAnswer: content,
          });

          return hits;
        }
      )
      .then(cb)
      .catch(e => {
        if (e.statusCode === 429) {
          onRateLimitReached();
          return;
        }

        onError(e);
      });
}
