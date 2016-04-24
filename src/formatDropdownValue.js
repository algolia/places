import addressIcon from './icons/address.svg';
import cityIcon from './icons/city.svg';

export default function formatDropdownValue({
  administrative,
  city,
  country,
  type,
  name
}) {
  const out = `<span class="ap-suggestion-icon">${type === 'city' ?
    cityIcon.trim() :
    addressIcon.trim()}</span>
<span class="ap-name">${name}</span> <span class="ap-address">
${type !== 'city' ? `${city},` : ''}
 ${administrative ? `${administrative},` : ''}
 ${country}</span>`
  .replace(/\n/g, '');

  return out;
}
