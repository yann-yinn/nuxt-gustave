const { runImporters, getGustaveConfig } = require('nuxt-gustave/lib/gustave')

module.exports = function Gustave() {
  let isGenerating = false
  const config = getGustaveConfig()

  if (config.highlight) {
    this.options.css.push(
      `node_modules/highlight.js/styles/${config.highlightTheme}.css`
    )
  }

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
