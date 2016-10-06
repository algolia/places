/* eslint-disable camelcase */

import formatHit from './formatHit.js';
import findCountryCode from './findCountryCode.js';
import findType from './findType.js';

jest.mock('./findCountryCode.js', () => jest.fn(() => 'countryCode'));
jest.mock('./findType.js', () => jest.fn(() => 'type'));

describe('formatHit', () => {
  beforeEach(() => findCountryCode.mockClear());
  beforeEach(() => findType.mockClear());

  const testCases = [
    getTestCase({name: 'simple'}),
    getTestCase({
      name: 'no administrative',
      hit: {administrative: undefined},
      expected: {administrative: undefined, highlight: {administrative: undefined}}
    }),
    getTestCase({
      name: 'administrative[0] === locale_names[0]',
      hit: {
        administrative: ['Île-de-France'],
        locale_names: ['Île-de-France'],
        _highlightResult: {
          locale_names: [{value: 'Île-de-France'}],
          administrative: [{value: 'Île-de-France'}]
        }
      },
      expected: {
        administrative: undefined, name: 'Île-de-France',
        highlight: {administrative: undefined, name: 'Île-de-France'}
      }
    }),
    getTestCase({
      name: 'locale_names[1] is matching',
      hit: {
        locale_names: ['Paris', 'Lutèce'],
        city: ['Paris'],
        administrative: ['Île-de-France'],
        _highlightResult: {
          locale_names: [{value: 'Paris', matchedWords: []}, {value: 'Lutèce', matchedWords: ['Lutèce']}]
        }
      },
      expected: {
        name: 'Paris',
        administrative: 'Île-de-France',
        city: undefined,
        highlight: {name: 'Lutèce (Paris)', city: undefined}
      }
    }),
    getTestCase({
      name: 'no city',
      hit: {city: undefined},
      expected: {
        city: undefined,
        highlight: {city: undefined}
      }
    }),
    getTestCase({
      name: 'city[0] === locale_names[0]',
      hit: {
        city: ['Paris'],
        locale_names: ['Paris'],
        _highlightResult: {
          locale_names: [{value: 'Paris'}],
          city: [{value: 'Paris'}]
        }
      },
      expected: {
        city: undefined,
        name: 'Paris',
        highlight: {city: undefined, name: 'Paris'}
      }
    }),
    getTestCase({
      name: 'no country',
      hit: {
        country: undefined,
        _highlightResult: {
          country: undefined
        }
      },
      expected: {
        country: undefined,
        highlight: {country: undefined}
      }
    })
  ];

  testCases.forEach(
    testCase => it(`${testCase.name} test case`, () => {
      const output = formatHit(testCase.input);

      // check properties
      Object.keys(testCase.expected).forEach(key =>
        expect(output[key]).toEqual(testCase.expected[key], `unexcepted value of "${key}"`)
      );

      // hit is passed through
      expect(output.hit).toEqual(testCase.expected.hit);

      // check fn calls
      expect(output.countryCode).toEqual('countryCode');
      expect(findCountryCode).toBeCalledWith(['tags']);

      expect(output.type).toEqual('type');
      expect(findType).toBeCalledWith(['tags']);

      expect(output.value).toEqual('value');
      expect(testCase.input.formatInputValue).toBeCalledWith({
        name: output.name,
        administrative: output.administrative,
        city: output.city,
        country: output.country,
        countryCode: output.countryCode,
        type: output.type,
        latlng: output.latlng,
        postcode: output.postcode
      });

      expect(output.rawAnswer).toEqual('rawAnswer');
      expect(output.query).toEqual('query');
      expect(output.hitIndex).toEqual(0);
    })
  );

  it('returns a default object when unable to parse it', () => {
    const consoleError = console.error;  // eslint-disable-line no-console
    console.error = jest.fn(); // eslint-disable-line no-console
    const output = formatHit({bad: 'data'});
    const expected = {value: 'Could not parse object'};
    expect(output).toEqual(expected);
    expect(console.error).toBeCalled(); // eslint-disable-line no-console
    console.error = consoleError; // eslint-disable-line no-console
  });
});

function getTestCase({
  name,
  hit: userHit = {},
  expected: userExpected = {}
}) {
  const defaultHit = {
    locale_names: ['rue de rivoli'],
    country: 'France',
    administrative: ['Île-de-France'],
    city: ['Paris'],
    _geoloc: {
      lat: '123',
      lng: '456'
    },
    postcode: ['75004'],
    _tags: ['tags'],
    _highlightResult: {
      locale_names: [{value: 'Paris'}],
      city: [{value: 'Paris'}],
      administrative: [{value: 'Île-de-France'}],
      country: {value: 'France'}
    }
  };

  const defaultExpected = {
    name: 'rue de rivoli',
    administrative: 'Île-de-France',
    city: 'Paris',
    country: 'France',
    latlng: {
      lat: '123',
      lng: '456'
    },
    postcode: '75004',
    hitIndex: 0,
    query: 'query',
    rawAnswer: 'rawAnswer',
    highlight: {
      name: 'Paris',
      city: 'Paris',
      administrative: 'Île-de-France',
      country: 'France'
    }
  };

  const hit = {
    ...defaultHit,
    ...userHit,
    _highlightResult: {
      ...defaultHit._highlightResult,
      ...userHit._highlightResult
    }
  };

  const expected = {
    ...defaultExpected,
    ...userExpected,
    highlight: {
      ...defaultExpected.highlight,
      ...userExpected.highlight
    },
    hit
  };

  return {
    name,
    input: {
      formatInputValue: jest.fn(() => 'value'),
      hit,
      hitIndex: 0,
      query: 'query',
      rawAnswer: 'rawAnswer'
    },
    expected
  };
}
