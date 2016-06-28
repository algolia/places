import createAutocompleteSource from './createAutocompleteSource.js';
import defaultTemplates from './defaultTemplates.js';

export default function createAutocompleteDataset(options) {
  const templates = {
    ...defaultTemplates,
    ...options.templates
  };

  const source = createAutocompleteSource({
    ...options,
    formatInputValue: templates.value
  });

  return {
    source,
    templates,
    displayKey: 'value',
    name: 'places'
  };
}
