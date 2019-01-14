#!/usr/bin/env bash

set -e # exit when error

printf "\nLaunching dev environment\n"

yarn

VERSION=$(json version < package.json)"-DEV"

mkdir -p docs/source/partials/status/

# ensure DATA_REFRESH.md exists
touch DATA_REFRESH.md
cp DATA_REFRESH.md docs/source/partials/status/DATA_REFRESH.md.erb

# ensure CHANGELOG.md exists
touch CHANGELOG.md
# cuts after the first 5 minor releases
# changes the <h3> into <h5> and <h1> into <h3>
# so that the produced markdown is well formatted for display
# and remove line starting with a link (not useful for display)
cat CHANGELOG.md | \
  awk 'BEGIN { counter=0 } /^# / {counter++} NR > 1 { print prev } { prev = $0 } counter==5 {exit}' | \
  sed -E 's/^### /##### /' | \
  sed -E 's/^# /### /' | \
  sed -E 's/^<a.*//' \
  >  docs/source/partials/status/CHANGELOG.md.erb

# ensure PIPELINE_CHANGELOG.md exists
touch PIPELINE_CHANGELOG.md
# cuts after the first 5 minor releases
# changes the <h4> into <h5>
# so that the produced markdown is well formatted for display
# and remove line starting with a link (not useful for display)
cat PIPELINE_CHANGELOG.md | \
  awk 'BEGIN { counter=0 } /^### / {counter++} NR > 1 { print prev } { prev = $0 } counter==5 {exit}' | \
  sed -E 's/^#### /##### /' | \
  sed -E 's/^<a.*//' \
  >  docs/source/partials/status/PIPELINE_CHANGELOG.md.erb

cd docs &&
bundle install &&
NODE_ENV=development VERSION=$VERSION bundle exec middleman
