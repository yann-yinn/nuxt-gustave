# Gustave

[WIP] a nuxt module to generate spicy static sites from markdown files or any other sources.

`nuxt.config.js`:

```js
module.exports = {
  // ...
  gustave: {
    importers: [
      // built-in compiler
      {
        file: 'node_modules/nuxt-gustave/importers/markdown.js',
        options: {
          directory: 'content/pages',
          outputFile: 'pages.json',
          generateRoutes({ data }) {
            return data.map(node => `/page/${node.data.$slug}`)
          }
        }
      },
      // custom importers
      {
        file: '~/importers/pages.js',
        options: {}
      }
    ]
  }
}
```

custom compiler `importers/pages.js`:

```js
const { parseMarkdownDirectory } = require('nuxt-gustave/lib/markdown')
const { saveToJsonDir } = require('nuxt-gustave/lib/helpers')

exports.importer = () => {
  const result = parseMarkdownDirectory('content/pages')
  saveToJsonDir('pages.json', result)
  return {
    routes: result.data.map(node => `/page/${node.data.$slug}`)
  }
}
```
