// this ^^ line can be removed, just so travis test works
import icons from './icons.js';

export default function formatAutocompleteSuggestion({
  administrative,
  city,
  country,
  isCity,
  name
}) {
  const out = `<span class="pl-icon">${icons[isCity === false ? 'address' : 'city']}</span>
<span class="pl-name">${name}</span> <span class="pl-address">
${isCity === false ? `${city},` : ``}
 ${administrative},
 ${country}</span>`
  .replace(/\n/g, '');

  return out;
}
