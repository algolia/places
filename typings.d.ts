type Type = 'country' | 'city' | 'busStop' | 'townhall' | 'trainStation' | 'airport' | 'address'

/** @see src/formatHit.js:94 */
type Highlight = {
  administrative?: string,
  city?: string,
  country?: string,
  county?: string,
  name?: string,
  postcode?: string,
  suburb?: string,
}

/** @see src/formatHit.js:132
 * Initial undefined parameters can be missing in some situations,
 * because of Autocomplete.js, which remove undefined values.
 */
type Suggestion = {
  administrative?: string,
  city?: string,
  country: string,
  countryCode?: string,
  county?: string,
  highlight: Highlight,
  hit: Hit,
  hitIndex: number,
  latlng: Geoloc,
  name: string,
  postcode?: string,
  postcodes?: string[],
  query: string,
  rawAnswer: RawAnswer,
  suburb?: string,
  type: Type,
  value: string,
}

type Geoloc = {
  lat: number,
  lng: number,
}

type HighlightMatch = {
  value: string,
  matchLevel: string,
  matchedWords: string[],
}

type HighlightResults = {
  country: HighlightMatch,
  city: HighlightMatch[],
  postcode: HighlightMatch[],
  county: HighlightMatch[],
  administrative: HighlightMatch[],
  locale_names: (HighlightMatch & { fullyHighlighted: boolean })[],
}

type Hit = {
  _geoloc: Geoloc,
  _highlightResult: HighlightResults,
  _tags: string[],
  admin_level: number,
  administrative: string[],
  city: string[],
  country: string,
  country_code: string,
  county: string[],
  importance: number,
  is_city: boolean,
  is_country: boolean,
  is_highway: boolean,
  is_popular: boolean,
  is_suburb: boolean,
  locale_names: string[],
  objectID: string,
  population: number,
  postcode: string[],
}

type RawAnswer = {
  hits: Hit[],
  nbHits: number,
  processingTimeMS: number,
  query: string,
  params: string,
  degradedQuery: boolean,
}

type SuggestionsEvent = {
  query: string,
  rawAnswer: RawAnswer,
  suggestions: Suggestion[],
}

type ChangeEvent = {
  query: string,
  rawAnswer: RawAnswer,
  suggestion: Suggestion,
  suggestionIndex: number,
}

type CursorChangedEvent = {
  query: string,
  rawAnswer: RawAnswer,
  suggestion: Suggestion,
  suggestionIndex: number,
}

type PlacesEventsHandlers = {
  change: (changeEvent: ChangeEvent) => void,
  suggestions: (suggestionsEvent: SuggestionsEvent) => void,
  cursorchanged: (cursorChangedEvent: CursorChangedEvent) => void,
  limit: (e: { message: string }) => void,
  error: (e: { message: string }) => void,
  clear: () => void,
}

/** @see https://community.algolia.com/places/documentation.html#static-options */
type StaticOptions = {
  container: HTMLInputElement | string,
  appId?: string,
  apiKey?: string,
  templates?: { value: (suggestion: Suggestion) => string, suggestion: (suggestion: Suggestion) => string },
  style?: boolean,
  clientOptions?: object,
  autocompleteOptions?: object,
}

/** @see https://community.algolia.com/places/documentation.html#reconfigurable-options */
type ReconfigurableOptions = {
  type?: Type,
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
  hitsPerPage?: number,
}

type SearchClientOptions = ReconfigurableOptions & {
  query: string,
}

type ReverseClientOptions = {
  aroundLatLng: string,
  hitsPerPage: number,
  language: string,
}

type ClientReturn = {
  hits: Hit[],
  nbHits: number,
  processingTimeMs: number,
  params: string,
}

/** @see https://community.algolia.com/places/documentation.html#methods */
type PlacesInstance = {
  on: <T extends keyof PlacesEventsHandlers>(eventName: T, callback: PlacesEventsHandlers[T]) => void,
  removeAllListeners: (eventName: keyof PlacesEventsHandlers) => void,

  configure: (configuration: ReconfigurableOptions) => PlacesInstance,

  reverse: (options: ReverseClientOptions) => Promise<ClientReturn>,
  search: (options: SearchClientOptions) => Promise<ClientReturn>,

  open: () => void,
  close: () => void,
  getVal: () => string,
  setVal: (...args: any) => void, // TODO
  destroy: () => void,
}

export default function (options: StaticOptions & ReconfigurableOptions): PlacesInstance
