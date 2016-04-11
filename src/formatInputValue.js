export default function formatInputValue({
  administrative,
  city,
  country,
  isCity,
  name
}) {
  const out = `${name}
${isCity === false ? ` ${city},` : ''}
 ${administrative ? `${administrative},` : ''}
 ${country}`
  .replace(/\n/g, '');

  return out;
}
