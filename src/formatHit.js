import findCountryCode from './findCountryCode.js';
import findType from './findType.js';

export default function formatHit({
  formatInputValue,
  hit,
  hitIndex,
  query,
  rawAnswer
}) {
  try {
    const name = hit.locale_names[0];
    const country = hit.country;
    const administrative = hit.administrative && hit.administrative[0] !== name ?
      hit.administrative[0] : undefined;
    const city = hit.city && hit.city[0] !== name ? hit.city[0] : undefined;

    const highlight = {
      name: hit._highlightResult.locale_names[0].value,
      city: city ? hit._highlightResult.city[0].value : undefined,
      administrative: administrative ? hit._highlightResult.administrative[0].value : undefined,
      country: country ? hit._highlightResult.country.value : undefined
    };

    const suggestion = {
      name,
      administrative,
      city,
      country,
      countryCode: findCountryCode(hit._tags),
      type: findType(hit._tags),
      latlng: {
        lat: hit._geoloc.lat,
        lng: hit._geoloc.lng
      },
      postcode: hit.postcode && hit.postcode[0]
    };

    // this is the value to put inside the <input value=
    const value = formatInputValue(suggestion);

    return {
      ...suggestion,
      highlight,
      hit,
      hitIndex,
      query,
      rawAnswer,
      value
    };
  } catch (e) {
    /* eslint-disable no-console */
    console.error('Could not parse object', hit);
    console.error(e);
    /* eslint-enable no-console */
    return {
      value: 'Could not parse object'
    };
  }
}
