const { runCompilers, getGustaveConfig } = require('./lib/gustave')
const path = require('path')

module.exports = function Gustave() {
  let isGenerating = false
  const config = getGustaveConfig()

  this.options.watch.push(path.resolve(config.contentDirectory))

  if (config.highlight) {
    this.options.css.push(
      `node_modules/highlight.js/styles/${config.highlightTheme}.css`
    )
  }

  this.nuxt.hook('generate:before', () => {
    isGenerating = true
    const routes = runCompilers()
    this.options.generate.routes = [...routes, ...this.options.generate.routes]
  })

  // make sure static JSON files exists before components call them
  this.nuxt.hook('build:before', () => {
    if (!isGenerating) {
      runCompilers()
    }
  })
}

module.exports.meta = require('./package.json')
