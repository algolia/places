#!/usr/bin/env bash

set -e # exit when error

printf "\nTesting\n"

# try to build the library
NODE_ENV=production npm run build

# run tests
npm test

# try to build the libray
npm run build

# try to build the website
./scripts/build-website.sh

# Finish release (clear CDN cache, deploy website) when building on master
if [ "$TRAVIS_PULL_REQUEST" == 'false' ] && [ "$TRAVIS_BRANCH" == 'master' ]; then
  ./scripts/finish-release.sh
fi
