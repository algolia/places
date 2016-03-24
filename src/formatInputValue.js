export default function formatInputValue({
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
