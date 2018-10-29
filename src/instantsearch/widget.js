import places from '../places';

/**
 * The underlying structure for the Algolia Places instantsearch widget.
 */
class AlgoliaPlacesWidget {
  constructor({ defaultPosition, ...placesOptions } = {}) {
    if (Array.isArray(defaultPosition) && defaultPosition.length === 2) {
      this.defaultPosition = defaultPosition.join(',');
    }

    this.placesOptions = placesOptions;
    this.placesAutocomplete = places(this.placesOptions);

    this.query = '';
    this.initialLatLngViaIP = null;
  }

  getConfiguration() {
    const configuration = {};

    if (this.defaultPosition) {
      configuration.insideBoundingBox = undefined;
      configuration.aroundLatLngViaIP = false;
      configuration.aroundLatLng = this.defaultPosition;
    }

    return configuration;
  }

  init({ helper }) {
    // Get the initial value only when it's not already set via URLSync
    // see: getWidgetSearchParameters
    if (this.initialLatLngViaIP === null) {
      // The value is retrieved in the `init` rather than `getConfiguration`
      // because the widget that set `aroundLatLngViaIP` might be registered
      // after this one. We wait until we have the full configuration to save
      // the initial value.
      this.initialLatLngViaIP = helper.getQueryParameter('aroundLatLngViaIP');
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
        .setQueryParameter('aroundLatLngViaIP', false)
        .setQueryParameter('aroundLatLng', `${lat},${lng}`)
        .search();
    });

    this.placesAutocomplete.on('clear', () => {
      this.query = '';

      helper.setQueryParameter('insideBoundingBox');

      if (this.defaultPosition) {
        helper
          .setQueryParameter('aroundLatLngViaIP', false)
          .setQueryParameter('aroundLatLng', this.defaultPosition);
      } else {
        helper
          .setQueryParameter('aroundLatLngViaIP', this.initialLatLngViaIP)
          .setQueryParameter('aroundLatLng');
      }

      helper.search();
    });
  }

  getWidgetSearchParameters(searchParameters, { uiState }) {
    if (!uiState.places) {
      this.placesAutocomplete.setVal('');
      this.placesAutocomplete.close();

      return searchParameters;
    }

    const { query, position } = uiState.places;

    this.query = query;
    this.initialLatLngViaIP = searchParameters.getQueryParameter(
      'aroundLatLngViaIP'
    );

    this.placesAutocomplete.setVal(query || '');
    this.placesAutocomplete.close();

    return searchParameters
      .setQueryParameter('insideBoundingBox')
      .setQueryParameter('aroundLatLngViaIP', false)
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
