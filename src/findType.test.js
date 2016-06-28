/* eslint-env jest, jasmine */

jest.unmock('./findType.js');
import findType from './findType.js';

describe('findType', () => {
  const testCases = [{
    name: 'empty array',
    input: [],
    expected: undefined
  }, {
    name: 'city',
    input: ['city', 'address'],
    expected: 'city'
  }, {
    name: 'country',
    input: ['country', 'city'],
    expected: 'country'
  }, {
    name: 'address',
    input: ['address'],
    expected: 'address'
  }];

  testCases.forEach(
    testCase => it(`${testCase.name} test case`, () =>
      expect(findType(testCase.input)).toEqual(testCase.expected)
    )
  );
});
