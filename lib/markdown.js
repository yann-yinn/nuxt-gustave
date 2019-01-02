const fs = require('fs')
const yamlFront = require('yaml-front-matter')
const path = require('path')
const slug = require('slug')

module.exports = {
  parseMarkdownDirectory,
  parseMarkdownFile
}

function parseMarkdownDirectory(inputDirectory, options = {}) {
  const markdownItInstance = options.markdownItInstance || null
  const markdownItDefaultInstanceOptions =
    options.markdownItDefaultInstanceOptions || {}
  const files = fs.readdirSync(inputDirectory)
  let markdownIt = null
  // if a mardownItInstance has been passed, use it instead of the default one
  if (markdownItInstance) {
    markdownIt = markdownItInstance
  } else {
    // else, use a basic default markdown-it instance
    markdownIt = require('markdown-it')({
      html: true,
      linkify: true,
      ...markdownItDefaultInstanceOptions
    })
  }
  const resources = files
    .filter(filename => path.extname(filename) === '.md')
    .filter(filename => filename.indexOf('_') !== 0)
    .map(filename => {
      const resource = parseMarkdownFile(
        `${inputDirectory}/${filename}`,
        markdownIt
      )
      resource.$slug_from_filename = slug(
        filename.substring(0, filename.length - 2)
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
  return entity
}
