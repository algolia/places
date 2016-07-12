export default function findCountryCode(tags) {
  for (let tagIndex = 0; tagIndex < tags.length; tagIndex++) {
    const tag = tags[tagIndex];
    const find = tag.match(/country\/(.*)?/);
    if (find) {
      return find[1];
    }
  }

  return undefined;
}
