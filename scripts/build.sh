#!/usr/bin/env bash

set -e # exit when error, no verbose

printf "\nBuilding places.js library\n"

BUNDLES=( 'places' 'placesAutocompleteDataset' )
LICENSE="/*! ${NAME} ${VERSION:-UNRELEASED} | © Algolia | github.com/algolia/places */"
DIST_DIR="dist/cdn"

mkdir -p "$DIST_DIR"
rm -rf "${DIST_DIR:?}"/*
webpack

for bundle in "${BUNDLES[@]}"
do
  dist_file="$DIST_DIR/${bundle}.js"
  dist_file_min="$DIST_DIR/${bundle}.min.js"
  dist_file_sourcemap="$DIST_DIR/${bundle}.js.map"
  dist_file_sourcemap_min="$DIST_DIR/${bundle}.min.js.map"

  echo "$LICENSE" | cat - "${dist_file}" > /tmp/out && mv /tmp/out "${dist_file}"

  uglifyjs "${dist_file}" \
    --in-source-map "${dist_file_sourcemap}" \
    --source-map "${dist_file_sourcemap_min}" \
    --preamble "$LICENSE" \
    -c warnings=false \
    -m \
    -o "${dist_file_min}"

  gzip_size=$(gzip -9 < $dist_file_min | wc -c | pretty-bytes)
  echo "=> $dist_file_min gzipped will weight $gzip_size"
done
