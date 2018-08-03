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

    this.state = {};
  }

  init({ helper }) {
    helper
      .setQueryParameter('insideBoundingBox')
      .setQueryParameter(
        'aroundLatLng',
        this.state.position || this.defaultPosition
      );

    this.placesAutocomplete.on('change', opts => {
      const {
        suggestion: {
          latlng: { lat, lng },
          value,
        },
      } = opts;

      this.state.position = `${lat},${lng}`;
      this.state.query = value;

      helper
        .setQueryParameter('insideBoundingBox')
        .setQueryParameter('aroundLatLng', this.state.position)
        .search();
    });

    this.placesAutocomplete.on('clear', () => {
      this.state.position = undefined;
      this.state.query = undefined;

      helper
        .setQueryParameter('insideBoundingBox')
        .setQueryParameter('aroundLatLng', this.defaultPosition)
        .search();
    });
  }

  getWidgetSearchParameters(searchParameters, { uiState }) {
    if (!uiState.places) {
      this.placesAutocomplete.setVal('');
      return searchParameters;
    }

    const { query, position } = uiState.places;

    this.state = uiState.places;
    this.placesAutocomplete.setVal(query || '');

    return searchParameters
      .setQueryParameter('insideBoundingBox')
      .setQueryParameter('aroundLatLng', position);
  }

  getWidgetState(uiState, { searchParameters }) {
    if (
      uiState.places &&
      this.state.query === uiState.places.query &&
      searchParameters.aroundLatLng === uiState.places.position
    ) {
      return uiState;
    }

    if (
      searchParameters.aroundLatLng === undefined &&
      this.state.query === undefined
    ) {
      const newUiState = Object.assign({}, uiState);
      delete newUiState.places;
      return newUiState;
    }

    return {
      ...uiState,
      places: {
        query: this.state.query,
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
