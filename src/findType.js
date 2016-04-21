export default function findType(tags) {
  const types = ['country', 'city', 'address'];

  for (const type of types) {
    if (tags.indexOf(type) !== -1) {
      return type;
    }
  }
}
