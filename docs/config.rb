# https://github.com/middleman/middleman/issues/1857#issuecomment-200930893
# the source directory of webpack should exists before starting
require 'fileutils'
FileUtils.mkdir_p('.webpack')
FileUtils.rm_rf(Dir.glob('.webpack/*'))

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

# With alternative layout
# page "/path/to/file.html", layout: :otherlayout

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

# General configuration

# Reload the browser automatically whenever files change
configure :development do
  activate :gzip
  activate :livereload
  activate :external_pipeline,
    name: :places,
    command: 'npm run js:watch -- --output-path docs/.webpack/js',
    source: '.webpack'
end

set :js_dir, 'js'
ignore '/javascripts/*'

activate :external_pipeline,
  name: :all,
  command: "npm run docs:js:#{build? ? :build : :watch}",
  source: '.webpack'

###
# Helpers
###

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end
#

# Build-specific configuration
configure :build do
  # this may trigger bad behavior, if so, see
  # https://github.com/middleman/middleman-minify-html
  activate :minify_html
  activate :minify_css
  activate :minify_javascript
  activate :asset_hash
  # website is hosted on a subpath /places.js so we use relative links
  # and assets
  activate :relative_assets
  set :relative_links, true
end

activate :deploy do |deploy|
  deploy.build_before = true
  deploy.deploy_method = :git
  deploy.remote   = "https://#{ENV['GH_TOKEN']}@github.com/algolia/places.git"
end
