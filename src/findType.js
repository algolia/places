export default function findType(tags) {
  const types = ['country', 'city', 'address'];

  for (let typeIndex = 0; typeIndex < types.length; typeIndex++) {
    const type = types[typeIndex];
    if (tags.indexOf(type) !== -1) {
      return type;
    }
  }

  return undefined;
}
