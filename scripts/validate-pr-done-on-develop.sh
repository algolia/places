#!/usr/bin/env bash

set -e # exit when error

COMMIT_MSG=$(git log --format=%B --no-merges -n 1)
[[ "$COMMIT_MSG" =~ hotfix ]] && is_hotfix=1 || is_hotfix=0
[[ "$COMMIT_MSG" =~ /^docs/ ]] && is_doc=1 || is_doc=0
[[ "$TRAVIS_PULL_REQUEST" == false ]] && is_pr=0 || is_pr=1
[[ "$TRAVIS_BRANCH" == master ]] && is_master=1 || is_master=0
[[ "$TRAVIS_BRANCH" == develop ]] && is_develop=1 || is_develop=0

if [[ $is_pr == 0 ]]; then
  echo "Success: This is not a pull request"
  exit 0
fi

if [[ $is_master == 1 ]]; then
  if [[ $is_hotfix == 1 ]]; then
    echo "Success: Even if submitted to master, it is a hotfix"
    exit 0
  fi
  if [[ $is_doc == 1 ]]; then
    echo "Success: Even if submitted to master, it is a documentation change"
    exit 0
  fi

  echo "Error: Pull request cannot be done on master"
  exit 1
fi

if [[ $is_develop == 0 ]]; then
  echo "Error: Pull request must be done on develop branch"
  exit 1
fi

exit 0
