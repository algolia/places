import findCountryCode from './findCountryCode';

describe('findCountryCode', () => {
  const testCases = [
    {
      name: 'empty array',
      input: [],
      expected: undefined,
    },
    {
      name: 'match',
      input: ['country/us', 'country/fr'],
      expected: 'us',
    },
  ];

  testCases.forEach(testCase =>
    it(`${testCase.name} test case`, () =>
      expect(findCountryCode(testCase.input)).toEqual(testCase.expected))
  );
});
