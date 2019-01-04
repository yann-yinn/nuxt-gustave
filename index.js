const { runImporters } = require('./lib/helpers')

module.exports = function Gustave() {
  let isGenerating = false
  this.nuxt.hook('generate:before', () => {
    isGenerating = true
    const routes = runImporters()
    this.options.generate.routes = [...routes, ...this.options.generate.routes]
  })

  // make sure static JSON files exists before components call them
  this.nuxt.hook('build:before', () => {
    if (!isGenerating) {
      runImporters()
    }
  })
}

module.exports.meta = require('./package.json')
