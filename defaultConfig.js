module.exports = {
  JSONDirectory: 'static/api',
  highlight: true,
  highlightTheme: 'github',
  markdownIt: null
  /*
  markdownIt: () => {
    const markdownIt = require('markdown-it')({
      html: true,
      linkify: true,
      highlight: function(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(lang, str).value
          } catch (__) {}
        }
        return '' // use external default escaping
      }
    })
    return markdownIt
  }
  */
}
