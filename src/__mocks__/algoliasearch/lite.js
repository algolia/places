/* eslint-env jest */

const defaultSearchStub = jest.fn(() => Promise.resolve());
let searchStub = defaultSearchStub;
const addAlgoliaAgent = jest.fn();
const search = jest.fn((...args) => searchStub(...args));

const algoliasearch = {
  initPlaces: jest.fn(() => {
    return {
      as: {
        addAlgoliaAgent
      },
      search
    };
  })
};

algoliasearch.__searchSpy = search;
algoliasearch.__addAlgoliaAgentSpy = addAlgoliaAgent;
algoliasearch.__setSearchStub = fn => searchStub = fn;
algoliasearch.__clearSearchStub = () => searchStub = defaultSearchStub;

export default algoliasearch;
