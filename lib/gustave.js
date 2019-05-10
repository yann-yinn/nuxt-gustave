const fs = require('fs')
const path = require('path')
const nuxtConfig = require(path.resolve('./nuxt.config.js')).default

module.exports = {
  saveToJsonDirectory,
  runCompilers,
  getGustaveConfig,
  sortResourcesByDate
}

function getGustaveConfig() {
  const defaultConfig = require('../defaultConfig.js')
  return {
    ...defaultConfig,
    ...nuxtConfig.gustave
  }
}

/**
 * Save a file inside jsonDirectory (static/api by default)
 * @param {*} filepath : filepath, relative to jsonDirectory path
 * @param {*} data
 */
function saveToJsonDirectory(filepath, data) {
  const basePath = getGustaveConfig().JSONDirectory
  const fullpath = basePath + '/' + filepath
  const directoriesPath = path.dirname(fullpath)
  if (!fs.existsSync(directoriesPath)) {
    fs.mkdirSync(directoriesPath, { recursive: true })
  }
  fs.writeFileSync(fullpath, JSON.stringify(data))
  console.log('\x1b[32m', `📚 Gustave: ${fullpath} created.`)
}

function removeAllFilesFromDirectory(directory) {
  fs.readdirSync(directory, (err, files) => {
    if (err) throw err
    for (const file of files) {
      fs.unlinkSync(path.join(directory, file), err => {
        if (err) throw err
      })
    }
  })
}

/**
 * Exécute tous les compilateurs du dossiers "compilersDirectory".
 * Un compilateur est un script qui prend des fichiers du dossier "content"
 * pour créer des fichiers JSON qui iront dans "/static/api"
 */
function runCompilers() {
  let routes = []
  /*
  console.log(
    '\x1b[35m',
    `🧻  Gustave: remove all files from "${getJsonDirectoryPath()}" directory`
  )
  removeAllFilesFromDirectory(getJsonDirectoryPath())
  */
  nuxtConfig.gustave.compilers.forEach(importerData => {
    let importer = {}
    if (typeof importerData === 'string') {
      importer.file = importerData
      importer.options = {}
    }
    if (Array.isArray(importerData)) {
      importer.file = importerData[0]
      importer.options = importerData[1]
    }
    console.log('\x1b[34m', `🚚 Gustave: running "${importer.file}" importer`)
    const importerRoutes = require(path.resolve(importer.file)).compile(
      importer.options
    )
    if (importerRoutes) {
      routes = [...routes, ...importerRoutes]
    } else {
      console.log(
        '\x1b[31m',
        `Gustave: compilation stopped : ${
          importer.file
        } returned ${typeof importerRoutes}, but MUST return an array of routes. e.g: ['/user/1', '/user/2', '/user/3'], or an empty array if there is no dynamic routes to declare.`
      )
      process.exit(0)
    }
  })
  return routes
}

/**
 *
 * @param {array} resources. Array of object to sort.
 * @param {string} field. Name of the property
 * @param {string} order : ASC or DESC
 */
function sortResourcesByDate(resources, field, order) {
  return resources.sort(function(a, b) {
    if (!['desc', 'asc'].includes(order)) {
      throw new Error('order should be "desc" or "asc"')
    }
    if (order === 'desc') {
      return new Date(b[field]) - new Date(a[field])
    }
    if (order === 'asc') {
      return new Date(a[field]) - new Date(b[field])
    }
  })
}
