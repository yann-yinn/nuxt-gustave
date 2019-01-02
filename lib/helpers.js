const fs = require('fs')
const path = require('path')
const nuxtConfig = require('../../../nuxt.config')

module.exports = {
  saveToJsonDirectory,
  runImporters
}

/**
 * Save a file inside jsonDirectory (static/api by default)
 * @param {*} filepath : filepath, relative to jsonDirectory path
 * @param {*} data
 */
function saveToJsonDirectory(filepath, data) {
  const basePath = nuxtConfig.gustave.jsonDirectory
    ? nuxtConfig.gustave.jsonDirectory.replace('~/', '')
    : 'static/api'
  const fullpath = basePath + '/' + filepath
  const directoriesPath = path.dirname(fullpath)
  if (!fs.existsSync(directoriesPath)) {
    fs.mkdirSync(directoriesPath, { recursive: true })
  }

  fs.writeFile(fullpath, JSON.stringify(data), err => {
    if (err) throw err
    console.log('\x1b[32m', `📚 ${fullpath} created.`)
  })
}

/**
 * Exécute tous les compilateurs du dossiers "compilersDirectory".
 * Un compilateur est un script qui prend des fichiers du dossier "content"
 * pour créer des fichiers JSON qui iront dans "/static/api"
 */
function runImporters() {
  let routes = []
  nuxtConfig.gustave.importers.forEach(importer => {
    const importerRoutes = require(path.resolve(importer.file)).importer(
      importer.options
    )
    if (importerRoutes) {
      routes = [...routes, ...importerRoutes]
    } else {
      console.log(
        '\x1b[31m',
        `Gustave compilation stopped : ${
          importer.file
        } returned ${typeof importerRoutes}, but MUST return an array of routes. e.g: ['/user/1', '/user/2', '/user/3']`
      )
      process.exit(0)
    }
  })
  return routes
}
