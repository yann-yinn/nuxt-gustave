const { runImporters } = require('./lib/helpers')

module.exports = function Gustave() {
  this.nuxt.hook('build:before', () => {
    const routes = runGustave()
    this.options.generate.routes = [...routes, ...this.options.generate.routes]
  })
}

function runGustave() {
  console.log('ℹ Launching gustave importers ')
  const routes = runImporters()
  return routes
}

module.exports.meta = require('./package.json')
