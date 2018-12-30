const { parseMarkdownDirectory } = require('../lib/markdown')
const { saveToJsonDir } = require('../lib/helpers')

module.exports.importer = ({ directory, outputFile, generateRoutes }) => {
  const result = parseMarkdownDirectory(directory)
  saveToJsonDir(outputFile, result)
  return { routes: generateRoutes(result) }
}
