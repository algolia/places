import findCountryCode from './findCountryCode.js';
import findType from './findType.js';
import formatInputValue from './formatInputValue';
import formatDropdownValue from './formatDropdownValue.js';

export default function formatHit(hit, hitIndex) {
  try {
    const administrative = hit.administrative && hit.administrative[0] !== hit.locale_names[0] ?
      hit.administrative[0] : undefined;

    const suggestion = {
      administrative,
      city: hit.city && hit.city[0],
      country: hit.country,
      countryCode: findCountryCode(hit._tags),
      type: findType(hit._tags),
      latlng: {
        lat: hit._geoloc[0].lat,
        lng: hit._geoloc[0].lng
      },
      name: hit.locale_names[0].trim() // trim should be done in data, waiting for a fix in Places API
    };

    // this is the value to put inside the <input value=
    const value = formatInputValue(suggestion);
    const dropdownValue = formatDropdownValue({
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
