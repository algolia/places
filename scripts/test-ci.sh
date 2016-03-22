#!/usr/bin/env bash

set -ev # exit when error

./scripts/validate-pr-done-on-develop.sh
npm run test:coverage
npm prune
npm run shrinkwrap --dev
NODE_ENV=production npm run build
./scripts/validate-commit-msgs.sh

echo "Here should go the website building test"
exit 1

if [ "$TRAVIS_PULL_REQUEST" == 'false' ] && [ "$TRAVIS_BRANCH" == 'master' ]; then
  ./scripts/finish-release.sh
fi
