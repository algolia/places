npm install &&
cd docs &&
rm -rf .webpack/ &&
npm run js:build -- --output-path docs/.webpack/javascripts && # build once before start, see https://github.com/middleman/middleman/issues/1857
bundle install &&
bundle exec middleman
