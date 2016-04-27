import findCountryCode from './findCountryCode.js';
import findType from './findType.js';

export default function formatHit({
  hit,
  hitIndex,
  templates
}) {
  try {
    const name = hit.locale_names[0].trim(); // trim should be done in data, waiting for a fix in Places API
    const administrative = hit.administrative && hit.administrative[0] !== name ?
      hit.administrative[0] : undefined;
    const city = hit.city && hit.city[0] !== name ? hit.city[0] : undefined;

    const suggestion = {
      name,
      administrative,
      city,
      country: hit.country,
      countryCode: findCountryCode(hit._tags),
      type: findType(hit._tags),
      latlng: {
        lat: hit._geoloc.lat,
        lng: hit._geoloc.lng
      },
      postcode: hit.postcode && hit.postcode[0]
    };

    // this is the value to put inside the <input value=
    const value = templates.inputValue(suggestion);
    const dropdownValue = templates.dropdownSuggestion({
      ...suggestion,
      name: hit._highlightResult.locale_names[0].value.trim()
    });

    return {
      ...suggestion,
      value,
      _dropdownValue: dropdownValue,
      _index: hitIndex
    };
  } catch (e) {
    /* eslint no-console: 0 */
    console.error('Could not parse object', hit);
    console.error(e);
    return {
      inputValue: 'Could not parse object',
      _dropdownHTMLFormatted: 'Could not parse object'
    };
  }
}
