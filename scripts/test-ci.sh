#!/usr/bin/env bash

set -ev # exit when error

# try to build the library
NODE_ENV=production npm run build

# launch tests
npm test

# try to build the website
cd docs
bundle install
bundle exec middleman build
cd ..

# check commit message format
./scripts/validate-commit-msgs.sh

# TODO: configure travis push
# if [ "$TRAVIS_PULL_REQUEST" == 'false' ] && [ "$TRAVIS_BRANCH" == 'master' ]; then
  # ./scripts/finish-release.sh
# fi
