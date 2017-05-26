#!/usr/bin/env bash

set -e # exit when error

printf "\nClear CDN cache\n"

VERSION=`json version < package.json`
CDN_URL="https://cdn.jsdelivr.net/npm/places.js@$VERSION"

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

# No more needed to clear the CDN cache because we advise to use specific versions
# curl --silent -L $CACHE_URL > /dev/null
