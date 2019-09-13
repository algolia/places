// WIP

type PlacesType = 'city' | 'country' | 'address' | 'busStop' | 'trainStation' | 'townhall' | 'airport'

type PlacesSuggestion = {
  type: PlacesType,
  name: string,
  city: string,
  country: string,
  countryCode: string,
  administrative: string,
  county: string,
  suburb: string,
  latlng: { lat: number, lng: number },
  postcode: string,
  postcodes: string[],
  value: string,
  highlight: {
    name?: string,
    suburb?: string,
    city?: string,
    postcode?: string,
    county?: string,
    administrative?: string,
    country?: string,
  },
}

type PlacesOptions = {
  container: HTMLInputElement,
  type?: PlacesType,
  language?: string,
  countries?: string[],
  aroundLatLng?: string,
  aroundLatLngViaIP?: boolean,
  aroundRadius?: number,
  insideBoundingBox?: string,
  insidePolygon?: string,
  getRankingInfo?: boolean,
  useDeviceLocation?: boolean,
  computeQueryParams?: object,
  appId?: string,
  apiKey?: string,
  templates?: { value: (suggestion: PlacesSuggestion) => string, suggestion: (suggestion: PlacesSuggestion) => string },
  style?: boolean,
  clientOptions?: object,
  autocompleteOptions?: object,
}

type RawAnswerAndQuery = { rawAnswer: object, query: string }

type PlacesEventsHandlers = {
  change: (e: RawAnswerAndQuery & { suggestion: PlacesSuggestion, suggestionIndex: number }) => void,
  suggestions: (e: RawAnswerAndQuery & { suggestions: PlacesSuggestion[] }) => void,
  cursorchanged: (e: RawAnswerAndQuery & { suggestion: PlacesSuggestion, suggestionIndex: number }) => void,
  limit: (e: { message: string }) => void,
  error: (e: { message: string }) => void,
  clear: () => void,
}


type PlacesFactory = (options: PlacesOptions) => ({
  on: <T extends keyof PlacesEventsHandlers>(eventName: T, callback: PlacesEventsHandlers[T]) => void,
  removeAllListeners: (eventName: keyof PlacesEventsHandlers) => void,
  // TODO WIP
})
