const { runImporters, getGustaveConfig } = require('nuxt-gustave/lib/gustave')
const chokidar = require('chokidar')

module.exports = function Gustave() {
  let isGenerating = false
  const config = getGustaveConfig()
  chokidar.watch(config.contentDirectory).on('change', path => {
    console.log(
      '\x1b[34m',
      'Gustave: markdown change detected, launching importers'
    )
    runImporters()
  })

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
