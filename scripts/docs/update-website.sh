#! /usr/bin/env bash

set -ev # exit when error

if [ -z $TRAVIS_BRANCH ]; then
  currentBranch=`git rev-parse --abbrev-ref HEAD`
else
  currentBranch=$TRAVIS_BRANCH
fi

if [ $currentBranch != 'master' ]; then
  printf "update-website: You must be on master"
  exit 1
fi

VERSION=`cat package.json | json version`

set -e # exit when error

printf "\nPublish website to gh-pages\n"

cd docs
bundle install
rm -rf _site
JEKYLL_ENV=production VERSION=${VERSION} bundle exec jekyll build
for example in _site/examples/*; do
  if [ -d "$example" ]; then
    name=`basename "$example"`
    (cd "$example" && zip -r ../$name.zip *)
  fi
done
cd ..
babel-node scripts/docs/gh-pages.js
