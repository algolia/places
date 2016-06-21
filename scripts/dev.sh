#!/usr/bin/env bash

set -e # exit when error

printf "\nLaunching dev environment\n"

npm install

VERSION=$(json version < package.json)"-DEV"

cd docs &&
bundle install &&
NODE_ENV=development VERSION=$VERSION bundle exec middleman
