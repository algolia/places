npm install &&
cd docs &&
rm -rf .webpack/ &&
mkdir -p .webpack/js && # this directory must exists, see https://github.com/middleman/middleman/issues/1857
bundle install &&
bundle exec middleman
