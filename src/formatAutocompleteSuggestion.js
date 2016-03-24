import icons from './icons.js';

export default function formatAutocompleteSuggestion({
  administrative,
  city,
  country,
  isCity,
  name
}) {
  return (
`${name}
${isCity === false ? ` ${city},` : ''}
 ${administrative},
 ${country}`);
}
