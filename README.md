# Gustave

[WIP] Gustave is a Nuxt.js module to create static sites from markdown files using the awesome `nuxt generate` command.

## Installation

Install Gustave as a "dev dependency"

```sh
npm install nuxt-gustave --save-dev
```

Add `static/api` directory to your `.gitignore`.

```sh
# nuxt-gustave
static/api
```

## Getting started

The core concept of Gustave are _importers_, which are just functions exporting an "importer" method. This method methods have usually 3 tasks to complete :

- Fetch some data from a source ( for example, markdown files)
- Store them somewhere ( like JSON files in the "static/api" directory )
- Return to Nuxt a list of the routes to generate, for `npm run generate` command ( see https://fr.nuxtjs.org/api/configuration-generate/#routes)

#### Create a Gustave "importer"

For example : create an `importers/posts.js` file.
It will turn a "content/posts" directory to a "static/api/posts.json" file:

```js
const { parseMarkdownDirectory } = require('nuxt-gustave/lib/markdown')
const { saveToJsonDirectory } = require('nuxt-gustave/lib/helpers')

exports.importer = () => {
  const resources = parseMarkdownDirectory('content/posts')
  saveToJsonDirectory('posts.json', resources)
  return resources.map(resource => `/posts/${resource.$slug_from_filename}`)
}
```

#### Configure Gustave importers

Configure `nuxt.config.js` file to use Gustave module and register our "importers/posts.js" importer.

```js
module.exports = {
  // ...
  // add nuxt-gustave module
  modules: ['nuxt-gustave'],
  // register importers to use:
  gustave: {
    importers: [
      {
        file: 'importers/posts.js',
        options: {} // optionnal arguments for our function
      }
    ]
  }
}
```

#### Create some posts in yaml

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

#### Generate JSON files

Json files are generating automatically from our `content/posts` directory when running nuxt commands like `npm run dev` or `npm run generate`. We can also use manually `npx nuxt-gustave` command to run the importers.

We now have a `static/api/posts.json` with this content :

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

Note that Gustave added two useful variables here :

- `$html` : the mardkown rendered as html
- `$slug_from_filename` : a slug generated from the filename, that can be used for urls or as ids.

#### Displaying our posts

Display all posts : `pages/posts/index.vue`

```html
<template>
  <div>
    <div v-for="post in posts" :key="post.$slug_from_filename">
      <h2>
        <nuxt-link :to="`/posts/${post.$slug_from_filename}`"
          >{{post.title}}</nuxt-link
        >
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

Display a single post : `pages/posts/_slug.vue`

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
        return posts.find(
          post => post.$slug_from_filename === this.$route.params.slug
        )
      }
    }
  }
</script>
```
