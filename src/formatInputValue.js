export default function formatInputValue({
  administrative,
  city,
  country,
  type,
  name
}) {
  const out = `${name}
${type !== 'city' ? ` ${city},` : ''}
 ${administrative ? `${administrative},` : ''}
 ${country}`
  .replace(/\n/g, '');

  return out;
}
