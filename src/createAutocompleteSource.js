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
  {
    useDeviceLocation = false,
    computeQueryParams = params => params,
    formatInputValue,
    onHits = () => {},
    onError = e => {
      throw e;
    },
    onRateLimitReached,
  }
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

  const params = Object.assign(baseParams, {
    aroundRadius,
    insideBoundingBox,
    insidePolygon,
    getRankingInfo,
  });

  const controls = Object.assign(baseControls, {
    useDeviceLocation,
    computeQueryParams,
    formatInputValue,
    onHits,
    onError,
    onRateLimitReached,
  });

  return { params, controls };
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
    {
      useDeviceLocation,
      computeQueryParams,
      formatInputValue,
      onHits,
      onError,
      onRateLimitReached,
    }
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
    const searchParams = Object.assign(
      {},
      params,
      userCoords && { aroundLatLng: userCoords },
      { query }
    );

    return placesClient
      .search(controls.computeQueryParams(searchParams))
      .then(content => {
        const hits = content.hits.map((hit, hitIndex) =>
          formatHit({
            formatInputValue: controls.formatInputValue,
            hit,
            hitIndex,
            query,
            rawAnswer: content,
          })
        );

        controls.onHits({
          hits,
          query,
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
  }

  // eslint-disable-next-line camelcase
  searcher.configure = partial => {
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
      userCoords = null;
    }
  };
  return searcher;
}
