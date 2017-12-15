import searchHelper from 'algoliasearch-helper';
import algoliaPlacesWidget from './widget.js';
import places from '../places.js';

jest.mock('../places.js', () => {
  const module = jest.fn(() => {
    const instance = { on: jest.fn() };

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

    expect(places).toBeCalledWith({ places: 'option' });
  });

  it('configures the helper', () => {
    const client = createFakeClient();
    const helper = createFakekHelper(client);
    const widget = algoliaPlacesWidget(defaultOptions);

    widget.init({ helper });

    expect(helper.getState()).toMatchObject({
      insideBoundingBox: undefined,
      aroundLatLng: '0,0',
    });
  });

  it('accepts a defaultPosition parameter', () => {
    const client = createFakeClient();
    const helper = createFakekHelper(client);
    const widget = algoliaPlacesWidget({ defaultPosition: [1, 1] });

    widget.init({ helper });

    expect(helper.getState()).toMatchObject({
      insideBoundingBox: undefined,
      aroundLatLng: '1,1',
    });
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

    expect(helper.search).toBeCalled();
    expect(helper.getState()).toMatchObject({
      insideBoundingBox: undefined,
      aroundLatLng: '123,456',
    });
  });

  it('configures aroundLatLng on clear event', () => {
    const client = createFakeClient();
    const helper = createFakekHelper(client);
    const widget = algoliaPlacesWidget({ defaultPosition: [2, 2] });

    widget.init({ helper });

    const eventName = places.__instance.on.mock.calls[1][0];
    const eventListener = places.__instance.on.mock.calls[1][1];

    expect(eventName).toEqual('clear');

    eventListener();

    expect(helper.search).toBeCalled();
    expect(helper.getState()).toMatchObject({
      insideBoundingBox: undefined,
      aroundLatLng: '2,2',
    });
  });
});
