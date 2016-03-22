#!/usr/bin/env bash
# Will run the test and export the coverage information in ./coverage
# This file will then be read by Travis to push it to Coveralls
#
# The command is long and was quite hard to write correctly.
# We need babel-istanbul and not instanbul
# We need the _mocha and not mocha
# We need to use full path for each binaries
# We need to run everything through babel-node

npm_bin="$(npm bin)"
babel_istanbul_bin="${npm_bin}/babel-istanbul"
mocha_bin="${npm_bin}/_mocha"

BABEL_ENV=test \
  babel-node "$babel_istanbul_bin" cover "$mocha_bin" \
  --report lcov -- \
  -R spec --reporter dot \
  ./test/helpers.js ./test/*-test.js
