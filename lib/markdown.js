const fs = require('fs')
const yamlFront = require('yaml-front-matter')
const path = require('path')
const slug = require('slug')
const { getGustaveConfig } = require('./gustave')

module.exports = {
  parseMarkdownDirectory,
  parseMarkdownFile
}

function parseMarkdownDirectory(inputDirectory, options = {}) {
  const markdownItInstance = getMarkdownItInstance()
  const directoryPath = inputDirectory
  const files = fs.readdirSync(directoryPath)
  const resources = files
    .filter(filename => path.extname(filename) === '.md')
    .filter(filename => filename.indexOf('_') !== 0)
    .map(filename => {
      const resource = parseMarkdownFile(
        `${directoryPath}/${filename}`,
        markdownItInstance
      )
      return resource
    })
  return resources
}

/**
 * Parse un fichier markdown en un object javascript contenant
 * la front matter et une propriété $html contenant le markdown rendu.
 * @param {*} filepath
 * @param {*} markdownItInstance
 */
function parseMarkdownFile(filepath, markdownItInstance) {
  const fileContent = fs.readFileSync(filepath, 'utf8')
  let entity = {}
  try {
    entity = yamlFront.loadFront(fileContent)
  } catch (e) {
    console.log(`${filepath} : compilation of front-matter failed for file 😱`)
    throw e
  }
  try {
    entity.$html = markdownItInstance.render(entity.__content)
    delete entity.__content
  } catch (e) {
    console.log(`${filepath} : rendering of markdown failed for file 😱`)
    throw e
  }
  const filename = path.basename(filepath)
  entity.$id = entity.$id || filename
  entity.$slug =
    entity.$slug || slug(filename.substring(0, filename.length - 2))
  return entity
}

/**
 * Return the markdownIt instance used to render html.
 */
function getMarkdownItInstance() {
  config = getGustaveConfig()
  let markdownItInstance = null
  if (config.markdownIt) {
    markdownItInstance = config.markdownIt()
  } else {
    markdownItInstance = defaultMarkdownIt()
  }
  if (config.highlight) {
    const hljs = require('highlight.js') // https://highlightjs.org/
    markdownItInstance.options.highlight = function(str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value
        } catch (__) {}
      }
      return '' // use external default escaping
    }
  }
  return markdownItInstance
}

function defaultMarkdownIt() {
  return require('markdown-it')({
    html: true,
    linkify: true
  })
}
