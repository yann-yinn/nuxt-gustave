const fs = require('fs')
const path = require('path')
const nuxtConfig = require('../../../nuxt.config')
const rimraf = require('rimraf')

module.exports = {
  saveToJsonDirectory,
  runImporters,
  getConfig
}

function getConfig() {
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
  const basePath = getConfig().JSONDirectory
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
function runImporters() {
  let routes = []
  /*
  console.log(
    '\x1b[35m',
    `🧻  Gustave: remove all files from "${getJsonDirectoryPath()}" directory`
  )
  removeAllFilesFromDirectory(getJsonDirectoryPath())
  */
  nuxtConfig.gustave.importers.forEach(importer => {
    console.log('\x1b[34m', `🚚 Gustave: running "${importer.file}" importer`)
    const importerRoutes = require(path.resolve(importer.file)).importer(
      importer.options
    )
    if (importerRoutes) {
      routes = [...routes, ...importerRoutes]
    } else {
      console.log(
        '\x1b[31m',
        `Gustave: compilation stopped : ${
          importer.file
        } returned ${typeof importerRoutes}, but MUST return an array of routes. e.g: ['/user/1', '/user/2', '/user/3']`
      )
      process.exit(0)
    }
  })
  return routes
}
