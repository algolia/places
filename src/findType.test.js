import findType from './findType';

describe('findType', () => {
  const testCases = [
    {
      name: 'empty array',
      input: [],
      expected: 'address',
    },
    {
      name: 'unknown',
      input: ['foo', 'bar'],
      expected: 'address',
    },
    {
      name: 'city',
      input: ['city', 'address'],
      expected: 'city',
    },
    {
      name: 'country',
      input: ['country', 'city'],
      expected: 'country',
    },
    {
      name: 'address',
      input: ['address'],
      expected: 'address',
    },
    {
      name: 'an airport',
      input: ['address', 'aeroway/aerodrome'],
      expected: 'airport',
    },
    {
      name: 'a bus stop',
      input: ['address', 'amenity/bus_station'],
      expected: 'busStop',
    },
    {
      name: 'a train station',
      input: ['address', 'railway/station'],
      expected: 'trainStation',
    },
    {
      name: 'a townhall',
      input: ['amenity/townhall', 'address'],
      expected: 'townhall',
    },
  ];

  testCases.forEach(testCase =>
    it(`${testCase.name} test case`, () =>
      expect(findType(testCase.input)).toEqual(testCase.expected))
  );
});
