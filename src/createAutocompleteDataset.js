import createAutocompleteSource from './createAutocompleteSource';
import defaultTemplates from './defaultTemplates';

export default function createAutocompleteDataset(options) {
  const templates = {
    ...defaultTemplates,
    ...options.templates,
  };

  const source = createAutocompleteSource({
    ...options,
    formatInputValue: templates.value,
    templates: undefined,
  });

  return {
    source,
    templates,
    displayKey: 'value',
    name: 'places',
  };
}
