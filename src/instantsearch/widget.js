import places from '../places.js';

/**
 * The underlying structure for the Algolia Places instantsearch widget.
 */
class AlgoliaPlacesWidget {
  constructor({ defaultPosition, ...placesOptions }) {
    if (defaultPosition instanceof Array && defaultPosition.length === 2) {
      this.defaultPosition = defaultPosition.join(',');
    }

    this.placesOptions = placesOptions;
    this.placesAutocomplete = places(this.placesOptions);

    this.uiState = {};
  }

  init({ helper }) {
    helper
      .setQueryParameter('insideBoundingBox')
      .setQueryParameter('aroundLatLng', this.defaultPosition);

    this.placesAutocomplete.on('change', opts => {
      const {
        suggestion: {
          latlng: { lat, lng },
          value,
        },
      } = opts;

      this.uiState.position = `${lat},${lng}`;
      this.uiState.query = value;

      helper
        .setQueryParameter('insideBoundingBox')
        .setQueryParameter('aroundLatLng', this.uiState.position)
        .search();
    });

    this.placesAutocomplete.on('clear', () => {
      this.uiState.position = undefined;
      this.uiState.query = undefined;

      helper
        .setQueryParameter('insideBoundingBox')
        .setQueryParameter('aroundLatLng', this.defaultPosition)
        .search();
    });
  }

  getWidgetSearchParameters(searchParameters, { uiState }) {
    if (uiState.places) {
      const { query, position } = uiState.places;
      if (position === undefined) {
        return searchParameters;
      }

      this.placesAutocomplete.setVal(query || '');
      return searchParameters
        .setQueryParameter('insideBoundingBox')
        .setQueryParameter('aroundLatLng', position);
    }

    return searchParameters;
  }

  getWidgetState(uiState) {
    if (
      this.uiState.position === undefined &&
      this.uiState.query === undefined
    ) {
      const newUiState = Object.assign({}, uiState);
      delete newUiState.places;
      return newUiState;
    }
    return Object.assign({}, uiState, { places: this.uiState });
  }
}

/**
 * Creates a new instance of the Algolia Places widget. This widget
 * sets the geolocation value for the search based on the selected
 * result in the Algolia Places autocomplete. If the input is cleared,
 * the position is result to the default position.
 * @function
 * @param {object} opts configuration object
 * @param {number[]} opts.defaultPosition=[0,0] default position as an array of the form [lat, lng]
 * @returns {Widget} the algolia places widget
 */
export default function makeAlgoliaPlacesWidget(opts) {
  return new AlgoliaPlacesWidget(opts);
}
