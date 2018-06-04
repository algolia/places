import places from '../places.js';

/**
 * The underlying structure for the Algolia Places instantsearch widget.
 */
class AlgoliaPlacesWidget {
  constructor({ defaultPosition = [0, 0], ...placesOptions }) {
    this.defaultPosition = defaultPosition.join(',');
    this.placesOptions = placesOptions;
  }
  init({ helper }) {
    const placesAutocomplete = places(this.placesOptions);

    helper
      .setQueryParameter('insideBoundingBox')
      .setQueryParameter('aroundLatLng', this.defaultPosition);

    placesAutocomplete.on('change', opts => {
      const {
        suggestion: {
          latlng: { lat, lng },
        },
      } = opts;

      helper
        .setQueryParameter('insideBoundingBox')
        .setQueryParameter('aroundLatLng', `${lat},${lng}`)
        .search();
    });

    placesAutocomplete.on('clear', () => {
      helper
        .setQueryParameter('insideBoundingBox')
        .setQueryParameter('aroundLatLng', this.defaultPosition)
        .search();
    });
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
