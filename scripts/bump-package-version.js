/* eslint no-console:0 max-len:0 */
import fs from 'fs';
import path from 'path';

import replace from 'replace-in-file';
import semver from 'semver';
import currentVersion from '../src/version';

if (!process.env.VERSION) {
  throw new Error(
    'bump: Usage is VERSION=MAJOR.MINOR.PATCH scripts/bump-package-version.js'
  );
}
const newVersion = process.env.VERSION;

if (!semver.valid(newVersion)) {
  throw new Error(
    `bump: Provided new version ${newVersion} is not a valid version per semver`
  );
}

if (semver.gte(currentVersion, newVersion)) {
  throw new Error(
    `bump: Provided new version is not higher than current version (${newVersion} <= ${currentVersion})`
  );
}

console.log(`Bumping ${newVersion}`);

console.log('..Updating src/version.js');

const versionFile = path.join(__dirname, '../src/version.js');
const newContent = `export default '${newVersion}';\n`;
fs.writeFileSync(versionFile, newContent);

console.log('..Updating package.json');

replace.sync({
  files: [path.join(__dirname, '..', 'package.json')],
  from: `"version": "${currentVersion}"`,
  to: `"version": "${newVersion}"`,
});

replace.sync({
  files: [path.join(__dirname, '..', 'README.md')],
  from: `places.js@${currentVersion}`,
  to: `places.js@${newVersion}`,
});
