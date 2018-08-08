#!/usr/bin/env bash

set -e # exit when error

printf "\nReleasing\n"

if [ "$(node -v)" != "v$(cat .nvmrc)" ]
  then
  printf "Release: Node version mismatch with .nvmrc (should be $(cat .nvmrc))\n"
  exit 1
fi

if ! npm owner ls | grep -q "$(npm whoami)"
then
  printf "Release: Not an owner of the npm repo, ask a contributor for access\n"
  exit 1
fi

currentBranch=`git rev-parse --abbrev-ref HEAD`
if [ $currentBranch != 'master' ]; then
  printf "Release: You must be on master\n"
  exit 1
fi

if [[ -n $(git status --porcelain) ]]; then
  printf "Release: Working tree is not clean (git status)\n"
  exit 1
fi

printf "\n\nRelease: update working tree"
git pull origin master
git fetch origin --tags

printf "Release: install dependencies"
yarn

currentVersion=`cat package.json | json version`

# header
printf "\n\nRelease: current version is %s" $currentVersion
printf "\nRelease: a changelog will be generated only if a fix/feat/performance/breaking token is found in git log"
printf "\nRelease: you must choose a new ve.rs.ion (semver)"
printf "\nRelease: press q to exit the next screen\n\n"

# preview changelog
read -p "=> Release: press [ENTER] to view changes since latest version.."

conventional-changelog --preset angular --output-unreleased | less

# choose and bump new version
# printf "\n\nRelease: Please enter the new chosen version > "
printf "\n=> Release: please type the new chosen version > "
read -e newVersion
VERSION=$newVersion babel-node ./scripts/bump-package-version.js

# build new version
NODE_ENV=production VERSION=$newVersion npm run build

# update changelog
printf "\n\nRelease: update changelog"
conventional-changelog --preset angular --infile CHANGELOG.md --same-file

# regenerate readme TOC
printf "\n\nRelease: generate TOCS"
npm run doctoc

# git add and tag
commitMessage="release v$newVersion

See https://github.com/algolia/places/blob/master/CHANGELOG.md"

printf "Release: update lock file"
yarn

git add src/version.js package.json CHANGELOG.md README.md CONTRIBUTING.md yarn.lock
printf %s "$commitMessage" | git commit --file -
git tag "v$newVersion"

printf "\n\nRelease: almost done, check everything in another terminal tab.\n"
read -p "=> Release: when ready, press [ENTER] to push to github and publish the package"

printf "\n\nRelease: push to github, publish on npm\n"
git push origin master
git push origin --tags

# We are gonna publish the package to npm, in a way
# where only the dist cdn and npm are available
cp package.json README.md LICENSE dist/
# jsDelivr original structure for places.js
# cannot be changed easily: https://github.com/jsdelivr/jsdelivr/issues/12282
mkdir dist/dist
mv dist/cdn dist/dist
cd dist
npm publish
mv dist/cdn cdn
rm -rf dist
rm -f package.json README.md LICENSE
cd ..

printf "
Release:
Package was published to npm.
A job on travis-ci will be automatically launched to finalize the release.
"
