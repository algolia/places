#!/usr/bin/env bash

set -e # exit when error

printf "\nClear CDN cache\n"

VERSION=`json version < package.json`
CDN_URL="http://cdn.jsdelivr.net/places.js/$VERSION/places.min.js"

while true; do
  STATUS=$(curl -L -I $CDN_URL 2>/dev/null | head -n 1 | cut -d$' ' -f2);
  if [ $STATUS == '200' ]; then
    printf "%s is now available on CDN\n" "$VERSION"
    break;
  else
    printf "%s is not yet published on CDN, retrying in 30s (status was $STATUS)\n" "$VERSION"
  fi
  sleep 30
done

curl --silent -L $CACHE_URL > /dev/null
