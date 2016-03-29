#! /usr/bin/env bash

set -e # exit when error

printf "\nFinishing release\n"

./scripts/clear-cdn-cache.sh
./scripts/deploy-website.sh
