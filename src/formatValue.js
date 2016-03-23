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
