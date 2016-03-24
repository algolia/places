import icons from './icons.js';

// use icons.address/city. It contains a complete SVG

export default function formatValue({
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
