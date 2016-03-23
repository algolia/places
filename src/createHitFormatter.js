export default function createHitFormatter(formatValue) {
  return hit => {
    let formatted = {
      administrative: hit.administrative && hit.administrative[0],
      city: hit.city && hit.city.default[0],
      country: hit.country.default,
      isCity: hit.is_city
    };

    // this is the value to put inside the input.value
    formatted.value = formatValue({
      ...formatted,
      name: hit.locale_names.default[0]
    });

    // this is the value shown in suggestions, we highlight the name
    formatted.suggestion = formatValue({
      ...formatted,
      name: hit._highlightResult.locale_names.default[0].value
    });

    return formatted;
  }
}
