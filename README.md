# Gustave

[WIP] Gustave is a Nuxt.js module to create a static site from markdown files.

It's main purpose is to transform a list of mardown files to a json file.

`nuxt.config.js`:

```js
module.exports = {
  // ...
  // add nuxt-gustave module
  modules: ['nuxt-gustave'],
  gustave: {
    importers: [
      // A built-in importer to generate a "static/api/pages.json" from
      // "content/pages" containing markdown files.
      {
        file: 'node_modules/nuxt-gustave/importers/markdown.js',
        options: {
          markdownDirectory: 'content/pages',
          generateRoutes: resources =>
            resources.map(resource => `/page/${resource.$slug_from_filename}`)
        }
      },
      // A custom importer
      {
        file: 'importers/persons.js'
      }
    ]
  }
}
```

custom importer example : `importers/persons.js`:

```js
const { parseMarkdownDirectory } = require('nuxt-gustave/lib/markdown')
const { saveToJsonDir } = require('nuxt-gustave/lib/helpers')

exports.importer = () => {
  const resources = parseMarkdownDirectory('content/persons')
  saveToJsonDir('persons.json', resources)
  return {
    routes: resources.map(resource => `/person/${resource.$slug_from_filename}`)
  }
}
```
