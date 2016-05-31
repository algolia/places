import createAutocompleteSource from './createAutocompleteSource.js';
import defaultTemplates from './defaultTemplates.js';

export default function createAutocompleteDataset(options) {
  const templates = {
    ...defaultTemplates,
    ...options.templates
  };

  return {
    source: createAutocompleteSource({
      ...options,
      formatInputValue: templates.value
    }),
    templates,
    displayKey: 'value',
    name: 'places'
  };
}
