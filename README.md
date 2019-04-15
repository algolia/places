[![header]][places-website]

[![Version][version-svg]][package-url] [![Build Status][travis-svg]][travis-url] [![License][license-image]][license-url] [![Downloads][downloads-image]][downloads-url] [![jsDelivr Hits][jsdelivr-badge]][jsdelivr-url]

[Algolia Places][places-website] provides a fast, distributed and easy way to use an address search autocomplete JavaScript library on your website.

See the [website][places-website] for more information.

Read the [blog post](https://blog.algolia.com/introducing-algolia-places/) introducing Algolia Places.

Fill the [Google form](https://community.algolia.com/places/support.html#irrelevant-results) to report any irrelevant results.

## Demo

Watch [more examples on the website][places-website-examples].

[![demo]][places-website]

## Getting started

To use Algolia Places, all you need is an `<input>` and some JavaScript code that will load
and use the places.js library.

### CDN `<script>`

Our JavaScript library is available on the [jsDelivr CDN](http://www.jsdelivr.com) and also on  [cdnjs](https://cdnjs.com/libraries/places.js).

```html
<script src="https://cdn.jsdelivr.net/npm/places.js@1.16.4"></script>
```

[![Version][version-svg]][package-url] is the latest version.

Here's a small example using it:

```html
<input type="search" id="address-input" placeholder="Where are we going?" />

<script>
  var placesAutocomplete = places({
    appId: <YOUR_PLACES_APP_ID>,
    apiKey: <YOUR_PLACES_API_KEY>,
    container: document.querySelector('#address-input')
  });
</script>
```

### Using npm

Algolia Places is also available on [npm](https://www.npmjs.com/package/places.js).

Install the module:

```sh
npm install places.js --save
```

Put an `<input>` in your html page:

```html
<input type="search" id="address-input" placeholder="Where are we going?" />
```

Initialize the places.js library:

```js
var places = require('places.js');
var placesAutocomplete = places({
  appId: <YOUR_PLACES_APP_ID>,
  apiKey: <YOUR_PLACES_API_KEY>,
  container: document.querySelector('#address-input')
});
```

Full documentation is available on the [Algolia Places website][places-website].

## Contributing

Wanna contribute? Awesome, please read the [contributing guide][contributing].

[demo]: ./demo.gif
[header]: ./header.png
[version-svg]: https://img.shields.io/npm/v/places.js.svg?style=flat-square
[package-url]: https://npmjs.org/package/places.js
[travis-svg]: https://img.shields.io/travis/algolia/places/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/algolia/places
[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/places.js.svg?style=flat-square
[downloads-url]: http://npm-stat.com/charts.html?package=places.js
[places-website]: https://community.algolia.com/places/?utm_medium=social-owned&utm_source=GitHub&utm_campaign=places%20repository
[places-website-examples]: https://community.algolia.com/places/examples.html?utm_medium=social-owned&utm_source=GitHub&utm_campaign=places%20repository
[algolia-website]: https://www.algolia.com/?utm_medium=social-owned&utm_source=GitHub&utm_campaign=places%20repository
[places-docs]: https://community.algolia.com/places/documentation/?utm_medium=social-owned&utm_source=GitHub&utm_campaign=places%20repository
[contributing]: CONTRIBUTING.md
[jsdelivr-badge]: https://data.jsdelivr.com/v1/package/npm/places.js/badge
[jsdelivr-url]: https://www.jsdelivr.com/package/npm/places.js
