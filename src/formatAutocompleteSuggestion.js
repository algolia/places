/* eslint no-unused-vars: 0 */
// this ^^ line can be removed, just so travis test works
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
