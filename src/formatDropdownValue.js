import addressIcon from './icons/address.svg';
import cityIcon from './icons/city.svg';
import countryIcon from './icons/country.svg';

const icons = {
  address: addressIcon,
  city: cityIcon,
  country: countryIcon
};

export default function formatDropdownValue({
  administrative,
  city,
  country,
  type,
  name
}) {
  const out = `<span class="ap-suggestion-icon">${icons[type].trim()}</span>
<span class="ap-name">${name}</span>
<span class="ap-address">
  ${city ? `${city},` : ''}
  ${administrative ? `${administrative},` : ''}
  ${country ? `${country}` : ''}
</span>`.replace(/\s*\n\s*/g, ' ');
  return out;
}
