# Gustave

Gustave transform markdown files to JSON files.

`nuxt.config.js`:

```js
module.exports = {
  // ...
  gustave: {
    jsonDirectory: '~/static/api',
    compilers: [
      // built-in compiler
      {
        file: 'modules/gustave/compilers/markdown.js',
        options: {
          directory: 'content/pages',
          outputFile: 'pages.json',
          generateRoutes({ data }) {
            return data.map(node => `/page/${node.data.$slug}`)
          }
        }
      },
      // custom compiler
      {
        file: '~/compilers/pages.js',
        options: {}
      }
    ]
  }
}
```

custom compiler `compilers/pages.js`:

```js
module.exports.compile = () => {
  const entities = parseMarkdownDirectory('content/pages')
  saveAsJson('static/api/pages.json', entities)
  return { routes: entities.map(e => `/page/${e.slug}`) }
}
```
