const { runImporters, getConfig } = require('nuxt-gustave/lib/gustave')

module.exports = function Gustave() {
  let isGenerating = false
  const config = getConfig()

  // add css for highlight.js by default. can be disabed in config
  // if we are not using highlight
  if (config.highlightCSS) {
    this.options.css.push(
      `node_modules/highlight.js/styles/${config.highlightCSSTheme}.css`
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
