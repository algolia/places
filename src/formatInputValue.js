export default function formatInputValue({
  administrative,
  city,
  country,
  name
}) {
  const out = `${name}
 ${city ? ` ${city},` : ''}
 ${administrative ? `${administrative},` : ''}
 ${country ? ` ${country}` : ''}`
  .replace(/\n/g, '');

  return out;
}
