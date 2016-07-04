/* eslint-env jest, jasmine */

import formatDropdownValue from './formatDropdownValue.js';
jest.mock('./icons/address.svg', () => 'address');
jest.mock('./icons/city.svg', () => 'city');
jest.mock('./icons/country.svg', () => 'country');
jest.unmock('./formatDropdownValue.js');

describe('formatDropdownValue', () => {
  it('formats the address', () => {
    expect(
      formatDropdownValue({
        type: 'address',
        highlight: {
          name: 'Paris',
          administrative: 'Île-de-France',
          city: 'Paris',
          country: 'France',
          type: 'address'
        }
      })
    ).toEqual(
      '<span class="ap-suggestion-icon">address</span> <span class="ap-name">Paris</span> <span class="ap-address"> Paris, Île-de-France, France</span>' // eslint-disable-line max-len
    );
  });
});
