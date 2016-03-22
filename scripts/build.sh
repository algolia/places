#!/usr/bin/env bash

set -e # exit when error

NAME='places'
LICENSE="/*! ${NAME} ${VERSION:-UNRELEASED} | © Algolia | github.com/algolia/places */"
DIST_DIR_CDN="dist/cdn"
DIST_DIR_NPM="dist/npm"
DIST_FILE="$DIST_DIR_CDN/${NAME}.js"
DIST_FILE_MIN="$DIST_DIR_CDN/${NAME}.min.js"
DIST_FILE_SOURCEMAP="$DIST_DIR_CDN/${NAME}.js.map"
DIST_FILE_SOURCEMAP_MIN="$DIST_DIR_CDN/${NAME}.min.js.map"

mkdir -p "$DIST_DIR_CDN" "$DIST_DIR_NPM"

# places.js as one ES5 file + minified version and source maps
webpack --config webpack.config.jsdelivr.babel.js
echo "$LICENSE" | cat - "${DIST_FILE}" > /tmp/out && mv /tmp/out "${DIST_FILE}"

uglifyjs "${DIST_FILE}" \
  --in-source-map "${DIST_FILE_SOURCEMAP}" \
  --source-map "${DIST_FILE_SOURCEMAP_MIN}" \
  --preamble "$LICENSE" \
  -c warnings=false \
  -m \
  -o "${DIST_FILE_MIN}"

# places as several ES5 files, to be `require`d
babel -q index.js -o "$DIST_DIR_NPM/index.js"
declare -a sources=("src")
for source in "${sources[@]}"
do
  babel -q --out-dir "$DIST_DIR_NPM/${source}" ${source}
done

gzip_size=$(gzip -9 < $DIST_FILE_MIN | wc -c | pretty-bytes)
echo "=> $DIST_FILE_MIN gzipped will weight $gzip_size-bytes"
