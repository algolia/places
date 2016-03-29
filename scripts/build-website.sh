#!/usr/bin/env bash

set -e # exit when error

printf "\nBuilding website\n"

VERSION=`json version < package.json`

cd docs
bundle install
VERSION=${VERSION} NODE_ENV=production bundle exec middleman build
cd ..
