export default function findCountryCode(tags) {
  let countryCode;

  for (const tag of tags) {
    const find = tag.match(/country\/(.*)?/);
    if (find) {
      countryCode = find[1];
    }
  }

  return countryCode;
}
