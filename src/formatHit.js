import findCountryCode from './findCountryCode.js';
import findType from './findType.js';

function getBestHighlightedForm(highlightedValues) {
  const defaultValue = highlightedValues[0].value;
  // collect all other matches
  const bestAttributes = [];
  for (let i = 1; i < highlightedValues.length; ++i) {
    if (highlightedValues[i].matchLevel !== 'none') {
      bestAttributes.push({
        index: i,
        words: highlightedValues[i].matchedWords,
      });
    }
  }
  // no matches in this attribute, retrieve first value
  if (bestAttributes.length === 0) {
    return defaultValue;
  }
  // sort the matches by `desc(words), asc(index)`
  bestAttributes.sort((a, b) => {
    if (a.words > b.words) {
      return -1;
    } else if (a.words < b.words) {
      return 1;
    }
    return a.index - b.index;
  });
  // and append the best match to the first value
  return bestAttributes[0].index === 0
    ? `${defaultValue} (${highlightedValues[bestAttributes[1].index].value})`
    : `${highlightedValues[bestAttributes[0].index].value} (${defaultValue})`;
}

export default function formatHit({
  formatInputValue,
  hit,
  hitIndex,
  query,
  rawAnswer,
}) {
  try {
    const name = hit.locale_names[0];
    const country = hit.country;
    const administrative = hit.administrative && hit.administrative[0] !== name
      ? hit.administrative[0]
      : undefined;
    const city = hit.city && hit.city[0] !== name ? hit.city[0] : undefined;
    const suburb = hit.suburb && hit.suburb[0] !== name
      ? hit.suburb[0]
      : undefined;

    const county = hit.county && hit.county[0] !== name
      ? hit.county[0]
      : undefined;

    const highlight = {
      name: getBestHighlightedForm(hit._highlightResult.locale_names),
      city: city
        ? getBestHighlightedForm(hit._highlightResult.city)
        : undefined,
      administrative: administrative
        ? getBestHighlightedForm(hit._highlightResult.administrative)
        : undefined,
      country: country ? hit._highlightResult.country.value : undefined,
      suburb: suburb
        ? getBestHighlightedForm(hit._highlightResult.suburb)
        : undefined,
      county: county
        ? getBestHighlightedForm(hit._highlightResult.county)
        : undefined,
    };

    const suggestion = {
      name,
      administrative,
      county,
      city,
      suburb,
      country,
      countryCode: findCountryCode(hit._tags),
      type: findType(hit._tags),
      latlng: {
        lat: hit._geoloc.lat,
        lng: hit._geoloc.lng,
      },
      postcode: hit.postcode && hit.postcode[0],
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
      value,
    };
  } catch (e) {
    /* eslint-disable no-console */
    console.error('Could not parse object', hit);
    console.error(e);
    /* eslint-enable no-console */
    return {
      value: 'Could not parse object',
    };
  }
}
