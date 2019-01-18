---
title: Support
layout: documentation
---

## Need help?

Algolia Places is built by [Algolia's people](https://www.algolia.com/about). We are here to help you with any issues you would face while using Algolia Places.

## Wrong Data Issues
Places is built on top of OpenStreetMap, which is a community driven project, and like every project relying on human effort, it can be incomplete, incorrect or redundant.

Before raising an issue about the data in Places, we recommend to first investigate whether the data issue is reproducible in OpenStreetMap. If it is, the issue comes from OSM and can be fixed there, improving the quality of the project for everyone.

### How to tell whether the data is incorrect in OpenStreetMap
You can check if a result is incorrect in OpenStreetMap by following these few steps:

1. Enter your problematic query in [Nominatim](https://nominatim.openstreetmap.org/)
2. Click on the nominatim result that matches and check if the data is correct there

If the data is incorrect in Nominatim/OpenStreetMap, you can simply edit the corresponding record, and it will appear in Places after our next OpenStreetMap import.

If the data is correct in OpenStreetMap but not in Places, don't hesitate to use the irrelevant results form below. We will investigate the issue and come back to you.

### How to make OpenStreetMap better
The only thing required to improve OSM data is an account on openstreetmap.org. Then you just have to visit [https://www.openstreetmap.org](https://www.openstreetmap.org), zoom to the area with the problematic data, and click "edit". The editor has a built-in guide that will explain the basics.

If you want to know how to best contribute to OpenStreetMap, we recommend that you follow the [Beginner's Guide in the OpenStreetMap wiki](https://wiki.openstreetmap.org/wiki/Beginners%27_guide).


## Reporting an issue

### Things to remember

Places only offers street-level precision, this means that it is expected for the following two queries to return the same geolocation, which corresponds to the middle of the street:

```js
100 Mission Street, San Francisco // returns 37.7526, -122.418
2000 Mission Street, San Francisco // returns 37.7526, -122.418
``` 

In some countries, such as the United Kingdom or the Netherlands, very precise postcode areas are being used and these postcode areas fall below the street-level precision that Places offers, which means that due to the sparseness of house-level data in OSM, Places records might return an incomplete list of postcodes, none of which are relevant for the house number entered in the query, or truncated postcodes. This is a known limitation of Places, and not something we can fix.

### Irrelevant results

Should the Places suggestions appear irrelevant, <a href="https://docs.google.com/forms/d/13r_7B72v6u6326atqzKZpv0fs_3OUOJFR-6QDipHl3Y/viewform?entry.1560244398&entry.1894094686&entry.1809496416&entry.2029760924&entry.1442423869&entry.1714224469&entry.1070945708=Find+it+on+https://api.ipify.org/&entry.2019626860=Find+it+on+https://jsfiddle.net/qmjet97b/" id="support-google-form" target="_blank">let us know via our dedicated form</a>.

### places.js bugs

The whole Algolia Places JavaScript library and website are available on github.

If you have any issue while using places.js, [search for a corresponding issue](https://github.com/algolia/places/issues?utf8=%E2%9C%93&q=is%3Aissue)
first.

If you do not find any corresponding issue, [open a new one](https://github.com/algolia/places/issues/new) describing your problem in simple words.

## Coding help

The easiest way to get some coding advice is to ask your question on [Stack Overflow](https://stackoverflow.com/questions/tagged/algolia) using the tags 'algolia' and 'places'. Our community of users will be happy to help you there.


<script>
  function getip(res) {
    window.userip = res.ip;
  }
</script>
<script src="https://api.ipify.org?format=jsonp&callback=getip"></script>
