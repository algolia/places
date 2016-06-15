import addressIcon from './icons/address.svg';
import cityIcon from './icons/city.svg';
import countryIcon from './icons/country.svg';

const icons = {
  address: addressIcon,
  city: cityIcon,
  country: countryIcon
};

export default function formatDropdownValue(options) {
  let {
    administrative,
    city,
    country,
    type,
    hit
  } = options;

  const name = hit._highlightResult.locale_names[0].value;
  city = city ? hit._highlightResult.city[0].value : undefined;
  administrative = administrative && hit._highlightResult.administrative ?
    hit._highlightResult.administrative[0].value : administrative;
  country = country && hit._highlightResult.country ?
    hit._highlightResult.country.value : country;

  const out = `<span class="ap-suggestion-icon">${icons[type].trim()}</span>
<span class="ap-name">${name}</span>
<span class="ap-address">
  ${city ? `${city},` : ''}
  ${administrative ? `${administrative},` : ''}
  ${country ? `${country}` : ''}
</span>`.replace(/\s*\n\s*/g, ' ');
  return out;
}
