#!/usr/bin/env bash

set -e # exit when error, no verbose

printf "\nBuilding places.js library\n"

bundles=( 'places' 'placesAutocompleteDataset' 'placesInstantsearchWidget' )
license="/*! ${NAME} ${VERSION:-UNRELEASED} | © Algolia | github.com/algolia/places */"
dist_dir="dist"
dist_dir_cdn="dist/cdn"

# clean
mkdir -p "$dist_dir_cdn"
rm -rf "${dist_dir:?}"/*

# CDN build
webpack

for bundle in "${bundles[@]}"
do
  dist_file="$dist_dir_cdn/${bundle}.js"
  dist_file_min="$dist_dir_cdn/${bundle}.min.js"
  dist_file_sourcemap="$dist_dir_cdn/${bundle}.js.map"
  dist_file_sourcemap_min="$dist_dir_cdn/${bundle}.min.js.map"

  echo "$license" | cat - "${dist_file}" > /tmp/out && mv /tmp/out "${dist_file}"

  uglifyjs "${dist_file}" \
    --in-source-map "${dist_file_sourcemap}" \
    --source-map "${dist_file_sourcemap_min}" \
    --preamble "$license" \
    -c warnings=false \
    -m \
    -o "${dist_file_min}"

  gzip_size=$(gzip -9 < "$dist_file_min" | wc -c | pretty-bytes)
  echo "=> $dist_file_min gzipped will weight $gzip_size"
done

# NPM build
# We are gonna resolve webpack loaders and transpile every file into ES5
# The goal is for the user to be able to require/import places without
# having to import a complete build (dist/cdn), to avoid duplication of dependencies
BABEL_DISABLE_CACHE=1 BABEL_ENV=npm babel -q index.js -o "$dist_dir/index.js"
BABEL_DISABLE_CACHE=1 BABEL_ENV=npm babel -q autocompleteDataset.js -o "$dist_dir/autocompleteDataset.js"
BABEL_DISABLE_CACHE=1 BABEL_ENV=npm babel -q instantsearchWidget.js -o "$dist_dir/instantsearchWidget.js"
BABEL_DISABLE_CACHE=1 BABEL_ENV=npm babel -q src/ --out-dir "$dist_dir/src/" --ignore test.js
