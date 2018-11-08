import formatHit from './formatHit';
import version from './version';

const configure = (
  {
    hitsPerPage,
    aroundLatLng,
    aroundRadius,
    aroundLatLngViaIP,
    insideBoundingBox,
    insidePolygon,
    getRankingInfo,
    countries,
    language = navigator.language.split('-')[0],
    type,
  },
  { useDeviceLocation = false }
) => {
  const baseParams = {
    countries,
    hitsPerPage: hitsPerPage || 5,
    language,
    type,
  };

  const baseControls = {};

  if (Array.isArray(baseParams.countries)) {
    baseParams.countries = baseParams.countries.map(country =>
      country.toLowerCase()
    );
  }

  if (typeof baseParams.language === 'string') {
    baseParams.language = baseParams.language.toLowerCase();
  }

  if (aroundLatLng) {
    baseParams.aroundLatLng = aroundLatLng;
  } else if (aroundLatLngViaIP !== undefined) {
    baseParams.aroundLatLngViaIP = aroundLatLngViaIP;
  }

  return {
    params: Object.assign(baseParams, {
      aroundRadius,
      insideBoundingBox,
      insidePolygon,
      getRankingInfo,
    }),
    controls: Object.assign(baseControls, {
      useDeviceLocation,
    }),
  };
};

export default function createAutocompleteSource({
  algoliasearch,
  clientOptions,
  apiKey,
  appId,
  hitsPerPage,
  aroundLatLng,
  aroundRadius,
  aroundLatLngViaIP,
  insideBoundingBox,
  insidePolygon,
  getRankingInfo,
  countries,
  formatInputValue,
  computeQueryParams = params => params,
  useDeviceLocation = false,
  language = navigator.language.split('-')[0],
  onHits = () => {},
  onError = e => {
    throw e;
  },
  onRateLimitReached,
  type,
}) {
  const placesClient = algoliasearch.initPlaces(appId, apiKey, clientOptions);
  placesClient.as.addAlgoliaAgent(`Algolia Places ${version}`);

  const configuration = configure(
    {
      hitsPerPage,
      aroundLatLng,
      aroundRadius,
      aroundLatLngViaIP,
      insideBoundingBox,
      insidePolygon,
      getRankingInfo,
      countries,
      language,
      type,
    },
    { useDeviceLocation }
  );

  let params = configuration.params;
  let controls = configuration.controls;

  let userCoords;
  let tracker = null;

  if (controls.useDeviceLocation) {
    tracker = navigator.geolocation.watchPosition(({ coords }) => {
      userCoords = `${coords.latitude},${coords.longitude}`;
    });
  }

  function searcher(query, cb) {
    return placesClient
      .search(
        computeQueryParams({
          ...params,
          [userCoords ? 'aroundLatLng' : undefined]: userCoords,
          query,
        })
      )
      .then(content => {
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
      })
      .then(cb)
      .catch(e => {
        if (e.statusCode === 429) {
          onRateLimitReached();
          return;
        }

        onError(e);
      });
  }

  // eslint-disable-next-line camelcase
  searcher.unstable_configure = partial => {
    const updated = configure(
      { ...params, ...partial },
      { ...controls, ...partial }
    );

    params = updated.params;
    controls = updated.controls;

    if (controls.useDeviceLocation && tracker === null) {
      tracker = navigator.geolocation.watchPosition(({ coords }) => {
        userCoords = `${coords.latitude},${coords.longitude}`;
      });
    } else if (!controls.useDeviceLocation && tracker !== null) {
      navigator.geolocation.clearWatch(tracker);
      tracker = null;
    }
  };
  return searcher;
}
