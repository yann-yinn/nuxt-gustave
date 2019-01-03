const { runImporters } = require('./lib/helpers')

module.exports = function Gustave() {
  this.nuxt.hook('build:before', () => {
    const routes = runImporters()
    this.options.generate.routes = [...routes, ...this.options.generate.routes]
  })
}

module.exports.meta = require('./package.json')
