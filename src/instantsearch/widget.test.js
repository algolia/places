jest.mock('../places.js', () => {
  const module = jest.fn(() => {
    const instance = {on: jest.fn()};

    module.__instance = instance;
    return instance;
  });

  return module;
});

import algoliaPlacesWidget from './widget.js';
import places from '../places.js';

describe('instantsearch widget', () => {
  let helper;
  const defaultOptions = {
    places: 'option'
  };

  beforeEach(() => {
    helper = {
      setQueryParameter: jest.fn().mockReturnThis(),
      search: jest.fn().mockReturnThis()
    };
  });

  it('creates a places instance', () => {
    const widget = algoliaPlacesWidget(defaultOptions);
    widget.init({helper});
    expect(places).toBeCalledWith({places: 'option'});
  });

  it('configures the helper', () => {
    const widget = algoliaPlacesWidget(defaultOptions);
    widget.init({helper});
    expect(helper.setQueryParameter).toBeCalledWith('aroundLatLng', '0,0');
  });

  it('accepts a defaultPosition parameter', () => {
    const widget = algoliaPlacesWidget({defaultPosition: [1, 1]});
    widget.init({helper});
    expect(helper.setQueryParameter).toBeCalledWith('aroundLatLng', '1,1');
  });

  it('configures aroundLatLng on change event', () => {
    const widget = algoliaPlacesWidget(defaultOptions);
    widget.init({helper});

    const eventName = places.__instance.on.mock.calls[0][0];
    const eventListener = places.__instance.on.mock.calls[0][1];
    expect(eventName).toEqual('change');
    eventListener({suggestion: {latlng: {lat: '123', lng: '456'}}});
    expect(helper.setQueryParameter).toBeCalledWith('aroundLatLng', '123,456');
    expect(helper.search).toBeCalled();
  });

  it('configures aroundLatLng on clear event', () => {
    const widget = algoliaPlacesWidget({defaultPosition: [2, 2]});
    widget.init({helper});

    const eventName = places.__instance.on.mock.calls[1][0];
    const eventListener = places.__instance.on.mock.calls[1][1];
    expect(eventName).toEqual('clear');
    eventListener();
    expect(helper.setQueryParameter).toBeCalledWith('aroundLatLng', '2,2');
    expect(helper.search).toBeCalled();
  });
});
