# Gustave

[WIP] Gustave is a Nuxt.js module to create a static site from markdown files using the awesome `nuxt generate` command.

## Installation

Install Gustave as a "dev dependency"

```sh
npm install nuxt-gustave --save-dev
```

## Getting started : create a blog with markdown files

#### Configure Gustave importers

Configure `nuxt.config.js` file to use Gustave module and tell him to compile to JSON our `content/posts` directory:

```js
module.exports = {
  // ...
  // add nuxt-gustave module
  modules: ['nuxt-gustave'],
  // register importers to use:
  gustave: {
    importers: [
      // use mardown.js built-in importer to turn our
      // "content/posts" directory into a "static/api/posts.json" file.
      {
        file: 'node_modules/nuxt-gustave/importers/markdown.js',
        options: {
          markdownDirectory: 'content/posts',
          // we MUST declare explicitly each post url for 'npm run generate' to work
          // as expected. See https://fr.nuxtjs.org/api/configuration-generate/#routes
          generateRoutes: posts =>
            posts.map(post => `/posts/${post.$slug_from_filename}`)
        }
      }
    ]
  }
}
```

#### Create our posts in yaml

In `content/posts` directory, create two posts. Their filenames will be used to create their urls.

First post:

```markdown
---
title: this is my firt blog post :D
date: 2019-01-02
---

Hello there, this is my first blog post with Gustave.
```

Second post

```markdown
---
title: second post
date: 2019-01-03
---

Another post in mardown.
```

#### Generate JSON

Run "npm run dev": Json files are generating automatically when running command `npm run dev` or `npm run generate`.

You will find a `static/api/posts.json` with this content :

```json
[
  {
    "title": "second post",
    "date": "2019-01-03T00:00:00.000Z",
    "$html": "<p>Another post in mardown. This is the future.</p>\n",
    "$slug_from_filename": "another-post"
  },
  {
    "title": "this is my firt blog post :D",
    "date": "2019-01-02T00:00:00.000Z",
    "$html": "<p>Hello there, this is my first blog post with Gustave.</p>\n",
    "$slug_from_filename": "hello"
  }
]
```

#### Displaying our posts

Create a component to list all posts : `pages/posts/index.vue`

```js
<template>
  <div>
    <div v-for="post in posts" :key="post.$slug_from_filename">
      <h2>
        <nuxt-link :to="`/posts/${post.$slug_from_filename}`">{{post.title}}</nuxt-link>
      </h2>
      <div v-html="post.$html"/>
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

Create a component to display a single post : `pages/posts/_slug.vue`

```js
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
      return posts.find(
        post => post.$slug_from_filename === this.$route.params.slug
      )
    }
  }
}
</script>
```

## Custom importer

Gustave has zero abstractions : you can write your own importers, where your are free to fetch data from where you want, and store it the way you want. An importer is just a function that is fetching some stuff and return a list of routes to Nuxt.

Create your own importer is very simple and alltows you to create the JSON you need. Here is a very simple example with a custom yaml importer:

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
