#!/usr/bin/env bash

set -e # exit when error

printf "\nBuilding website\n"

VERSION=`json version < package.json`

mkdir -p docs/source/partials/status/
cp DATA_REFRESH.md docs/source/partials/status/DATA_REFRESH.md.erb
cat CHANGELOG.md | awk 'BEGIN { counter=0 } /^# / {counter++} NR > 1 { print prev } { prev = $0 } counter==5 {exit}' | sed -E 's/^### /##### /' | sed -E 's/^# /### /' | sed -E 's/^<a.*//' >  docs/source/partials/status/CHANGELOG.md.erb
cat PIPELINE_CHANGELOG.md | awk 'BEGIN { counter=0 } /^### / {counter++} NR > 1 { print prev } { prev = $0 } counter==5 {exit}' | sed -E 's/^#### /##### /' | sed -E 's/^<a.*//' >  docs/source/partials/status/PIPELINE_CHANGELOG.md.erb

cd docs
VERSION=${VERSION} NODE_ENV=production bundle exec middleman build
cd ..
