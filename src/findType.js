export default function findType(tags) {
  const types = ['country', 'city', 'address'];

  types.forEach(function(item){
  const type = item;
    if (tags.indexOf(item) !== -1) {
      return type;
    }
  });
}
