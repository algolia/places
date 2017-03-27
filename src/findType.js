export default function findType(tags) {
  const types = {
    country: 'country',
    city: 'city',
    'amenity/bus_station': 'busStop',
    'amenity/townhall': 'townhall',
    'railway/station': 'trainStation',
    'aeroway/aerodrome': 'airport',
    'aeroway/terminal': 'airport',
    'aeroway/gate': 'airport',
  };

  for (const t in types) {
    if (tags.indexOf(t) !== -1) {
      return types[t];
    }
  }

  return 'address';
}
