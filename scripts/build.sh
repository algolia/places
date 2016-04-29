#!/usr/bin/env bash

set -e # exit when error, no verbose

printf "\nBuilding places.js library\n"

NAME='places'
LICENSE="/*! ${NAME} ${VERSION:-UNRELEASED} | © Algolia | github.com/algolia/places */"
DIST_DIR="dist/cdn"
DIST_FILE="$DIST_DIR/${NAME}.js"
DIST_FILE_MIN="$DIST_DIR/${NAME}.min.js"
DIST_FILE_SOURCEMAP="$DIST_DIR/${NAME}.js.map"
DIST_FILE_SOURCEMAP_MIN="$DIST_DIR/${NAME}.min.js.map"

mkdir -p "$DIST_DIR"

rm -rf "${DIST_DIR:?}"/*

# places.js as one ES5 file + minified version and source maps
webpack
echo "$LICENSE" | cat - "${DIST_FILE}" > /tmp/out && mv /tmp/out "${DIST_FILE}"

uglifyjs "${DIST_FILE}" \
  --in-source-map "${DIST_FILE_SOURCEMAP}" \
  --source-map "${DIST_FILE_SOURCEMAP_MIN}" \
  --preamble "$LICENSE" \
  -c warnings=false \
  -m \
  -o "${DIST_FILE_MIN}"

gzip_size=$(gzip -9 < $DIST_FILE_MIN | wc -c | pretty-bytes)
echo "=> $DIST_FILE_MIN gzipped will weight $gzip_size"
