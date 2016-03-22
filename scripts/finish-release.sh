#! /usr/bin/env bash
[ -z $CI ] && CI='false'

if [ $CI != 'true' ]; then
  printf "finish-release: Only doable on CI\n"
  exit 1
fi

set -ev # exit when error

VERSION=`cat package.json | json version`
JSDELIVER_URL="http://cdn.jsdelivr.net/places.js/$VERSION/places.min.js"

while true; do
  STATUS=$(curl -L -I $JSDELIVER_URL 2>/dev/null | head -n 1 | cut -d$' ' -f2);
  if [ $STATUS == '200' ]; then
    printf "$VERSION is now available on jsDelivr\n"
    break;
  else
    printf "$VERSION is not yet published on jsDelivr, retrying in 30s (status was $STATUS)\n"
  fi
  sleep 30
done

curl --silent -L $CACHE_URL > /dev/null
./scripts/docs/update-website.sh
