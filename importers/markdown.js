const { parseMarkdownDirectory } = require('../lib/markdown')
const { saveToJsonDir } = require('../lib/helpers')

module.exports.importer = ({
  markdownDirectory,
  outputFile,
  generateRoutes
}) => {
  const resources = parseMarkdownDirectory(markdownDirectory)
  if (!outputFile) {
    outputFile = markdownDirectory.split('/').pop() + '.json'
  }
  saveToJsonDir(outputFile, resources)
  return { routes: generateRoutes(resources) }
}
