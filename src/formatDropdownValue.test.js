/* eslint-env jest, jasmine */

import formatDropdownValue from './formatDropdownValue.js';
jest.mock('./icons/address.svg', () => 'address');
jest.mock('./icons/city.svg', () => 'city');
jest.mock('./icons/country.svg', () => 'country');
jest.unmock('./formatDropdownValue.js');

describe('formatDropdownValue', () => {
  const testCases = [
    getTestCase({
      name: 'simple',
      expected: '<span class="ap-suggestion-icon">address</span> <span class="ap-name">Paris</span> <span class="ap-address"> Paris, Île-de-France, France</span>' // eslint-disable-line max-len
    }),
    getTestCase({
      name: 'no city',
      root: {city: undefined},
      expected: '<span class="ap-suggestion-icon">address</span> <span class="ap-name">Paris</span> <span class="ap-address"> Île-de-France, France</span>' // eslint-disable-line max-len
    }),
    getTestCase({
      name: 'no administrative',
      root: {administrative: undefined},
      expected: '<span class="ap-suggestion-icon">address</span> <span class="ap-name">Paris</span> <span class="ap-address"> Paris, France</span>' // eslint-disable-line max-len
    }),
    getTestCase({
      name: 'no country',
      root: {country: undefined},
      expected: '<span class="ap-suggestion-icon">address</span> <span class="ap-name">Paris</span> <span class="ap-address"> Paris, Île-de-France</span>' // eslint-disable-line max-len
    }),
    getTestCase({
      name: 'city type',
      root: {type: 'city'},
      expected: '<span class="ap-suggestion-icon">city</span> <span class="ap-name">Paris</span> <span class="ap-address"> Paris, Île-de-France, France</span>' // eslint-disable-line max-len
    }),
    getTestCase({
      name: 'country type',
      root: {type: 'country'},
      expected: '<span class="ap-suggestion-icon">country</span> <span class="ap-name">Paris</span> <span class="ap-address"> Paris, Île-de-France, France</span>' // eslint-disable-line max-len
    })
  ];

  testCases.forEach(
    testCase => it(`${testCase.name} test case`, () =>
      expect(formatDropdownValue(testCase.input)).toEqual(testCase.expected)
    )
  );
});

function getTestCase({
  name,
  root,
  highlight,
  expected
}) {
  const defaultRoot = {
    administrative: 'Île-de-France',
    city: 'Paris',
    country: 'France',
    type: 'address'
  };

  const defaultHighlight = {
    locale_names: [{value: 'Paris'}],
    city: [{value: 'Paris'}],
    administrative: [{value: 'Île-de-France'}],
    country: {value: 'France'}
  };

  return {
    name,
    input: {
      ...defaultRoot,
      ...root,
      hit: {_highlightResult: {...defaultHighlight, ...highlight}}
    },
    expected
  };
}
