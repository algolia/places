import addressIcon from './icons/address.svg';
import cityIcon from './icons/city.svg';

export default function formatAutocompleteSuggestion({
  administrative,
  city,
  country,
  isCity,
  name
}) {
  const out = `<span class="ap-suggestion-icon">${isCity === true ? cityIcon : addressIcon}</span>
<span class="ap-name">${name}</span> <span class="ap-address">
${isCity === false ? `${city},` : ``}
 ${administrative},
 ${country}</span>`
  .replace(/\n/g, '');

  return out;
}
