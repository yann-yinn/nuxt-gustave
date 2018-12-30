const { runImporters } = require('./lib/helpers')

module.exports = function Gustave() {
  this.nuxt.hook('build:before', (nuxt, buildOptions) => {
    const routes = runGustave()
    this.options.generate.routes = [...routes, ...this.options.generate.routes]
  })
}

function runGustave(nuxtConfig) {
  console.log('ℹ Launching gustave importers ')
  const routes = runImporters()
  console.log('✔ gustave importers run successfully')
  return routes
}

module.exports.meta = require('./package.json')
