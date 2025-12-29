# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **SvelteKit 2** e-commerce storefront application integrated with **MedusaJS** backend. The app uses Svelte 5 with runes for state management, TailwindCSS v4 for styling, **shadcn-svelte** for UI components, and includes Storybook for component development.

## Core Technologies

- **SvelteKit 2**: Full-stack framework with file-based routing
- **Svelte 5**: Latest version using runes (`$state`, `$derived`, `$props`)
- **TailwindCSS v4**: Utility-first CSS with `@tailwindcss/vite` plugin
- **MedusaJS SDK**: E-commerce backend integration via `@medusajs/js-sdk`
- **TypeScript**: Strict mode enabled
- **Storybook**: Component development and documentation
- **Vitest**: Testing with Playwright browser support

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check
npm run check:watch

# Linting and formatting
npm run lint          # Run ESLint and Prettier checks
npm run format        # Format all files with Prettier

# Storybook
npm run storybook           # Start Storybook dev server on port 6006
npm run build-storybook     # Build static Storybook
```

## Architecture

### MedusaJS Integration

The app connects to a MedusaJS backend (configured via environment variables). The SDK is initialized in `src/lib/sdk.ts`:

- **Backend URL**: `PUBLIC_MEDUSA_BACKEND_URL` (default: http://localhost:9000)
- **Publishable Key**: `PUBLIC_MEDUSA_PUBLISHABLE_KEY`
- **Auth Type**: Session-based authentication

### Strapi CMS Integration

The app integrates with a Strapi headless CMS for managing content (blog posts, pages, marketing content). The client is initialized in `src/lib/strapi.ts` and uses **GraphQL** (via @urql/svelte) for data fetching:

- **Backend URL**: `PUBLIC_STRAPI_URL` (https://cms.znagti.ge)
- **API Token**: `PUBLIC_STRAPI_API_TOKEN` (read-only access)
- **Usage**: CMS content only (MedusaJS handles product data)
- **Implementation**: GraphQL-based using @urql/svelte with cacheExchange and fetchExchange

#### Strapi Client API

The Strapi client provides three main methods:

- `strapi.find(contentType, params)` - Fetch a collection of entries with filtering, sorting, and pagination
- `strapi.findOne(contentType, id, params)` - Fetch a single entry by ID
- `strapi.findByField(contentType, field, value, params)` - Fetch a single entry by a unique field (e.g., slug)

All methods support:
- **Population**: Include related content (e.g., author, cover image)
- **Filtering**: Filter by field values
- **Sorting**: Sort results by one or more fields
- **Pagination**: Page-based or offset-based pagination

See `src/lib/strapi-examples.md` for detailed usage examples.

#### TypeScript Types

Strapi response types are defined in `src/lib/types/strapi.ts`:

- `StrapiEntity<T>` - Generic entity structure
- `StrapiSingleResponse<T>` - Response for a single entity
- `StrapiCollectionResponse<T>` - Response for a collection of entities
- `StrapiMedia` - Media/file structure
- Example content types: `ArticleAttributes`, `PageAttributes`, etc.

**Important**: Always fetch Strapi data in `+page.server.ts` or `+layout.server.ts` files to keep the API token secure and avoid exposing it to the client.

### State Management with Svelte 5 Runes

The app uses **Svelte 5 class-based stores** with runes in `src/lib/stores/`:

#### Cart Store (`cart.svelte.ts`)

- Manages shopping cart state using `$state` runes
- Persists cart ID in localStorage (`medusa_cart_id`)
- Provides methods: `initialize()`, `addItem()`, `updateItem()`, `removeItem()`, `complete()`
- **Important**: `deleteLineItem()` returns `{ parent: cart }`, not `{ cart }`
- **Important**: `complete()` returns different structure based on success/failure with `type` field

#### Customer Store (`customer.svelte.ts`)

- Manages authentication and customer data with `$state` runes
- Supports **phone-based registration** (experimental) with OTP verification
- Methods: `login()`, `register()`, `verifyOTP()`, `logout()`, `fetchCustomer()`
- Uses `$derived` for `isAuthenticated` computed property
- Legacy email-based registration available as `registerLegacy()`

Both stores are initialized in `src/routes/+layout.svelte` on mount.

### File Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/           # Reusable UI components (button, card)
│   │   ├── header/       # Header component
│   │   └── slider/       # Image carousel slider (Embla Carousel)
│   ├── stores/           # Svelte 5 state stores
│   ├── types/            # TypeScript type definitions
│   │   └── strapi.ts     # Strapi CMS types
│   ├── sdk.ts            # MedusaJS SDK initialization
│   ├── strapi.ts         # Strapi CMS client
│   ├── strapi-examples.md # Strapi usage examples
│   └── utils.ts          # Utility functions (clsx, tailwind-merge)
├── routes/
│   ├── +layout.svelte    # Root layout (initializes stores)
│   ├── +page.svelte      # Homepage
│   ├── auth/             # Login, register, logout
│   ├── products/         # Product listings with dynamic routes
│   │   └── [categoryId]/[subCategoryId]/[itemId]/
│   ├── cart/             # Cart and checkout
│   ├── profile/          # User profile
│   └── [other pages]     # favs, about-us, faq, ToS, Privacy
└── stories/              # Storybook stories
```

### Path Aliases

- `@/*` maps to `./src/lib/*` (configured in `svelte.config.js`)
- `$lib` is SvelteKit's built-in alias for `src/lib`

Use `@/` for imports from lib (e.g., `import Button from "@/components/ui/button/button.svelte"`)

### Routing

SvelteKit file-based routing with dynamic parameters:

- `/products/[categoryId]` - Category page
- `/products/[categoryId]/[subCategoryId]` - Subcategory page
- `/products/[categoryId]/[subCategoryId]/[itemId]` - Product detail page

### UI Components

The project uses **shadcn-svelte** for its UI component library. Components are located in `src/lib/components/ui/` and follow the shadcn pattern:

- **Button**: `src/lib/components/ui/button/` - Button component with variants (default, destructive, outline, secondary, ghost, link) and sizes
- **Card**: `src/lib/components/ui/card/` - Card components with sub-components (header, content, footer, title, description, action)
- **Slider**: `src/lib/components/slider/` - Image carousel using Embla Carousel
- **Header**: `src/lib/components/header/` - Site header component

All shadcn-svelte components:

- Use `tailwind-variants` (`tv()`) for variant definitions
- Use `cn()` utility from `src/lib/utils.ts` (combines `clsx` and `tailwind-merge`)
- Follow the `WithElementRef` pattern for proper ref handling
- Export `VariantProps` types for TypeScript support
- Are built for Svelte 5 with runes (`$props`, `$bindable`)

When adding new shadcn-svelte components, place them in `src/lib/components/ui/[component-name]/` and use the `@/` alias for imports.

### Styling

- TailwindCSS v4 with Vite plugin (`@tailwindcss/vite`)
- Plugins: `@tailwindcss/forms`, `@tailwindcss/typography`, `tw-animate-css`
- Global styles in `src/app.css`
- Uses `clsx` and `tailwind-merge` via `src/lib/utils.ts`

## Important Notes

### MedusaJS SDK Quirks

- `sdk.store.cart.deleteLineItem()` returns `{ parent: cart }` instead of `{ cart }`
- `sdk.store.cart.complete()` returns `{ type: 'order', order }` on success or `{ type: 'cart', cart, error }` on failure
- Payment sessions are not yet implemented (see `cart.svelte.ts:181`)

### Authentication

- The app supports both email/password and phone/OTP authentication
- Phone-based auth is experimental and uses `phone-auth` provider
- Session-based auth is configured in the SDK

### Environment Variables

All environment variables must be prefixed with `PUBLIC_` to be exposed to the browser in SvelteKit.

### Svelte 5 Syntax

- Use `$state`, `$derived`, `$props`, and `$effect` runes
- Class-based stores instead of traditional Svelte stores
- `{@render children()}` for layout children

### ESLint Configuration

- Flat config format (`eslint.config.js`)
- Extends TypeScript, Svelte, and Prettier configs
- `no-undef` is disabled (handled by TypeScript)
- Import extensions rule configured for `.js`, `.jsx`, `.ts`, `.tsx`

### Storybook

- Configured for SvelteKit with CSF stories
- Stories located in `src/stories/` and component directories
- Addons: a11y, docs, vitest, svelte-csf

### Vite Configuration

- MedusaJS SDK requires special handling:
    - Included in `optimizeDeps.include`
    - Added to `ssr.noExternal` for SSR compatibility
    - ESBuild target set to `esnext`
