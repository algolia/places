const extractParams = ({
  hitsPerPage,
  postcodeSearch,
  aroundLatLng,
  aroundRadius,
  aroundLatLngViaIP,
  insideBoundingBox,
  insidePolygon,
  getRankingInfo,
  countries,
  language,
  type,
}) => {
  const extracted = {
    countries,
    hitsPerPage: hitsPerPage || 5,
    language: language || navigator.language.split('-')[0],
    type,
  };

  if (Array.isArray(countries)) {
    extracted.countries = extracted.countries.map((country) =>
      country.toLowerCase()
    );
  }

  if (typeof extracted.language === 'string') {
    extracted.language = extracted.language.toLowerCase();
  }

  if (aroundLatLng) {
    extracted.aroundLatLng = aroundLatLng;
  } else if (aroundLatLngViaIP !== undefined) {
    extracted.aroundLatLngViaIP = aroundLatLngViaIP;
  }

  if (postcodeSearch) {
    extracted.restrictSearchableAttributes = 'postcode';
  }

  return {
    ...extracted,
    aroundRadius,
    insideBoundingBox,
    insidePolygon,
    getRankingInfo,
  };
};

const extractControls = ({
  useDeviceLocation = false,
  computeQueryParams = (params) => params,
  formatInputValue,
  onHits = () => {},
  onError = (e) => {
    throw e;
  },
  onRateLimitReached,
  onInvalidCredentials,
}) => ({
  useDeviceLocation,
  computeQueryParams,
  formatInputValue,
  onHits,
  onError,
  onRateLimitReached,
  onInvalidCredentials,
});

let params = {};
let controls = {};

const configure = (configuration) => {
  params = extractParams({ ...params, ...configuration });
  controls = extractControls({ ...controls, ...configuration });

  return { params, controls };
};

export default configure;
