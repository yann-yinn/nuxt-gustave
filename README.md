# G**u**sta**ve** ( ⚠️ Work in progress )

**Gustave** is a _Nuxt.js_ module to build static sites converting markdown files to JSON files. It is designed to work with the fantastic `npm run generate` command from Nuxt.

## Requirements

- Node v10.12.0 (uses `{ recursive: true }` option from `fs.mkdir`)

## Installation

Install Gustave as a **dev dependency**.

```sh
npm install nuxt-gustave --save-dev
```

Add `static/api` directory to your `.gitignore`. This is where JSON files are generated by default.

```sh
# nuxt-gustave
static/api
```

## Getting started

The core concept of Gustave are _importers_.

An _importer_ is a function that fetches data from somewhere, save it as JSON and return to Nuxt an array of routes ( for example : `[user/1, user/4, user/18]`).

Thoses routes will be automatically added by Gustave in the `generate.routes` property from `nuxt.config.js` , which is used by the `npm run genrate` to generate the static html files (see here for more informations : https://nuxtjs.org/api/configuration-generate#routes )

### Creating a Gustave "importer"

Create an `importers/posts.js` file. It will turn a `content/posts` directory into a `static/api/posts.json` file:

```js
const { parseMarkdownDirectory } = require('nuxt-gustave/lib/markdown')
const { saveToJsonDirectory } = require('nuxt-gustave/lib/helpers')

// you MUST exports your function in the "importer" key.
exports.importer = () => {
  const resources = parseMarkdownDirectory('content/posts')
  saveToJsonDirectory('posts.json', resources) // will be saved in `static/api/posts.json`
  return resources.map(resource => `/posts/${resource.$slug}`)
}
```

#### Register Gustave importers

Now configure `nuxt.config.js` file to use _Gustave_ module and register our `importers/posts.js` importer. Only registered importers will run.

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

_Gustave_ added some useful variables here :

- `$html` : the mardkown rendered as html
- `$id` : a uniq id to identify this resource in this collection. We use the filename by default.
- `$slug` : a slug generated from the filename, that can be used in urls.

All thoses variables can be overriden inside the importer, before the resources are saved as a JSON file.

#### Displaying our posts

Actualy, Gustave JOBS is done here. You now have `posts.json` file that you can use from your components. Below are a simple example of how it could be done, but from this point; it's really up to you.

Display all posts : 📝 **pages/posts/index.vue**

```html
<template>
  <div>
    <div v-for="post in posts" :key="post.$slug">
      <h2>
        <nuxt-link :to="`/posts/${post.$slug}`"
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
        return posts.find(
          post => post.$slug === this.$route.params.slug
        )
      }
    }
  }
</script>
```
