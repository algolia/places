/* eslint-env jest, jasmine */

jest.unmock('./formatInputValue.js');
import formatInputValue from './formatInputValue.js';

describe('formatInputValue', () => {
  const testCases = [{
    name: 'simple',
    input: {
      administrative: 'Île-de-France',
      city: 'Paris',
      country: 'France',
      name: '88 rue de Rivoli',
      type: 'address'
    },
    expected: '88 rue de Rivoli, Paris, Île-de-France, France'
  }, {
    name: 'country',
    input: {
      name: 'France',
      type: 'country'
    },
    expected: 'France'
  }, {
    name: 'no city',
    input: {
      administrative: 'Île-de-France',
      country: 'France',
      name: '88 rue de Rivoli',
      type: 'address'
    },
    expected: '88 rue de Rivoli, Île-de-France, France'
  }, {
    name: 'no administrative',
    input: {
      country: 'France',
      name: '88 rue de Rivoli',
      type: 'address'
    },
    expected: '88 rue de Rivoli, France'
  }, {
    name: 'no country',
    input: {
      name: '88 rue de Rivoli',
      type: 'address'
    },
    expected: '88 rue de Rivoli'
  }];

  testCases.forEach(
    testCase => it(`${testCase.name} test case`, () =>
      expect(formatInputValue(testCase.input)).toEqual(testCase.expected)
    )
  );
});
