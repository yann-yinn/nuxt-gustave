const fs = require('fs')
const yamlFront = require('yaml-front-matter')
const path = require('path')
const slug = require('slug')
const { getGustaveConfig, sortResourcesByDate } = require('./gustave')

module.exports = {
  parseMarkdownDirectory,
  parseMarkdownFile
}

function parseMarkdownDirectory(inputDirectory, options) {
  let defaultOptions = {
    jekyllMode: false
  }
  options = { ...defaultOptions, ...options }
  const directoryPath = inputDirectory
  const files = fs.readdirSync(directoryPath)
  let resources = files
    .filter(filename => path.extname(filename) === '.md')
    .filter(filename => filename.indexOf('_') !== 0)
    .map(filename => {
      const resource = parseMarkdownFile(
        `${directoryPath}/${filename}`,
        options
      )
      return resource
    })
  // if filenames are started with Date, we most probably want them to be
  // be sorted by date.
  if (options.jekyllMode === true) {
    resources = sortResourcesByDate(resources, '$date', 'desc')
  }
  return resources
}

/**
 * Parse un fichier markdown en un object javascript contenant
 * la front matter et une propriété $html contenant le markdown rendu.
 * @param {*} filepath
 * @param {*} markdownItInstance
 */
function parseMarkdownFile(filepath, options = {}) {
  const markdownItInstance = getMarkdownItInstance()
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
  let $slug = null
  let $id = null

  // blogs posts may start with  date. example : "2018-05-02-" (11 characters)
  if (options.jekyllMode === true) {
    entity.$date = filename.substring(0, 10)
    $id = filename.substring(11, filename.length)
    $slug = slug(filename.substring(11, filename.length - 3))
  } else {
    $id = filename
    $slug = slug(filename.replace('.md', ''))
  }

  // if $slug is already on the yaml front-matter, do not override it with our own values
  if (!entity.$slug) {
    entity.$slug = $slug
  }
  if (!entity.$id) {
    entity.$id = $id
  }

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
