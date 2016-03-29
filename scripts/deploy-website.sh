#! /usr/bin/env bash

set -e # exit when error

printf "\nDeploying website website to gh-pages\n"

: ${GH_TOKEN?"You need a GH_TOKEN environment variable to deploy"}

VERSION=`json version < package.json`

cd docs
bundle install
VERSION=${VERSION} NODE_ENV=production bundle exec middleman deploy &>/dev/null # hide output, we do not want github tokens to leak in stdout
if [ $? -eq 1 ]
then
  echo "\nCould not update the website\n"
  exit 1
fi
