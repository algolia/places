import findCountryCode from './findCountryCode.js';

export default function createHitFormatter({formatAutocompleteSuggestion, formatInputValue}) {
  return hit => {
    let formatted = {
      administrative: hit.administrative && hit.administrative[0],
      city: hit.city && hit.city.default[0],
      country: hit.country.default,
      countryCode: findCountryCode(hit._tags),
      isCity: hit.is_city,
      name: hit.locale_names.default[0].trim() // trim should be done in data, waiting for a fix in Places API
    };

    // this is the value to put inside the input.value
    // autocomplete.js automatically takes hit.value as the underlying
    // input value when a suggestion is validated with enter or selected with the mouse
    formatted.value = formatInputValue(formatted);

    // this is the value shown in suggestions, we highlight the name
    formatted.suggestion = formatAutocompleteSuggestion({
      ...formatted,
      name: hit._highlightResult.locale_names.default[0].value.trim()
    });

    return formatted;
  };
}
