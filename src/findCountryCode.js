export default function findCountryCode(tags) {
  for (const tag of tags) {
    const find = tag.match(/country\/(.*)?/);
    if (find) {
      return find[1];
    }
  }
}
