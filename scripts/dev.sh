#!/usr/bin/env bash

set -e # exit when error

printf "\nLaunching dev environment\n"

VERSION=$(json version < package.json)"-DEV"

npm install &&
cd docs &&
bundle install &&
VERSION=$VERSION bundle exec middleman
