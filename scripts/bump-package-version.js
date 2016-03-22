/* eslint no-console:0 max-len:0 */
import fs from 'fs';
import path from 'path';

import mversion from 'mversion';

import semver from 'semver';
import currentVersion from '../src/lib/version.js';

if (!process.env.VERSION) {
  throw new Error('bump: Usage is VERSION=MAJOR.MINOR.PATCH scripts/bump-package-version.js');
}
let newVersion = process.env.VERSION;

if (!semver.valid(newVersion)) {
  throw new Error('bump: Provided new version (' + newVersion + ') is not a valid version per semver');
}

if (semver.gte(currentVersion, newVersion)) {
  throw new Error('bump: Provided new version is not higher than current version (' + newVersion + ' <= ' + currentVersion + ')');
}

console.log('Bumping ' + newVersion);

console.log('..Updating src/lib/version.js');

let versionFile = path.join(__dirname, '../src/lib/version.js');
let newContent = "export default '" + newVersion + "';\n";
fs.writeFileSync(versionFile, newContent);

console.log('..Updating package.json, npm-shrinwrap.json');

mversion.update(newVersion);
