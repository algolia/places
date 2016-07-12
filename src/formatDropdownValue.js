import addressIcon from './icons/address.svg';
import cityIcon from './icons/city.svg';
import countryIcon from './icons/country.svg';

const icons = {
  address: addressIcon,
  city: cityIcon,
  country: countryIcon
};

export default function formatDropdownValue({type, highlight}) {
  const {
    name,
    administrative,
    city,
    country
  } = highlight;

  const out = `<span class="ap-suggestion-icon">${icons[type].trim()}</span>
<span class="ap-name">${name}</span>
<span class="ap-address">
  ${[city, administrative, country]
    .filter(token => token !== undefined)
    .join(', ')}</span>`.replace(/\s*\n\s*/g, ' ');

  return out;
}
