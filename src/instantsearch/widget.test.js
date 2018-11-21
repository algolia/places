import searchHelper, { SearchParameters } from 'algoliasearch-helper';
import algoliaPlacesWidget from './widget';
import places from '../places';

jest.mock('../places.js', () => {
  const module = jest.fn(() => {
    const instance = { on: jest.fn(), setVal: jest.fn(), close: jest.fn() };

    module.__instance = instance;
    return instance;
  });

  return module;
});

const createFakeClient = () => ({
  addAlgoliaAgent: () => {},
});

const createFakekHelper = client => {
  const helper = searchHelper(client);

  helper.search = jest.fn();

  return helper;
};

describe('instantsearch widget', () => {
  const defaultOptions = {
    places: 'option',
  };

  it('creates a places instance', () => {
    const client = createFakeClient();
    const helper = createFakekHelper(client);
    const widget = algoliaPlacesWidget(defaultOptions);

    widget.init({ helper });

    expect(places).toHaveBeenCalledWith({ places: 'option' });
  });

  it('creates a places instance without parameters', () => {
    expect(() => algoliaPlacesWidget()).not.toThrow();
  });

  it('configures the helper', () => {
    const client = createFakeClient();
    const helper = createFakekHelper(client);
    const widget = algoliaPlacesWidget(defaultOptions);

    widget.init({ helper });

    expect(helper.getState()).toMatchObject({
      insideBoundingBox: undefined,
      aroundLatLng: undefined,
    });
  });

  it('does not call setQueryParameter during the init step', () => {
    // Using setQueryParameter to change a filter value during the init step will
    // have unintented consequences such as resetting the pagination to 0.
    // We should not do that
    const client = createFakeClient();
    const helper = createFakekHelper(client);
    const widget = algoliaPlacesWidget(defaultOptions);

    helper.setQueryParameter = jest.fn();
    widget.init({ helper });

    expect(helper.setQueryParameter).not.toHaveBeenCalled();
  });

  it('accepts a defaultPosition parameter', () => {
    const widget = algoliaPlacesWidget({ defaultPosition: [1, 1] });

    const beforeConfiguration = {};
    const afterConfiguration = widget.getConfiguration(beforeConfiguration);

    expect(afterConfiguration).toEqual({
      insideBoundingBox: undefined,
      aroundLatLngViaIP: false,
      aroundLatLng: '1,1',
    });
  });

  it('overrides the aroundLatLng if a defaultPosition parameter is passed', () => {
    const widget = algoliaPlacesWidget({ defaultPosition: [1, 1] });

    const beforeConfiguration = {
      aroundLatLng: '12,14',
    };

    const afterConfiguration = widget.getConfiguration(beforeConfiguration);

    expect(afterConfiguration).toEqual({
      insideBoundingBox: undefined,
      aroundLatLngViaIP: false,
      aroundLatLng: '1,1',
    });
  });

  it('does nothing to aroundLatLng if no defaultPosition parameter is passed', () => {
    const widget = algoliaPlacesWidget({});

    const beforeConfiguration = {
      aroundLatLng: '12,14',
    };

    const afterConfiguration = widget.getConfiguration(beforeConfiguration);

    expect(afterConfiguration).toEqual({});
  });

  it('configures aroundLatLng on change event', () => {
    const client = createFakeClient();
    const helper = createFakekHelper(client);
    const widget = algoliaPlacesWidget(defaultOptions);

    widget.init({ helper });

    const eventName = places.__instance.on.mock.calls[0][0];
    const eventListener = places.__instance.on.mock.calls[0][1];

    expect(eventName).toEqual('change');

    eventListener({ suggestion: { latlng: { lat: '123', lng: '456' } } });

    expect(helper.search).toHaveBeenCalled();
    expect(helper.getState()).toMatchObject({
      insideBoundingBox: undefined,
      aroundLatLng: '123,456',
    });
  });

  it('removes aroundLatLngViaIP on change event', () => {
    const client = createFakeClient();
    const helper = createFakekHelper(client);
    const widget = algoliaPlacesWidget(defaultOptions);

    helper.setQueryParameter('aroundLatLngViaIP', true);

    widget.init({ helper });

    const eventName = places.__instance.on.mock.calls[0][0];
    const eventListener = places.__instance.on.mock.calls[0][1];

    expect(eventName).toEqual('change');

    eventListener({ suggestion: { latlng: { lat: '123', lng: '456' } } });

    expect(helper.search).toHaveBeenCalled();
    expect(helper.getState()).toMatchObject({
      insideBoundingBox: undefined,
      aroundLatLng: '123,456',
      aroundLatLngViaIP: false,
    });
  });

  it('configures aroundLatLng with a default position on clear event', () => {
    const client = createFakeClient();
    const helper = createFakekHelper(client);
    const widget = algoliaPlacesWidget({ defaultPosition: [2, 2] });

    helper.setQueryParameter('aroundLatLngViaIP', true);

    widget.init({ helper });

    const eventName = places.__instance.on.mock.calls[1][0];
    const eventListener = places.__instance.on.mock.calls[1][1];

    expect(eventName).toEqual('clear');

    eventListener();

    expect(helper.search).toHaveBeenCalled();
    expect(helper.getState()).toMatchObject({
      insideBoundingBox: undefined,
      aroundLatLngViaIP: false,
      aroundLatLng: '2,2',
    });
  });

  it('restores aroundLatLngViaIP without a default position on clear event', () => {
    const client = createFakeClient();
    const helper = createFakekHelper(client);
    const widget = algoliaPlacesWidget();

    helper.setQueryParameter('aroundLatLngViaIP', true);

    widget.init({ helper });

    const changeEventName = places.__instance.on.mock.calls[0][0];
    const changeEventListener = places.__instance.on.mock.calls[0][1];

    expect(changeEventName).toEqual('change');

    changeEventListener({
      suggestion: {
        latlng: {
          lat: '123',
          lng: '456',
        },
      },
    });

    expect(helper.search).toHaveBeenCalled();
    expect(helper.getState()).toMatchObject({
      insideBoundingBox: undefined,
      aroundLatLng: '123,456',
      aroundLatLngViaIP: false,
    });

    const clearEventName = places.__instance.on.mock.calls[1][0];
    const clearEventListener = places.__instance.on.mock.calls[1][1];

    expect(clearEventName).toEqual('clear');

    clearEventListener();

    expect(helper.search).toHaveBeenCalled();
    expect(helper.getState()).toMatchObject({
      insideBoundingBox: undefined,
      aroundLatLng: undefined,
      aroundLatLngViaIP: true,
    });
  });

  describe('routing', () => {
    const getInitializedWidget = (
      widgetOptions = { defaultPosition: [2, 2] }
    ) => {
      const client = createFakeClient();
      const helper = createFakekHelper(client);
      const widget = algoliaPlacesWidget(widgetOptions);

      widget.init({ helper, state: helper.state });

      return [widget, helper];
    };

    it('restores aroundLatLngViaIP on clear event', () => {
      const client = createFakeClient();
      const helper = createFakekHelper(client);
      const widget = algoliaPlacesWidget();

      // Simulate the fact that a widget set `aroundLatLngViaIP` from the URLSync
      const searchParametersBefore = SearchParameters.make({
        aroundLatLngViaIP: true,
      });

      const uiState = {
        places: {
          position: '123,123',
          query: 'Paris',
        },
      };

      widget.getWidgetSearchParameters(searchParametersBefore, {
        uiState,
      });

      widget.init({ helper });

      const clearEventListener = places.__instance.on.mock.calls[1][1];

      clearEventListener();

      expect(helper.search).toHaveBeenCalled();
      expect(helper.getState()).toMatchObject({
        insideBoundingBox: undefined,
        aroundLatLng: undefined,
        aroundLatLngViaIP: true,
      });
    });

    describe('getWidgetState', () => {
      test('should give back the object unmodified if the default value is selected', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchObject(uiStateBefore);
      });

      test('should give update uiState with position', () => {
        const [widget, helper] = getInitializedWidget();

        const eventName = places.__instance.on.mock.calls[0][0];
        const eventListener = places.__instance.on.mock.calls[0][1];

        expect(eventName).toEqual('change');

        eventListener({
          suggestion: {
            latlng: { lat: '123', lng: '456' },
            value: 'Paris',
          },
        });

        expect(helper.search).toHaveBeenCalled();
        expect(helper.getState()).toMatchObject({
          insideBoundingBox: undefined,
          aroundLatLng: '123,456',
        });

        const uiStateBefore = {};

        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        const expectedUiState = {
          places: {
            position: '123,456',
            query: 'Paris',
          },
        };

        expect(uiStateAfter).toMatchObject(expectedUiState);
      });

      test('should reset places uiState on clear', () => {
        const [widget, helper] = getInitializedWidget();

        const eventName = places.__instance.on.mock.calls[1][0];
        const eventListener = places.__instance.on.mock.calls[1][1];

        expect(eventName).toEqual('clear');

        eventListener();

        expect(helper.search).toHaveBeenCalled();
        expect(helper.getState()).toMatchObject({
          insideBoundingBox: undefined,
          aroundLatLng: '2,2',
        });

        const uiStateBefore = {
          places: {
            position: '123,456',
            query: 'Paris',
          },
        };

        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        const expectedUiState = {
          places: {
            position: '2,2',
            query: '',
          },
        };

        expect(uiStateAfter).toEqual(expectedUiState);
      });

      test('should reset places uiState on clear with no widgetOptions', () => {
        const [widget, helper] = getInitializedWidget({});

        const eventName = places.__instance.on.mock.calls[1][0];
        const eventListener = places.__instance.on.mock.calls[1][1];

        expect(eventName).toEqual('clear');

        eventListener();

        expect(helper.search).toHaveBeenCalled();
        expect(helper.getState()).toMatchObject({
          insideBoundingBox: undefined,
          aroundLatLng: undefined,
        });

        const uiStateBefore = {
          places: {
            position: '123,456',
            query: 'Paris',
          },
        };

        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        const expectedUiState = {};

        expect(uiStateAfter).toEqual(expectedUiState);
      });
    });

    describe('getWidgetSearchParameters', () => {
      test('should return the same SP if there are no refinements in the UI state', () => {
        const [widget, helper] = getInitializedWidget();
        // The user presses back (browser), and the URL contains no parameters
        const uiState = {};
        // The current state is empty (and page is set to 0 by default)
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the same values should not return a new object
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should not care about the default value even if no value is in the UI State', () => {
        const [widget, helper] = getInitializedWidget();
        // The user presses back (browser), and the URL contains no parameters
        const uiState = {};

        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        expect(searchParametersAfter).toMatchSnapshot();
        expect(searchParametersAfter.aroundLatLng).toBe(undefined);
        expect(searchParametersAfter.insideBoundingBox).toBe(undefined);
      });

      test('should reset aroundLatLng if no defaultOptions and no value is in the UI State', () => {
        const [widget, helper] = getInitializedWidget({});
        // The user presses back (browser), and the URL contains no parameters
        const uiState = {};
        // The current state is set to page 4

        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying an empty state, should force back to page 0
        expect(searchParametersAfter).toMatchSnapshot();
        expect(searchParametersAfter.aroundLatLng).toBe(undefined);
        expect(searchParametersAfter.insideBoundingBox).toBe(undefined);
      });

      test('should add the refinements according to the UI state provided', () => {
        const [widget, helper] = getInitializedWidget();
        // The user presses back (browser), and the URL contains some parameters
        const uiState = {
          places: {
            position: '123,123',
            query: 'Paris',
          },
        };

        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying a state with new parameters should apply them on the search
        expect(searchParametersAfter).toMatchSnapshot();
        expect(searchParametersAfter.insideBoundingBox).toBe(undefined);
        expect(searchParametersAfter.aroundLatLng).toBe('123,123');
      });

      test('should close the dropdown', () => {
        const [widget, helper] = getInitializedWidget();
        // The user presses back (browser), and the URL contains some parameters
        const uiState = {
          places: {
            position: '123,123',
            query: 'Paris',
          },
        };

        const searchParametersBefore = SearchParameters.make(helper.state);
        widget.getWidgetSearchParameters(searchParametersBefore, { uiState });
        // Applying a state with new parameters should apply them on the search
        expect(places.__instance.close).toHaveBeenCalled();
      });
    });
  });
});
