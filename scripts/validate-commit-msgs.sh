#!/usr/bin/env bash

set -e # exit when error

[ -z $TRAVIS_PULL_REQUEST ] && TRAVIS_PULL_REQUEST="false"

if [ $TRAVIS_PULL_REQUEST == "false" ]; then
  echo "No need to validate commit message when not in a pull request"
  exit 0
fi

# Checks the commits msgs in the range of commits travis is testing.
# Based heavily on
# https://raw.githubusercontent.com/angular/angular.js/291d7c467fba51a9cb89cbeee62202d51fe64b09/validate-commit-msg.js

# Travis's docs are misleading.
# Check for either a commit or a range (which apparently isn't always a range) and fix as needed.
if [ "$#" -gt 0 ]; then
  RANGE=$1
elif [ "$TRAVIS_COMMIT_RANGE" != "" ]; then
  RANGE=$TRAVIS_COMMIT_RANGE
elif [ "$TRAVIS_COMMIT" != "" ]; then
  RANGE=$TRAVIS_COMMIT
fi

if [ "$RANGE" == "" ]; then
  # locally
  RANGE="origin/develop..HEAD"
elif [[ "$RANGE" == *...* ]]; then
  # Travis sends the ranges with 3 dots. Git only wants 2.
  RANGE=`echo $TRAVIS_COMMIT_RANGE | sed 's/\.\.\./../'`
elif [[ "$RANGE" != *..* ]]; then
  RANGE="$RANGE~..$RANGE"
fi

EXIT=0
for sha in `git log --format=oneline "$RANGE" | cut '-d ' -f1`; do
  echo -n "Checking commit message for $sha... "

  FIRST_LINE=`git log --format=%B -n 1 $sha | head -1`
  MSG_LENGTH=`echo "$FIRST_LINE" | wc -c`
  if [ $MSG_LENGTH -gt 100 ]; then
    echo "KO (too long): $FIRST_LINE"
    EXIT=2
  elif echo $FIRST_LINE | grep -qE '^Merge (pull request|branch)'; then
    echo "OK (merge)"
  elif echo $FIRST_LINE | grep -qE '^(feat|fix|docs?|style|refactor|perf|tests?|chore|revert)\(.+\): .*'; then
    echo "OK"
  else
    echo "KO (format): $FIRST_LINE"
    EXIT=1
  fi
done

exit $EXIT
