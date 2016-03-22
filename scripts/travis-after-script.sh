#!/usr/bin/env bash
# Will push coverage info to coveralls. Should be ran from Travis, in the
# `after_script` section

$(npm bin)/coveralls < ./coverage/lcov.info
