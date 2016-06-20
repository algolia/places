export default function formatInputValue({
  administrative,
  city,
  country,
  name,
  type
}) {
  const out = `${name}${type !== 'country' ? ',' : ''}
 ${city ? `${city},` : ''}
 ${administrative ? `${administrative},` : ''}
 ${country ? `${country}` : ''}`.replace(/\s*\n\s*/g, ' ').trim();
  return out;
}
