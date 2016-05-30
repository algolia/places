import value from './formatInputValue.js';
import suggestion from './formatDropdownValue.js';
import algoliaLogo from './icons/algolia.svg';
import osmLogo from './icons/osm.svg';

export default {
  footer: `<div class="ap-footer">
  Built by <a href="https://www.algolia.com/?utm_source=places&utm_medium=link&utm_term=footer&utm_campaign=${location.hostname}" title="Search by Algolia" class="ap-footer-algolia">${algoliaLogo.trim()}</a>
  using <a href="https://community.algolia.com/places/documentation.html#license" class="ap-footer-osm" title="Algolia Places data © OpenStreetMap contributors">${osmLogo.trim()} <span>data</span></a>
  </div>`,
  value,
  suggestion
};
