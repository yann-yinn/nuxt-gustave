const yaml = require('js-yaml')
const yamlinc = require('yaml-include')
const fs = require('fs')
const path = require('path')

module.exports = {
  parseYamlDirectory,
  parseYamlFile
}

function parseYamlFile(filepath, options = {}) {
  try {
    let yamlOptions = {}
    if (options.includes === true) {
      yamlOptions = {
        schema: yamlinc.YAML_INCLUDE_SCHEMA
      }
    }
    const resource = yaml.safeLoad(
      fs.readFileSync(filepath, 'utf8'),
      yamlOptions
    )
    resource.$filename = path.basename(filepath)
    return resource
  } catch (err) {
    throw new Error(err)
  }
}

function parseYamlDirectory(inputDirectory, options) {
  let defaultOptions = {
    // boolean. Interpret includes from https://www.npmjs.com/package/yaml-include
    includes: false,
    // string. e.g : "modules/facturier"
    chdir: null
  }
  options = { ...defaultOptions, ...options }

  let dir = null
  if (options.chdir) {
    dir = process.cwd()
    process.chdir(options.chdir)
  }
  // Get document, or throw exception on error
  let files = fs.readdirSync(inputDirectory)
  const resources = files.filter(f => f.indexOf('_') !== 0).map(filename => {
    const filepath = inputDirectory + '/' + filename
    return parseYamlFile(filepath, options)
  })
  if (options.chdir) {
    process.chdir(dir)
  }

  return resources
}
