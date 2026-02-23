# Strapi CMS Integration Examples

This file provides examples of how to use the Strapi CMS integration in your SvelteKit app.

**Note:** The Strapi client now uses **GraphQL** (via @urql/svelte) instead of REST API for improved performance and flexibility. The API interface remains the same, so all examples below work unchanged.

## Basic Usage

### Importing the Client

```typescript
import { strapi } from '$lib/strapi';
```

### Fetching a Collection

```typescript
// In a +page.ts or +page.server.ts file
export async function load() {
  // Fetch all articles with basic pagination
  const articles = await strapi.find('articles', {
    pagination: {
      page: 1,
      pageSize: 10
    },
    sort: ['publishedAt:desc']
  });

  return {
    articles: articles.data
  };
}
```

### Fetching with Population

```typescript
// Fetch articles with author and cover image populated
const articles = await strapi.find('articles', {
  populate: ['author', 'cover', 'category'],
  pagination: {
    page: 1,
    pageSize: 10
  }
});
```

### Fetching a Single Entry by ID

```typescript
const article = await strapi.findOne('articles', 123, {
  populate: ['author', 'cover', 'tags']
});
```

### Fetching by Slug

```typescript
// Find an article by slug
const article = await strapi.findByField('articles', 'slug', 'my-article-slug', {
  populate: ['author', 'cover', 'category']
});
```

## Complete Page Example

### Blog Listing Page

**File: `src/routes/blog/+page.server.ts`**

```typescript
import { strapi } from '$lib/strapi';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const pageSize = 10;

  const response = await strapi.find('articles', {
    populate: ['author', 'cover', 'category'],
    sort: ['publishedAt:desc'],
    pagination: {
      page,
      pageSize
    }
  });

  return {
    articles: response.data,
    pagination: response.meta.pagination
  };
};
```

**File: `src/routes/blog/+page.svelte`**

```svelte
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">Blog</h1>

  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {#each data.articles as article}
      <article class="border rounded-lg overflow-hidden">
        {#if article.attributes.cover?.data}
          <img
            src={article.attributes.cover.data.attributes.url}
            alt={article.attributes.cover.data.attributes.alternativeText || article.attributes.title}
            class="w-full h-48 object-cover"
          />
        {/if}
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-2">
            <a href="/blog/{article.attributes.slug}" class="hover:text-blue-600">
              {article.attributes.title}
            </a>
          </h2>
          {#if article.attributes.description}
            <p class="text-gray-600 mb-4">{article.attributes.description}</p>
          {/if}
          {#if article.attributes.author?.data}
            <p class="text-sm text-gray-500">
              By {article.attributes.author.data.attributes.name}
            </p>
          {/if}
        </div>
      </article>
    {/each}
  </div>

  {#if data.pagination}
    <div class="mt-8 flex justify-center gap-2">
      {#if data.pagination.page > 1}
        <a
          href="?page={data.pagination.page - 1}"
          class="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Previous
        </a>
      {/if}
      <span class="px-4 py-2">
        Page {data.pagination.page} of {data.pagination.pageCount}
      </span>
      {#if data.pagination.page < data.pagination.pageCount}
        <a
          href="?page={data.pagination.page + 1}"
          class="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Next
        </a>
      {/if}
    </div>
  {/if}
</div>
```

### Blog Detail Page

**File: `src/routes/blog/[slug]/+page.server.ts`**

```typescript
import { strapi } from '$lib/strapi';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const article = await strapi.findByField('articles', 'slug', params.slug, {
    populate: ['author', 'cover', 'category', 'tags']
  });

  if (!article) {
    throw error(404, 'Article not found');
  }

  return {
    article
  };
};
```

**File: `src/routes/blog/[slug]/+page.svelte`**

```svelte
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const article = data.article;
</script>

<svelte:head>
  <title>{article.attributes.title}</title>
  {#if article.attributes.description}
    <meta name="description" content={article.attributes.description} />
  {/if}
</svelte:head>

<article class="container mx-auto px-4 py-8 max-w-4xl">
  {#if article.attributes.cover?.data}
    <img
      src={article.attributes.cover.data.attributes.url}
      alt={article.attributes.cover.data.attributes.alternativeText || article.attributes.title}
      class="w-full h-96 object-cover rounded-lg mb-8"
    />
  {/if}

  <h1 class="text-4xl font-bold mb-4">{article.attributes.title}</h1>

  {#if article.attributes.author?.data}
    <div class="flex items-center gap-4 mb-8 text-gray-600">
      <span>By {article.attributes.author.data.attributes.name}</span>
      <span>•</span>
      <time datetime={article.attributes.publishedAt}>
        {new Date(article.attributes.publishedAt).toLocaleDateString()}
      </time>
    </div>
  {/if}

  <div class="prose prose-lg max-w-none">
    {@html article.attributes.content}
  </div>

  {#if article.attributes.tags?.data?.length}
    <div class="mt-8 flex gap-2">
      {#each article.attributes.tags.data as tag}
        <span class="px-3 py-1 bg-gray-100 rounded-full text-sm">
          {tag.attributes.name}
        </span>
      {/each}
    </div>
  {/if}
</article>
```

## Filtering Examples

### Filter by Category

```typescript
const articles = await strapi.find('articles', {
  filters: {
    'category.slug': { $eq: 'technology' }
  },
  populate: ['author', 'cover']
});
```

### Search by Title

```typescript
const articles = await strapi.find('articles', {
  filters: {
    title: { $contains: 'React' }
  }
});
```

## Advanced Population

```typescript
// Deep population with nested relations
const articles = await strapi.find('articles', {
  populate: {
    author: {
      populate: ['avatar']
    },
    cover: true,
    category: true,
    tags: true
  }
});
```

## TypeScript Usage

```typescript
import type { StrapiEntity } from '$lib/types/strapi';
import type { ArticleAttributes } from '$lib/types/strapi';

// Type-safe article data
const articles = await strapi.find<ArticleAttributes>('articles', {
  populate: ['author', 'cover']
});

// articles.data is typed as StrapiEntity<ArticleAttributes>[]
```

## Error Handling

```typescript
import { error } from '@sveltejs/kit';

try {
  const article = await strapi.findByField('articles', 'slug', params.slug);

  if (!article) {
    throw error(404, 'Article not found');
  }

  return { article };
} catch (err) {
  console.error('Strapi error:', err);
  throw error(500, 'Failed to fetch article');
}
```

## Notes

- All API calls are made server-side using `+page.server.ts` or `+layout.server.ts` files
- The Strapi API token is securely stored in environment variables and not exposed to the client
- Images from Strapi will have URLs relative to the Strapi backend URL (https://cms.znagti.ge)
- Remember to handle `null` cases for optional relations and media
