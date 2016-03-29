#!/usr/bin/env bash

set -e # exit when error

printf "\nLaunching dev environment\n"

npm install &&
cd docs &&
bundle install &&
bundle exec middleman
