# GUSTAVE

Transform your markdown or yaml files into static sites or blog with `Nuxt.js`. Gustave is designed to work with Nuxt `npm run generate`.

Gustave transform your markdown or yaml files into _JSON files_ with customizable _compilers_. JSON files can then be easily consumed by your Vue.js components.

**Features**

- Frontmatter support for markdown files
- Handle dates in filenames for blogging, like Jekyll (e.g: `2018-08-21-apples.md`)
- Hot-reloading when markdown files are changed

## Requirements

- Node v10.12.0 (uses `{ recursive: true }` option from `fs.mkdir`)

## Installation

Install Gustave as a **dev dependency** only, as it is needed only to generate the JSON files from our markdown files.

```sh
npm install nuxt-gustave --save-dev
```

Add `static/api` directory to `.gitignore` file. This is where our JSON files will be generated by default.

```sh
# nuxt-gustave
static/api
```

## Getting started

The core concept of _Gustave_ are _compilers_ : a _compiler_ is just a function exporting a `compile` method. This `compile` method fetches data from somewhere (for example, local mardown files), save it as JSON and return to Nuxt an array of dynamic routes if needed ( for example : `['user/1', 'user/4', 'user/18']`).

> Thoses routes array are **required** for dynamic routes by `npm run generate` command, see https://nuxtjs.org/api/configuration-generate#routes . This is not required for static routes like `/contact` or `/about`. If you return them directly from your compiler, you don't need to add them manually to `nuxt.generate.routes` property from `nuxt.config.js`.

### Create an "compiler"

Create an `compilers/posts.js` file that will turn mardown files from a `content/posts` directory into a `static/api/posts.json` file

```js
const { parseMarkdownDirectory } = require('nuxt-gustave/lib/markdown')
const { saveToJsonDirectory } = require('nuxt-gustave/lib/gustave')

exports.compile = () => {
  const resources = parseMarkdownDirectory('content/posts')
  saveToJsonDirectory('posts.json', resources)
  return resources.map(resource => `/posts/${resource.$slug}`)
}
```

**NOTA BENE** : we declared here an array of routes with `/posts/${resource.$slug}` : this mean that we **MUST** create a corresponding `pages/posts/_slug.vue` component to handle thoses routes, to actually generate our html.

You can also convert a single to markdown :

```js
const { parseMarkdownFile } = require('nuxt-gustave/lib/markdown')
const { saveToJsonDirectory } = require('nuxt-gustave/lib/gustave')

exports.compile = () => {
  const resource = parseMarkdownFile('content/settings.md')
  saveToJsonDirectory('settings.json', resource)
  return []
}
```

### Register Gustave compilers

Now we have to configure `nuxt.config.js` file to use _Gustave_ module and register our new `compilers/posts.js` compiler.

```js
module.exports = {
  // ...
  // add nuxt-gustave module
  modules: ['nuxt-gustave'],
  // register compilers to use:
  gustave: {
    compilers: [
      'compilers/tags.js',
      'compilers/blocks.js',
      // you can passe options to an compiler with an array:
      ['compilers/posts.js', { hello: 'world' }]
    ]
  }
}
```

#### Create some posts in yaml

In `content/posts` directory, add two posts:

📝 **content/posts/first-post.md**

```markdown
---
title: this is my firt blog post :D
date: 2019-01-02
---

Hello there, this is my first blog post with Gustave.
```

📝 **content/posts/second-post.md**

```markdown
---
title: second post
date: 2019-01-03
---

Another post in mardown.
```

#### Generate our JSON files

Now , if we run `npm run dev`, `npm run generate` or `npx nuxt-gustave` command, a `static/api/posts.json` file will be automatically created.

```json
[
  {
    "title": "second post",
    "date": "2019-01-03T00:00:00.000Z",
    "$html": "<p>Another post in mardown. This is the future.</p>\n",
    "$id": "second-post.md",
    "$slug": "another-post"
  },
  {
    "title": "this is my firt blog post :D",
    "date": "2019-01-02T00:00:00.000Z",
    "$html": "<p>Hello there, this is my first blog post with Gustave.</p>\n",
    "$id": "first-post.md",
    "$slug": "hello"
  }
]
```

Note that _Gustave_ added some useful variables here :

- `$html` : the mardkown rendered as html.
- `$id` : a uniq id to identify this resource. Filename is used by default.
- `$slug` : a slug generated from the filename, that can be used to build pretty urls like "/posts/my-second-post"

All thoses variables can be overriden inside the compiler, before the resources are saved as a JSON file or direclty in the markdown front-matter:

```markdown
---
$slug: react-wordpress-reactpress-%f0%9f%92%9b
---
```

#### Displaying our posts

We now have a `posts.json` file that can be used from our components. Below are a simple example of how it could be done, but from this point; it's really up to you.

Display all posts : 📝 **pages/posts/index.vue**

```html
<template>
  <div>
    <div v-for="post in posts" :key="post.$slug">
      <h2>
        <nuxt-link :to="`/posts/${post.$slug}`">{{post.title}}</nuxt-link>
      </h2>
      <div v-html="post.$html" />
    </div>
  </div>
</template>

<script>
  import posts from 'static/api/posts.json'
  export default {
    computed: {
      posts() {
        return posts
      }
    }
  }
</script>
```

Display a single post : **pages/posts/\_slug.vue**

```html
<template>
  <div>
    <h1>{{post.title}}</h1>
    <div v-html="post.$html"></div>
  </div>
</template>

<script>
  import posts from 'static/api/posts.json'
  export default {
    computed: {
      post() {
        return posts.find(post => post.$slug === this.$route.params.slug)
      }
    }
  }
</script>
```

## Customize markdown interpreter options

### Custom mardown instance

Gustave is using Markdown-it to render markdown, with a default instance. We can pass our own markdownIt instance to get the full control about markdownIt configuration :

```js
module.exports = {
  // ...
  gustave: {
    markdownIt() {
      const markdownIt = require('markdown-it')({
        html: false,
        linkify: true
      })
      // we can add plugins here too
      return markdownIt
    }
    // ...
  }
}
```

### Syntaxic coloration

Code syntaxic coloration with markdownIt can be enable automatically with the `highlight` options (behind the hood, this will simply add CSS and JS from _highlight.js_ npm package) :

```js
module.exports = {
  // ...
  gustave: {
    highlight: true
    // ...
  }
}
```

### Blogging with "jekyllMode"

If you have a lot of posts, it is easier to retrieve quickly a post if your filename starts with the date. This what the "jekyllMode" is for :

For the following directory structure:

```
📁 content
  📁 posts
    📝 2018-07-02-my-first-post.md
    📝 2018-08-03-my-last-post.md
```

You can create the following compiler :

```js
exports.compile = () => {
  const resources = parseMarkdownDirectory('content/posts', {
    jekyllMode: true
  })
  saveToJsonDirectory('posts.json', resources)
  return resources.map(resource => `/blog/${resource.$slug}`)
}
```

It will create the following JSON in `static/api`, already sorted by date and with a \$date field:

```json
[
  {
    "$date": "2018-07-02",
    "$slug": "my-last-post",
    "$id": "my-last-post.md",
    "$html": "<div>html content of my last post</div>"
  },
  {
    "$date": "2018-07-02",
    "$slug": "my-first-post",
    "$id": "my-first-post.md",
    "$html": "<div>html content of my first post</div>"
  }
]
```

Note that the `$slug` and the `$id`

## Sort by date

if you have a field with an ISO Date, you can use `sortResoucesByDate` function manually to sort resources before saving them as JSON.

```js
resources = sortResourcesByDate(resources, '$date', 'asc')
```
