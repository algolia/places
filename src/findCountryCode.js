export default function findCountryCode(tags) {
  let countryCode;

  [...tags].forEach(tag => {
    const find = tag.match(/country\/(.*)?/);
    if (find) {
      countryCode = find[1];
    }
  });

  return countryCode;
}
