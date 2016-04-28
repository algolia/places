export default function formatInputValue({
  administrative,
  city,
  country,
  name
}) {
  const out = `${name}
 ${city ? `${city},` : ''}
 ${administrative ? `${administrative},` : ''}
 ${country ? `${country}` : ''}`.replace(/\s*\n\s*/g, ' ').trim();
  return out;
}
