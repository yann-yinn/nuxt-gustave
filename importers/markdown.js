const { parseMarkdownDirectory } = require('../lib/markdown')
const { saveToJsonDirectory } = require('../lib/helpers')

module.exports.importer = ({
  markdownDirectory,
  outputFile,
  generateRoutes
}) => {
  const resources = parseMarkdownDirectory(markdownDirectory)
  if (!outputFile) {
    outputFile = markdownDirectory.split('/').pop() + '.json'
  }
  saveToJsonDirectory(outputFile, resources)
  return generateRoutes(resources)
}
