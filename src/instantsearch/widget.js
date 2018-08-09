import places from '../places.js';

/**
 * The underlying structure for the Algolia Places instantsearch widget.
 */
class AlgoliaPlacesWidget {
  constructor({ defaultPosition, ...placesOptions }) {
    if (Array.isArray(defaultPosition) && defaultPosition.length === 2) {
      this.defaultPosition = defaultPosition.join(',');
    }

    this.placesOptions = placesOptions;
    this.placesAutocomplete = places(this.placesOptions);

    this.stateSetDuringRouting = false;
    this.query = '';
  }

  init({ helper }) {
    if (!this.stateSetDuringRouting) {
      helper
        .setQueryParameter('insideBoundingBox')
        .setQueryParameter('aroundLatLng', this.defaultPosition);
    }

    this.placesAutocomplete.on('change', opts => {
      const {
        suggestion: {
          latlng: { lat, lng },
          value,
        },
      } = opts;

      this.query = value;
      helper
        .setQueryParameter('insideBoundingBox')
        .setQueryParameter('aroundLatLng', `${lat},${lng}`)
        .search();
    });

    this.placesAutocomplete.on('clear', () => {
      this.query = '';
      helper
        .setQueryParameter('insideBoundingBox')
        .setQueryParameter('aroundLatLng', this.defaultPosition)
        .search();
    });
  }

  getWidgetSearchParameters(searchParameters, { uiState }) {
    if (!uiState.places) {
      this.placesAutocomplete.setVal('');
      this.placesAutocomplete.close();
      return searchParameters;
    }

    const { query, position } = uiState.places;

    this.stateSetDuringRouting = true;
    this.placesAutocomplete.setVal(query || '');
    this.placesAutocomplete.close();

    return searchParameters
      .setQueryParameter('insideBoundingBox')
      .setQueryParameter('aroundLatLng', position);
  }

  getWidgetState(uiState, { searchParameters }) {
    if (
      uiState.places &&
      this.query === uiState.places.query &&
      searchParameters.aroundLatLng === uiState.places.position
    ) {
      return uiState;
    }

    if (searchParameters.aroundLatLng === undefined && !this.query) {
      const newUiState = Object.assign({}, uiState);
      delete newUiState.places;
      return newUiState;
    }

    return {
      ...uiState,
      places: {
        query: this.query,
        position: searchParameters.aroundLatLng,
      },
    };
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
