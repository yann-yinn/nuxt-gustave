const fs = require('fs')
const yamlFront = require('yaml-front-matter')
const path = require('path')
const slug = require('slug')

module.exports = {
  parseMarkdownDirectory,
  parseMarkdownFile
}

function parseMarkdownDirectory(inputDirectory, markdownItOptions = {}) {
  const files = fs.readdirSync(inputDirectory)
  var markdownIt = require('markdown-it')({
    html: true,
    linkify: true,
    ...markdownItOptions
  })
  const resources = files
    .filter(filename => path.extname(filename) === '.md')
    .filter(filename => filename.indexOf('_') === -1)
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
 * @param {*} markdownItOptions
 */
function parseMarkdownFile(filepath, markdownIt) {
  const fileContent = fs.readFileSync(filepath, 'utf8')
  let entity = {}
  try {
    entity = yamlFront.loadFront(fileContent)
  } catch (e) {
    console.log(`${filepath} : compilation of front-matter failed for file 😱`)
    throw e
  }
  try {
    entity.$html = markdownIt.render(entity.__content)
    delete entity.__content
  } catch (e) {
    console.log(`${filepath} : rendering of markdown failed for file 😱`)
    throw e
  }
  return entity
}
