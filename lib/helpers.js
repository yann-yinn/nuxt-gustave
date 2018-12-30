const fs = require('fs')
const path = require('path')
const nuxtConfig = require('../../../nuxt.config')

module.exports = {
  saveToJsonDir,
  runImporters
}

/**
 * Save a file inside jsonDirectory (static/api by default)
 * @param {*} filepath : filepath, relative to jsonDirectory path
 * @param {*} data
 */
function saveToJsonDir(filepath, data) {
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
    const filepath = importer.file.replace('~/', '')
    const importerResult = require(path.resolve(filepath)).importer(
      importer.options
    )
    if (importerResult.routes) {
      routes = [...routes, ...importerResult.routes]
    } else {
      console.log(
        '\x1b[31m',
        `Gustave compilation stopped : ${
          compiler.file
        } must return an object containing an array of routes.`
      )
      process.exit(0)
    }
  })
  return routes
}
