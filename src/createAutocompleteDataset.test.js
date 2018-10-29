import createAutocompleteDataset from './createAutocompleteDataset';
import createAutocompleteSource from './createAutocompleteSource';

jest.mock('./defaultTemplates.js', () => ({ template: 'test', value: 'test' }));
jest.mock('./createAutocompleteSource.js', () => jest.fn(() => 'source'));

describe('createAutocompleteDataset', () => {
  let dataset;

  beforeEach(() => createAutocompleteSource.mockClear());
  beforeEach(() => {
    dataset = createAutocompleteDataset({
      templates: { option: 'test' },
      option: 'test',
    });
  });

  it('returns an autocomplete.js dataset', () => {
    expect(dataset).toEqual({
      source: 'source',
      templates: { template: 'test', value: 'test', option: 'test' },
      displayKey: 'value',
      name: 'places',
    });
  });

  it('calls createAutocompleteSource', () => {
    expect(createAutocompleteSource.mock.calls[0][0]).toEqual({
      formatInputValue: 'test',
      option: 'test',
    });
  });
});
