/* eslint-disable import/no-commonjs */
require('@babel/polyfill');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const puppeteer = require('puppeteer');
const { PendingXHR } = require('pending-xhr-puppeteer');
/* eslint-enable import/no-commonjs */

const utils = {};

utils.getParamsFromRequest = request => {
  const { _postData } = request;
  const { params } = JSON.parse(_postData);
  return new URLSearchParams(params);
};

utils.getXHRDataForQuery = (pendingXHR, query, source = 'places') => {
  const finishedXHRs = pendingXHR.finishedWithSuccessXhrs;
  const extractQueryFromRequest = request =>
    utils.getParamsFromRequest(request).get('query');

  return Array.from(finishedXHRs).find(request => {
    return (
      extractQueryFromRequest(request) === query && request._url.match(source)
    );
  });
};

utils.getResponseBodyFromRequest = request => {
  return request._response.json();
};

utils.matchDomWithHit = (domText, hit) => {
  const textContent = domText.trim();

  return [
    textContent.match(hit.locale_names[0]),
    textContent.match(hit.city[0]),
    textContent.match(hit.country),
  ].every(Boolean);
};

describe('releases', () => {
  beforeAll(() => {
    // check that the build dist exists
    const distExists = fs.existsSync(path.join(__dirname, '..', 'dist'));
    const indexExists = fs.existsSync(
      path.join(__dirname, '..', 'dist', 'index.js')
    );
    const cdnExists = fs.existsSync(path.join(__dirname, '..', 'dist', 'cdn'));

    assert.equal(distExists, true, 'Expected dist folder to exist');
    assert.equal(indexExists, true, 'Expected npm entrypoint to exist');
    assert.equal(cdnExists, true, 'Expected cdn folder to exist');
  });

  describe('npm package', () => {
    let url;
    let browser;
    let page;

    beforeAll(done => {
      url = `file://${path.join(__dirname, 'npm-lib', 'index.html')}`;
      // webpack bundle
      webpack(
        {
          mode: 'development',
          target: 'web',
          entry: {
            places: path.join(__dirname, 'npm-lib', 'import.js'),
          },
          output: {
            path: path.join(__dirname, 'npm-lib'),
            libraryTarget: 'umd',
          },
        },
        () => {
          done();
        }
      );
    });

    beforeEach(async () => {
      browser = await puppeteer.launch({
        headless: true,
      });
      page = await browser.newPage();
      await page.goto(url);

      await page.setExtraHTTPHeaders({
        referer: 'https://community.algolia.com/',
      });

      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    afterEach(async () => {
      await browser.close();
    });

    it('puppeteer can access demo file', () => {
      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    it('can search from search box', async () => {
      const pendingXHR = new PendingXHR(page);
      await page.focus('#search-box');
      const query = `55 rue d'Amsterd`;
      await page.keyboard.type(query);

      // Places should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length);

      await pendingXHR.waitForAllXhrFinished();

      const request = utils.getXHRDataForQuery(pendingXHR, query);

      // Places response should have the expected number of hits
      const body = await utils.getResponseBodyFromRequest(request);
      expect(body.hits).toHaveLength(5);

      // Places container should display suggestion dropdown
      const apDropdown = await page.$('.ap-dropdown-menu');
      expect(apDropdown).toBeTruthy();

      // Places suggestion dropdown should have has many suggestions as there are hits
      const suggestions = await page.$$eval('.ap-suggestion', $suggestions => {
        return Array.from($suggestions).map(elt => elt.textContent);
      });

      expect(suggestions).toHaveLength(body.hits.length);

      // Places suggestion dropdown data should match hits
      const allMatching = suggestions.every((domText, i) =>
        utils.matchDomWithHit(domText, body.hits[i])
      );
      expect(allMatching).toBeTruthy();
    });

    it('getVal returns the value of the input', async () => {
      const pendingXHR = new PendingXHR(page);
      await page.focus('#search-box');
      const query = `55 rue d'Amsterd`;
      await page.keyboard.type(query);

      // Places should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length);

      await pendingXHR.waitForAllXhrFinished();

      // Places suggestion dropdown should have has many suggestions as there are hits
      await page.$eval('.ap-suggestion', $suggestion => {
        $suggestion.click();
      });

      const value = await page.evaluate(`window.placesAutocomplete.getVal()`);
      expect(value).toMatch(`55 Rue d'Amsterdam`);
    });

    it('exposes a working configure method', async () => {
      const pendingXHR = new PendingXHR(page);
      // Places instance should have a .configure method
      const configureMethodExists = await page.evaluate(() => {
        return typeof window.placesAutocomplete.configure === 'function';
      });

      expect(configureMethodExists).toBeTruthy();

      // Places instance .configure method should modify the requests
      await page.evaluate(() => {
        window.placesAutocomplete.configure({
          countries: ['us'],
          type: 'city',
        });
      });

      await page.focus('#search-box');
      const query = `Paris`;
      await page.keyboard.type(query);

      // Places should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length);

      await pendingXHR.waitForAllXhrFinished();

      const request = utils.getXHRDataForQuery(pendingXHR, query);
      const params = utils.getParamsFromRequest(request);

      expect(JSON.parse(params.get('countries'))).toEqual(['us']);
      expect(params.get('type')).toEqual('city');
    });

    it('exposes a working search method', async () => {
      // Places instance should have a .search method
      const searchMethodExists = await page.evaluate(() => {
        return typeof window.placesAutocomplete.search === 'function';
      });

      expect(searchMethodExists).toBeTruthy();

      // Places instance .search method should return suggestions
      const response = await page.evaluate(() => {
        return window.placesAutocomplete.search('Paris');
      });

      expect(response).toBeInstanceOf(Array);
      const definedValues = response
        .map(({ value }) => value)
        .filter(value => value !== undefined);
      expect(response.length).toEqual(definedValues.length);
    });

    it('exposes a working reverse method', async () => {
      // Places instance should have a .reverse method
      const reverseMethodExists = await page.evaluate(() => {
        return typeof window.placesAutocomplete.reverse === 'function';
      });

      expect(reverseMethodExists).toBeTruthy();

      // Places instance .reverse method should return suggestions
      const response = await page.evaluate(() => {
        return window.placesAutocomplete.reverse('48.880338,2.326611');
      });

      expect(response).toBeInstanceOf(Array);
      const definedValues = response
        .map(({ value }) => value)
        .filter(value => value !== undefined);
      expect(response.length).toEqual(definedValues.length);
    });
  });

  describe('npm autocomplete', () => {
    let url;
    let browser;
    let page;

    beforeAll(done => {
      url = `file://${path.join(__dirname, 'npm-autocomplete', 'index.html')}`;
      // webpack bundle
      webpack(
        {
          mode: 'development',
          target: 'web',
          entry: {
            places: path.join(__dirname, 'npm-autocomplete', 'import.js'),
          },
          output: {
            path: path.join(__dirname, 'npm-autocomplete'),
            libraryTarget: 'umd',
          },
        },
        () => {
          done();
        }
      );
    });

    beforeEach(async () => {
      browser = await puppeteer.launch({
        headless: true,
      });
      page = await browser.newPage();
      await page.goto(url);

      await page.setExtraHTTPHeaders({
        referer: 'https://community.algolia.com/',
      });

      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    afterEach(async () => {
      await browser.close();
    });

    it('puppeteer can access demo file', () => {
      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    it('can search from search box', async () => {
      const pendingXHR = new PendingXHR(page);
      await page.focus('#search-box');
      const query = `London`;
      await page.keyboard.type(query);

      // autocomplete should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length * 2);
      await pendingXHR.waitForAllXhrFinished();

      const request = utils.getXHRDataForQuery(pendingXHR, query);

      // Places response should have the expected number of hits
      const body = await utils.getResponseBodyFromRequest(request);
      expect(body.hits).toHaveLength(3);

      // autocomplete container should display suggestion dropdown
      const apDropdown = await page.$('.ap-dropdown-menu');
      expect(apDropdown).toBeTruthy();

      // Places suggestion dropdown should have has many suggestions as there are hits
      const suggestions = await page.$$eval(
        '.ap-dataset-places .ap-suggestion',
        $suggestions => {
          return Array.from($suggestions).map(elt => elt.textContent);
        }
      );

      expect(suggestions).toHaveLength(body.hits.length);

      // Places suggestion dropdown data should match hits
      const allMatching = suggestions.every((domText, i) =>
        domText.match(body.hits[i].locale_names[0])
      );
      expect(allMatching).toBeTruthy();
    });
  });

  describe('npm widget', () => {
    let url;
    let browser;
    let page;

    beforeAll(done => {
      url = `file://${path.join(__dirname, 'npm-widget', 'index.html')}`;
      // webpack bundle
      webpack(
        {
          mode: 'development',
          target: 'web',
          entry: {
            places: path.join(__dirname, 'npm-widget', 'import.js'),
          },
          output: {
            path: path.join(__dirname, 'npm-widget'),
            libraryTarget: 'umd',
          },
        },
        () => {
          done();
        }
      );
    });

    beforeEach(async () => {
      browser = await puppeteer.launch({
        headless: true,
      });
      page = await browser.newPage();
      await page.goto(url);

      await page.setExtraHTTPHeaders({
        referer: 'https://community.algolia.com/',
      });

      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    afterEach(async () => {
      await browser.close();
    });

    it('puppeteer can access demo file', () => {
      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    it('using places search box updates aroundLatLng in InstantSearch', async () => {
      const pendingXHR = new PendingXHR(page);

      expect(pendingXHR.pendingXhrCount()).toEqual(0);
      await pendingXHR.waitForAllXhrFinished();

      await page.focus('#search-box');
      const query = `55 rue d'Amsterd`;
      await page.keyboard.type(query);

      // autocomplete should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length);
      await pendingXHR.waitForAllXhrFinished();

      const request = utils.getXHRDataForQuery(pendingXHR, query);

      const body = await utils.getResponseBodyFromRequest(request);
      const geoloc = body.hits[0]._geoloc;

      const aroundLatLngQueriesBeforeSelect = Array.from(
        pendingXHR.finishedWithSuccessXhrs
      )
        .filter($request => $request._url.match(/queries/)) // generic algolia query
        .filter($request => {
          const { _postData } = $request;
          const $body = JSON.parse(_postData);
          const params = new URLSearchParams($body.requests[0].params);
          return params.get('aroundLatLng') === `${geoloc.lat},${geoloc.lng}`;
        });

      // we shouldn't have done any aroundLatLng query yet
      expect(aroundLatLngQueriesBeforeSelect).toHaveLength(0);

      // selecting a result should trigger a query
      await page.keyboard.press('Enter');

      expect(pendingXHR.pendingXhrCount()).toEqual(1);
      await pendingXHR.waitForAllXhrFinished();

      const aroundLatLngQueriesAfterSelect = Array.from(
        pendingXHR.finishedWithSuccessXhrs
      )
        .filter($request => $request._url.match(/queries/)) // generic algolia query
        .filter($request => {
          const { _postData } = $request;
          const $body = JSON.parse(_postData);
          const params = new URLSearchParams($body.requests[0].params);
          return params.get('aroundLatLng') === `${geoloc.lat},${geoloc.lng}`;
        });

      expect(aroundLatLngQueriesAfterSelect).toHaveLength(1);
    });
  });

  describe('cdn place.js non-minified', () => {
    let url;
    let browser;
    let page;

    beforeAll(() => {
      url = `file://${path.join(__dirname, 'cdn-main', 'index.html')}`;
    });

    beforeEach(async () => {
      browser = await puppeteer.launch({
        headless: true,
      });
      page = await browser.newPage();
      await page.goto(url);

      await page.setExtraHTTPHeaders({
        referer: 'https://community.algolia.com/',
      });

      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    afterEach(async () => {
      await browser.close();
    });

    it('puppeteer can access demo file', () => {
      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    it('can search from search box', async () => {
      const pendingXHR = new PendingXHR(page);
      await page.focus('#search-box');
      const query = `55 rue d'Amsterd`;
      await page.keyboard.type(query);

      // Places should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length);

      await pendingXHR.waitForAllXhrFinished();

      const request = utils.getXHRDataForQuery(pendingXHR, query);

      // Places response should have the expected number of hits
      const body = await utils.getResponseBodyFromRequest(request);
      expect(body.hits).toHaveLength(5);

      // Places container should display suggestion dropdown
      const apDropdown = await page.$('.ap-dropdown-menu');
      expect(apDropdown).toBeTruthy();

      // Places suggestion dropdown should have has many suggestions as there are hits
      const suggestions = await page.$$eval('.ap-suggestion', $suggestions => {
        return Array.from($suggestions).map(elt => elt.textContent);
      });

      expect(suggestions).toHaveLength(body.hits.length);

      // Places suggestion dropdown data should match hits
      const allMatching = suggestions.every((domText, i) =>
        utils.matchDomWithHit(domText, body.hits[i])
      );
      expect(allMatching).toBeTruthy();
    });

    it('getVal returns the value of the input', async () => {
      const pendingXHR = new PendingXHR(page);
      await page.focus('#search-box');
      const query = `55 rue d'Amsterd`;
      await page.keyboard.type(query);

      // Places should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length);

      await pendingXHR.waitForAllXhrFinished();

      // Places suggestion dropdown should have has many suggestions as there are hits
      await page.$eval('.ap-suggestion', $suggestion => {
        $suggestion.click();
      });

      const value = await page.evaluate(`window.placesAutocomplete.getVal()`);
      expect(value).toMatch(`55 Rue d'Amsterdam`);
    });

    it('exposes a working configure method', async () => {
      const pendingXHR = new PendingXHR(page);
      // Places instance should have a .configure method
      const configureMethodExists = await page.evaluate(() => {
        return typeof window.placesAutocomplete.configure === 'function';
      });

      expect(configureMethodExists).toBeTruthy();

      // Places instance .configure method should modify the requests
      await page.evaluate(() => {
        window.placesAutocomplete.configure({
          countries: ['us'],
          type: 'city',
        });
      });

      await page.focus('#search-box');
      const query = `Paris`;
      await page.keyboard.type(query);

      // Places should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length);

      await pendingXHR.waitForAllXhrFinished();

      const request = utils.getXHRDataForQuery(pendingXHR, query);
      const params = utils.getParamsFromRequest(request);

      expect(JSON.parse(params.get('countries'))).toEqual(['us']);
      expect(params.get('type')).toEqual('city');
    });

    it('exposes a working search method', async () => {
      // Places instance should have a .search method
      const searchMethodExists = await page.evaluate(() => {
        return typeof window.placesAutocomplete.search === 'function';
      });

      expect(searchMethodExists).toBeTruthy();

      // Places instance .search method should return suggestions
      const response = await page.evaluate(() => {
        return window.placesAutocomplete.search('Paris');
      });

      expect(response).toBeInstanceOf(Array);
      const definedValues = response
        .map(({ value }) => value)
        .filter(value => value !== undefined);
      expect(response.length).toEqual(definedValues.length);
    });

    it('exposes a working reverse method', async () => {
      // Places instance should have a .reverse method
      const reverseMethodExists = await page.evaluate(() => {
        return typeof window.placesAutocomplete.reverse === 'function';
      });

      expect(reverseMethodExists).toBeTruthy();

      // Places instance .reverse method should return suggestions
      const response = await page.evaluate(() => {
        return window.placesAutocomplete.reverse('48.880338,2.326611');
      });

      expect(response).toBeInstanceOf(Array);
      const definedValues = response
        .map(({ value }) => value)
        .filter(value => value !== undefined);
      expect(response.length).toEqual(definedValues.length);
    });
  });

  describe('cdn place.js minified', () => {
    let url;
    let browser;
    let page;

    beforeAll(() => {
      url = `file://${path.join(__dirname, 'cdn-main-min', 'index.html')}`;
    });

    beforeEach(async () => {
      browser = await puppeteer.launch({
        headless: true,
      });
      page = await browser.newPage();
      await page.goto(url);

      await page.setExtraHTTPHeaders({
        referer: 'https://community.algolia.com/',
      });

      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    afterEach(async () => {
      await browser.close();
    });

    it('puppeteer can access demo file', () => {
      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    it('can search from search box', async () => {
      const pendingXHR = new PendingXHR(page);
      await page.focus('#search-box');
      const query = `55 rue d'Amsterd`;
      await page.keyboard.type(query);

      // Places should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length);

      await pendingXHR.waitForAllXhrFinished();

      const request = utils.getXHRDataForQuery(pendingXHR, query);

      // Places response should have the expected number of hits
      const body = await utils.getResponseBodyFromRequest(request);
      expect(body.hits).toHaveLength(5);

      // Places container should display suggestion dropdown
      const apDropdown = await page.$('.ap-dropdown-menu');
      expect(apDropdown).toBeTruthy();

      // Places suggestion dropdown should have has many suggestions as there are hits
      const suggestions = await page.$$eval('.ap-suggestion', $suggestions => {
        return Array.from($suggestions).map(elt => elt.textContent);
      });

      expect(suggestions).toHaveLength(body.hits.length);

      // Places suggestion dropdown data should match hits
      const allMatching = suggestions.every((domText, i) =>
        utils.matchDomWithHit(domText, body.hits[i])
      );
      expect(allMatching).toBeTruthy();
    });

    it('getVal returns the value of the input', async () => {
      const pendingXHR = new PendingXHR(page);
      await page.focus('#search-box');
      const query = `55 rue d'Amsterd`;
      await page.keyboard.type(query);

      // Places should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length);

      await pendingXHR.waitForAllXhrFinished();

      // Places suggestion dropdown should have has many suggestions as there are hits
      await page.$eval('.ap-suggestion', $suggestion => {
        $suggestion.click();
      });

      const value = await page.evaluate(`window.placesAutocomplete.getVal()`);
      expect(value).toMatch(`55 Rue d'Amsterdam`);
    });

    it('exposes a working configure method', async () => {
      const pendingXHR = new PendingXHR(page);
      // Places instance should have a .configure method
      const configureMethodExists = await page.evaluate(() => {
        return typeof window.placesAutocomplete.configure === 'function';
      });

      expect(configureMethodExists).toBeTruthy();

      // Places instance .configure method should modify the requests
      await page.evaluate(() => {
        window.placesAutocomplete.configure({
          countries: ['us'],
          type: 'city',
        });
      });

      await page.focus('#search-box');
      const query = `Paris`;
      await page.keyboard.type(query);

      // Places should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length);

      await pendingXHR.waitForAllXhrFinished();

      const request = utils.getXHRDataForQuery(pendingXHR, query);
      const params = utils.getParamsFromRequest(request);

      expect(JSON.parse(params.get('countries'))).toEqual(['us']);
      expect(params.get('type')).toEqual('city');
    });

    it('exposes a working search method', async () => {
      // Places instance should have a .search method
      const searchMethodExists = await page.evaluate(() => {
        return typeof window.placesAutocomplete.search === 'function';
      });

      expect(searchMethodExists).toBeTruthy();

      // Places instance .search method should return suggestions
      const response = await page.evaluate(() => {
        return window.placesAutocomplete.search('Paris');
      });

      expect(response).toBeInstanceOf(Array);
      const definedValues = response
        .map(({ value }) => value)
        .filter(value => value !== undefined);
      expect(response.length).toEqual(definedValues.length);
    });

    it('exposes a working reverse method', async () => {
      // Places instance should have a .reverse method
      const reverseMethodExists = await page.evaluate(() => {
        return typeof window.placesAutocomplete.reverse === 'function';
      });

      expect(reverseMethodExists).toBeTruthy();

      // Places instance .reverse method should return suggestions
      const response = await page.evaluate(() => {
        return window.placesAutocomplete.reverse('48.880338,2.326611');
      });

      expect(response).toBeInstanceOf(Array);
      const definedValues = response
        .map(({ value }) => value)
        .filter(value => value !== undefined);
      expect(response.length).toEqual(definedValues.length);
    });
  });

  describe('cdn autocomplete non-minified', () => {
    let url;
    let browser;
    let page;

    beforeAll(() => {
      url = `file://${path.join(__dirname, 'cdn-autocomplete', 'index.html')}`;
    });

    beforeEach(async () => {
      browser = await puppeteer.launch({
        headless: true,
      });
      page = await browser.newPage();
      await page.goto(url);

      await page.setExtraHTTPHeaders({
        referer: 'https://community.algolia.com/',
      });

      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    afterEach(async () => {
      await browser.close();
    });

    it('puppeteer can access demo file', () => {
      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    it('can search from search box', async () => {
      const pendingXHR = new PendingXHR(page);
      await page.focus('#search-box');
      const query = `London`;
      await page.keyboard.type(query);

      // autocomplete should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length * 2);
      await pendingXHR.waitForAllXhrFinished();

      const request = utils.getXHRDataForQuery(pendingXHR, query);

      // Places response should have the expected number of hits
      const body = await utils.getResponseBodyFromRequest(request);
      expect(body.hits).toHaveLength(3);

      // autocomplete container should display suggestion dropdown
      const apDropdown = await page.$('.ap-dropdown-menu');
      expect(apDropdown).toBeTruthy();

      // Places suggestion dropdown should have has many suggestions as there are hits
      const suggestions = await page.$$eval(
        '.ap-dataset-places .ap-suggestion',
        $suggestions => {
          return Array.from($suggestions).map(elt => elt.textContent);
        }
      );

      expect(suggestions).toHaveLength(body.hits.length);

      // Places suggestion dropdown data should match hits
      const allMatching = suggestions.every((domText, i) =>
        domText.match(body.hits[i].locale_names[0])
      );
      expect(allMatching).toBeTruthy();
    });
  });

  describe('cdn autocomplete minified', () => {
    let url;
    let browser;
    let page;

    beforeAll(() => {
      url = `file://${path.join(
        __dirname,
        'cdn-autocomplete-min',
        'index.html'
      )}`;
    });

    beforeEach(async () => {
      browser = await puppeteer.launch({
        headless: true,
      });
      page = await browser.newPage();
      await page.goto(url);

      await page.setExtraHTTPHeaders({
        referer: 'https://community.algolia.com/',
      });

      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    afterEach(async () => {
      await browser.close();
    });

    it('puppeteer can access demo file', () => {
      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    it('can search from search box', async () => {
      const pendingXHR = new PendingXHR(page);
      await page.focus('#search-box');
      const query = `London`;
      await page.keyboard.type(query);

      // autocomplete should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length * 2);
      await pendingXHR.waitForAllXhrFinished();

      const request = utils.getXHRDataForQuery(pendingXHR, query);

      // Places response should have the expected number of hits
      const body = await utils.getResponseBodyFromRequest(request);
      expect(body.hits).toHaveLength(3);

      // autocomplete container should display suggestion dropdown
      const apDropdown = await page.$('.ap-dropdown-menu');
      expect(apDropdown).toBeTruthy();

      // Places suggestion dropdown should have has many suggestions as there are hits
      const suggestions = await page.$$eval(
        '.ap-dataset-places .ap-suggestion',
        $suggestions => {
          return Array.from($suggestions).map(elt => elt.textContent);
        }
      );

      expect(suggestions).toHaveLength(body.hits.length);

      // Places suggestion dropdown data should match hits
      const allMatching = suggestions.every((domText, i) =>
        domText.match(body.hits[i].locale_names[0])
      );
      expect(allMatching).toBeTruthy();
    });
  });

  describe('cdn widget non-minified', () => {
    let url;
    let browser;
    let page;

    beforeAll(() => {
      url = `file://${path.join(__dirname, 'cdn-widget', 'index.html')}`;
    });

    beforeEach(async () => {
      browser = await puppeteer.launch({
        headless: true,
      });
      page = await browser.newPage();
      await page.goto(url);

      await page.setExtraHTTPHeaders({
        referer: 'https://community.algolia.com/',
      });

      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    afterEach(async () => {
      await browser.close();
    });

    it('puppeteer can access demo file', () => {
      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    it('using places search box updates aroundLatLng in InstantSearch', async () => {
      const pendingXHR = new PendingXHR(page);

      expect(pendingXHR.pendingXhrCount()).toEqual(0);
      await pendingXHR.waitForAllXhrFinished();

      await page.focus('#search-box');
      const query = `55 rue d'Amsterd`;
      await page.keyboard.type(query);

      // autocomplete should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length);
      await pendingXHR.waitForAllXhrFinished();

      const request = utils.getXHRDataForQuery(pendingXHR, query);

      const body = await utils.getResponseBodyFromRequest(request);
      const geoloc = body.hits[0]._geoloc;

      const aroundLatLngQueriesBeforeSelect = Array.from(
        pendingXHR.finishedWithSuccessXhrs
      )
        .filter($request => $request._url.match(/queries/)) // generic algolia query
        .filter($request => {
          const { _postData } = $request;
          const $body = JSON.parse(_postData);
          const params = new URLSearchParams($body.requests[0].params);
          return params.get('aroundLatLng') === `${geoloc.lat},${geoloc.lng}`;
        });

      // we shouldn't have done any aroundLatLng query yet
      expect(aroundLatLngQueriesBeforeSelect).toHaveLength(0);

      // selecting a result should trigger a query
      await page.keyboard.press('Enter');

      expect(pendingXHR.pendingXhrCount()).toEqual(1);
      await pendingXHR.waitForAllXhrFinished();

      const aroundLatLngQueriesAfterSelect = Array.from(
        pendingXHR.finishedWithSuccessXhrs
      )
        .filter($request => $request._url.match(/queries/)) // generic algolia query
        .filter($request => {
          const { _postData } = $request;
          const $body = JSON.parse(_postData);
          const params = new URLSearchParams($body.requests[0].params);
          return params.get('aroundLatLng') === `${geoloc.lat},${geoloc.lng}`;
        });

      expect(aroundLatLngQueriesAfterSelect).toHaveLength(1);
    });
  });

  describe('cdn widget minified', () => {
    let url;
    let browser;
    let page;

    beforeAll(() => {
      url = `file://${path.join(__dirname, 'cdn-widget-min', 'index.html')}`;
    });

    beforeEach(async () => {
      browser = await puppeteer.launch({
        headless: true,
      });
      page = await browser.newPage();
      await page.goto(url);

      await page.setExtraHTTPHeaders({
        referer: 'https://community.algolia.com/',
      });

      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    afterEach(async () => {
      await browser.close();
    });

    it('puppeteer can access demo file', () => {
      page.on('error', err => {
        throw new Error(err);
      });

      page.on('pageerror', pageerr => {
        throw new Error(pageerr);
      });
    });

    it('using places search box updates aroundLatLng in InstantSearch', async () => {
      const pendingXHR = new PendingXHR(page);

      expect(pendingXHR.pendingXhrCount()).toEqual(0);
      await pendingXHR.waitForAllXhrFinished();

      await page.focus('#search-box');
      const query = `55 rue d'Amsterd`;
      await page.keyboard.type(query);

      // autocomplete should send a query per character typed
      expect(pendingXHR.pendingXhrCount()).toEqual(query.length);
      await pendingXHR.waitForAllXhrFinished();

      const request = utils.getXHRDataForQuery(pendingXHR, query);

      const body = await utils.getResponseBodyFromRequest(request);
      const geoloc = body.hits[0]._geoloc;

      const aroundLatLngQueriesBeforeSelect = Array.from(
        pendingXHR.finishedWithSuccessXhrs
      )
        .filter($request => $request._url.match(/queries/)) // generic algolia query
        .filter($request => {
          const { _postData } = $request;
          const $body = JSON.parse(_postData);
          const params = new URLSearchParams($body.requests[0].params);
          return params.get('aroundLatLng') === `${geoloc.lat},${geoloc.lng}`;
        });

      // we shouldn't have done any aroundLatLng query yet
      expect(aroundLatLngQueriesBeforeSelect).toHaveLength(0);

      // selecting a result should trigger a query
      await page.keyboard.press('Enter');

      expect(pendingXHR.pendingXhrCount()).toEqual(1);
      await pendingXHR.waitForAllXhrFinished();

      const aroundLatLngQueriesAfterSelect = Array.from(
        pendingXHR.finishedWithSuccessXhrs
      )
        .filter($request => $request._url.match(/queries/)) // generic algolia query
        .filter($request => {
          const { _postData } = $request;
          const $body = JSON.parse(_postData);
          const params = new URLSearchParams($body.requests[0].params);
          return params.get('aroundLatLng') === `${geoloc.lat},${geoloc.lng}`;
        });

      expect(aroundLatLngQueriesAfterSelect).toHaveLength(1);
    });
  });
});
