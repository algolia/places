#!/usr/bin/env bash

set -e # exit when error

printf "\nLaunching dev environment\n"

yarn

VERSION=$(json version < package.json)"-DEV"

mkdir -p docs/source/partials/status/
cp DATA_REFRESH.md docs/source/partials/status/DATA_REFRESH.md.erb
cat CHANGELOG.md | awk 'BEGIN { counter=0 } /^# / {counter++} NR > 1 { print prev } { prev = $0 } counter==5 {exit}' | sed -E 's/^### /##### /' | sed -E 's/^# /### /' | sed -E 's/^<a.*//' >  docs/source/partials/status/CHANGELOG.md.erb
cat PIPELINE_CHANGELOG.md | awk 'BEGIN { counter=0 } /^### / {counter++} NR > 1 { print prev } { prev = $0 } counter==5 {exit}' | sed -E 's/^#### /##### /' | sed -E 's/^<a.*//' >  docs/source/partials/status/PIPELINE_CHANGELOG.md.erb

cd docs &&
bundle install &&
NODE_ENV=development VERSION=$VERSION bundle exec middleman
