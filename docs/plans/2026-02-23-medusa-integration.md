# Medusa Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the SvelteKit frontend fully to Medusa v2 for products, cart, and checkout — replacing all Strapi product data with Medusa SDK calls and all localCartStore usage with the real cartStore.

**Architecture:** Product catalog, cart, and checkout all go through `@medusajs/js-sdk` (`sdk` from `$lib/sdk.ts`). A product adapter (`$lib/types/medusa-adapter.ts`) converts Medusa's `StoreProduct` shape to the shape expected by existing UI components, avoiding component rewrites. Strapi stays for CMS-only data (header navigation) which is already server-side-only.

**Tech Stack:** SvelteKit 2, Svelte 5 runes, `@medusajs/js-sdk` v2.13.1, Medusa v2 backend at `localhost:9000`

---

## Prerequisites (manual — do in Medusa admin before running frontend)

Before any frontend work can be tested, the following must exist in Medusa admin (`http://localhost:9000/app`):

1. **Region**: Create a region (e.g. "Georgia", currency GEL or USD)
2. **Sales Channel**: Default sales channel exists after seed — verify it's there
3. **Publishable Key**: Go to Settings → API Keys → confirm the key matches `PUBLIC_MEDUSA_PUBLISHABLE_KEY` in `hubs-frontend/.env`
4. **Products**: Add at least 1 product with at least 1 variant via admin
5. **Product Categories**: Create categories with handles matching your URL slugs (e.g. `fan-shop`, `clothing`, etc.)
6. **Shipping Option**: Create a fulfillment provider and shipping option (Settings → Shipping)

---

## Task 1: Fix Environment Config

**Files:**
- Modify: `hubs-frontend/.env`

**Step 1: Fix the port**

Open `hubs-frontend/.env` and change:
```
PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9001
```
to:
```
PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

**Step 2: Verify the backend is reachable**

Run:
```bash
curl http://localhost:9000/store/regions -H "x-publishable-api-key: YOUR_KEY_HERE"
```
Expected: JSON with `{ "regions": [...] }` — not a connection error.

If port 9000 is not running, start the backend:
```bash
cd /home/niko/hubs/hubs-store && yarn dev
```

**Step 3: Verify the frontend SDK connects**

Start the frontend:
```bash
cd /home/niko/hubs/hubs-frontend && npm run dev
```

Open browser devtools → Network tab. Load any page. You should see requests to `localhost:9000` (not 9001). There may be 404s if no products exist yet — that's fine.

**Step 4: Commit**

```bash
cd /home/niko/hubs/hubs-frontend
git add .env
git commit -m "fix: correct Medusa backend URL port (9001 -> 9000)"
```

---

## Task 2: Create Medusa Product Adapter

The UI components (`ProductsGrid`, `ProductCard`, `ProductCardSlider`) expect a specific shape from Strapi. This adapter converts Medusa's `StoreProduct` to that shape. All product-to-UI mapping lives here.

**Files:**
- Create: `src/lib/types/medusa-adapter.ts`

**Step 1: Understand Medusa's StoreProduct shape**

Medusa's `StoreProduct` (from `@medusajs/types`) has:
- `id`, `title`, `handle`, `thumbnail`, `description`, `status`
- `images: { url }[]`
- `variants: StoreProductVariant[]` — each variant has `id`, `calculated_price`, `options`
- `categories: { id, name, handle }[]`
- `options: { id, title, values: { value }[] }[]`

Prices are in **cents** (integer). Divide by 100 for display.

**Step 2: Create the adapter file**

Create `src/lib/types/medusa-adapter.ts`:

```typescript
import type { StoreProduct, StoreProductVariant } from '@medusajs/types';

/**
 * The shape expected by ProductsGrid, ProductCard, and ProductCardSlider components.
 * Mirrors the Strapi product shape that components were built against.
 */
export interface ProductCardItem {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    averageRating: number | null;
    price: number;                   // display price in GEL/currency units (not cents)
    discountPrice: number | null;    // null if no discount
    discountPercentage: number | null;
    isFavourite: boolean | null;
    category: { name: string; slug: string } | null;
    mainImage: { url: string; alternativeText: string | null; width: number; height: number } | null;
    gallery: Array<{ url: string; alternativeText: string | null; width: number; height: number }>;
    // Medusa-specific fields (not in Strapi shape but needed for cart)
    firstVariantId: string | null;   // ID of first variant, for quick "add to cart"
    variants: Array<{
        id: string;
        options: Record<string, string>; // e.g. { "Size": "M", "Color": "Red" }
        price: number;
        originalPrice: number;
    }>;
}

export function medusaProductToCard(product: StoreProduct): ProductCardItem {
    const firstVariant = product.variants?.[0] as StoreProductVariant | undefined;

    // Extract calculated price (in cents) from the first variant
    const calculatedPrice = firstVariant?.calculated_price;
    const priceInCents = calculatedPrice?.calculated_amount ?? 0;
    const originalPriceInCents = calculatedPrice?.original_amount ?? priceInCents;

    const price = priceInCents / 100;
    const originalPrice = originalPriceInCents / 100;
    const hasDiscount = originalPrice > price;

    const discountPercentage = hasDiscount
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : null;

    const category = product.categories?.[0] ?? null;

    // Build gallery from images array
    const gallery = (product.images ?? []).map((img) => ({
        url: img.url,
        alternativeText: null,
        width: 800,
        height: 800,
    }));

    // Use thumbnail as mainImage if available, else first gallery image
    const mainImageUrl = product.thumbnail ?? product.images?.[0]?.url ?? null;
    const mainImage = mainImageUrl
        ? { url: mainImageUrl, alternativeText: product.title, width: 800, height: 800 }
        : null;

    // Map variants to a simpler shape with option values
    const variants = (product.variants ?? []).map((v) => {
        const variantCalcPrice = (v as StoreProductVariant).calculated_price;
        const variantPrice = (variantCalcPrice?.calculated_amount ?? 0) / 100;
        const variantOriginalPrice = (variantCalcPrice?.original_amount ?? 0) / 100;

        // Build option map: { "Size": "M", "Color": "Red" }
        const options: Record<string, string> = {};
        for (const opt of (v.options ?? [])) {
            const optionTitle = product.options?.find((o) => o.id === opt.option_id)?.title ?? opt.option_id;
            options[optionTitle] = opt.value;
        }

        return {
            id: v.id,
            options,
            price: variantPrice,
            originalPrice: variantOriginalPrice,
        };
    });

    return {
        id: product.id,
        name: product.title,
        slug: product.handle ?? product.id,
        shortDescription: product.subtitle ?? null,
        averageRating: null,           // Medusa doesn't have ratings out of the box
        price,
        discountPrice: hasDiscount ? price : null,
        discountPercentage,
        isFavourite: null,
        category: category ? { name: category.name, slug: category.handle } : null,
        mainImage,
        gallery,
        firstVariantId: firstVariant?.id ?? null,
        variants,
    };
}

/**
 * Convert Medusa pagination to the PaginationInfo shape used by ProductsGrid.
 */
export interface PaginationInfo {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
}

export function medusaPagination(count: number, page: number, pageSize: number): PaginationInfo {
    return {
        page,
        pageSize,
        pageCount: Math.ceil(count / pageSize),
        total: count,
    };
}
```

**Step 3: Commit**

```bash
cd /home/niko/hubs/hubs-frontend
git add src/lib/types/medusa-adapter.ts
git commit -m "feat: add Medusa product adapter to convert StoreProduct to UI shape"
```

---

## Task 3: Replace Product Listing Page with Medusa

**Files:**
- Modify: `src/routes/products/[categoryId]/+page.server.ts`

The component (`+page.svelte`) renders a `ProductsGrid` — we just need the data shape to match. The component doesn't change.

**Step 1: Rewrite the server load function**

Replace the entire contents of `src/routes/products/[categoryId]/+page.server.ts`:

```typescript
import { sdk } from '$lib/sdk';
import { medusaProductToCard, medusaPagination } from '$lib/types/medusa-adapter';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 12;

export const load: PageServerLoad = async ({ params, url, parent }) => {
    const { header } = await parent();
    const isAll = params.categoryId === 'all';
    const categoryHandle = isAll ? null : params.categoryId;
    const page = Number(url.searchParams.get('page')) || 1;
    const offset = (page - 1) * PAGE_SIZE;

    try {
        // Fetch products from Medusa
        const query: Record<string, unknown> = {
            limit: PAGE_SIZE,
            offset,
            fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
        };
        if (categoryHandle) {
            query['category_handle[]'] = categoryHandle;
        }

        const { products, count } = await sdk.store.product.list(query as any);

        // Fetch all categories for the sidebar filter
        const { product_categories } = await sdk.store.category.list({ limit: 100 });

        const categories = (product_categories ?? []).map((c) => ({
            name: c.name,
            slug: c.handle,
        }));

        const activeCategory = categoryHandle;
        const activeCategory_ = categoryHandle
            ? (product_categories ?? []).find((c) => c.handle === categoryHandle)
            : null;

        return {
            products: (products ?? []).map(medusaProductToCard),
            pagination: medusaPagination(count ?? 0, page, PAGE_SIZE),
            categories,
            categorySlug: activeCategory,
            categoryName: activeCategory_?.name ?? null,
            navigationItems: header?.navigationItems ?? [],
        };
    } catch (error) {
        console.error('Error fetching products from Medusa:', error);
        return {
            products: [],
            pagination: { page: 1, pageSize: PAGE_SIZE, pageCount: 1, total: 0 },
            categories: [],
            categorySlug: categoryHandle,
            categoryName: null,
            navigationItems: header?.navigationItems ?? [],
        };
    }
};
```

**Step 2: Update ProductsGrid to accept our adapter shape**

Open `src/lib/components/products-grid/ProductsGrid.svelte`. The `ProductItem` type is defined inline. Update it to add `firstVariantId` (needed later for cart):

Find the `type ProductItem = {` block and add at the end:
```typescript
    firstVariantId: string | null;
```

Also update the `getImageUrl` function — it currently prepends `PUBLIC_STRAPI_URL` to relative URLs. Medusa images have full URLs. Change:

```typescript
// OLD:
function getImageUrl(image: StrapiImage | null): string {
    if (!image?.url) return '/placeholder-image.png';
    return `${PUBLIC_STRAPI_URL}${image.url}`;
}

// NEW:
function getImageUrl(image: StrapiImage | null): string {
    if (!image?.url) return '/placeholder-image.png';
    // Medusa images are absolute URLs; Strapi images were relative
    if (image.url.startsWith('http')) return image.url;
    return `${PUBLIC_STRAPI_URL}${image.url}`;
}
```

Remove the `import {PUBLIC_STRAPI_URL} from '$env/static/public';` line only if no other references to `PUBLIC_STRAPI_URL` remain in the file after this change. (Check with grep.)

**Step 3: Verify**

Start dev server (`npm run dev`) and open `/products/all` in the browser. You should see products from Medusa (or an empty grid if no products exist yet). No Strapi GraphQL requests in Network tab.

**Step 4: Commit**

```bash
cd /home/niko/hubs/hubs-frontend
git add src/routes/products/\[categoryId\]/+page.server.ts src/lib/components/products-grid/ProductsGrid.svelte
git commit -m "feat: replace Strapi product listing with Medusa SDK"
```

---

## Task 4: Create Subcategory Listing Page

The subcategory page (`/products/[categoryId]/[subCategoryId]`) is currently a stub with no server load. It needs to filter by subcategory handle.

**Files:**
- Create: `src/routes/products/[categoryId]/[subCategoryId]/+page.server.ts`
- Modify: `src/routes/products/[categoryId]/[subCategoryId]/+page.svelte`

**Step 1: Create the server load**

Create `src/routes/products/[categoryId]/[subCategoryId]/+page.server.ts`:

```typescript
import { sdk } from '$lib/sdk';
import { medusaProductToCard, medusaPagination } from '$lib/types/medusa-adapter';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 12;

export const load: PageServerLoad = async ({ params, url, parent }) => {
    const { header } = await parent();
    const page = Number(url.searchParams.get('page')) || 1;
    const offset = (page - 1) * PAGE_SIZE;

    try {
        const { products, count } = await sdk.store.product.list({
            'category_handle[]': params.subCategoryId,
            limit: PAGE_SIZE,
            offset,
            fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
        } as any);

        const { product_categories } = await sdk.store.category.list({ limit: 100 });
        const categories = (product_categories ?? []).map((c) => ({ name: c.name, slug: c.handle }));
        const activeCategory = product_categories?.find((c) => c.handle === params.subCategoryId);

        return {
            products: (products ?? []).map(medusaProductToCard),
            pagination: medusaPagination(count ?? 0, page, PAGE_SIZE),
            categories,
            categorySlug: params.subCategoryId,
            categoryName: activeCategory?.name ?? null,
            navigationItems: header?.navigationItems ?? [],
        };
    } catch (error) {
        console.error('Error fetching subcategory products from Medusa:', error);
        return {
            products: [],
            pagination: { page: 1, pageSize: PAGE_SIZE, pageCount: 1, total: 0 },
            categories: [],
            categorySlug: params.subCategoryId,
            categoryName: null,
            navigationItems: [],
        };
    }
};
```

**Step 2: Update the subcategory page to use ProductsGrid**

Replace `src/routes/products/[categoryId]/[subCategoryId]/+page.svelte`:

```svelte
<script lang="ts">
    import type { PageData } from './$types';
    import ProductsGrid from '@/components/products-grid/ProductsGrid.svelte';

    let { data }: { data: PageData } = $props();

    const breadcrumbs = $derived([
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products/all' },
        { label: data.categoryName || data.categorySlug || '' },
    ]);
</script>

<ProductsGrid
    products={data.products}
    pagination={data.pagination}
    categories={data.categories}
    activeCategory={data.categorySlug}
    {breadcrumbs}
/>
```

**Step 3: Commit**

```bash
cd /home/niko/hubs/hubs-frontend
git add src/routes/products/\[categoryId\]/\[subCategoryId\]/
git commit -m "feat: add subcategory product listing page using Medusa"
```

---

## Task 5: Replace Product Detail Page with Medusa

**Files:**
- Modify: `src/routes/products/[categoryId]/[subCategoryId]/[itemId]/+page.server.ts`
- Modify: `src/routes/products/[categoryId]/[subCategoryId]/[itemId]/+page.svelte`

**Step 1: Rewrite the server load**

Replace the entire contents of `src/routes/products/[categoryId]/[subCategoryId]/[itemId]/+page.server.ts`:

```typescript
import { sdk } from '$lib/sdk';
import { error } from '@sveltejs/kit';
import type { StoreProduct, StoreProductVariant } from '@medusajs/types';
import type { PageServerLoad } from './$types';

export type MedusaProductDetail = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    originalPrice: number;
    hasDiscount: boolean;
    discountPercentage: number | null;
    category: { name: string } | null;
    mainImage: { url: string; alternativeText: string | null } | null;
    gallery: Array<{ url: string; alternativeText: string | null }>;
    averageRating: number | null;
    hasBranding: boolean;
    options: Array<{ title: string; values: string[] }>;
    variants: Array<{
        id: string;
        price: number;
        originalPrice: number;
        options: Record<string, string>;
    }>;
};

export const load: PageServerLoad = async ({ params, parent }) => {
    await parent();

    try {
        const { products } = await sdk.store.product.list({
            handle: params.itemId,
            fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
        } as any);

        const product = products?.[0] as StoreProduct | undefined;
        if (!product) throw error(404, 'Product not found');

        const firstVariant = product.variants?.[0] as StoreProductVariant | undefined;
        const calcPrice = firstVariant?.calculated_price;
        const price = (calcPrice?.calculated_amount ?? 0) / 100;
        const originalPrice = (calcPrice?.original_amount ?? price * 100) / 100;
        const hasDiscount = originalPrice > price;

        // Map options to title+values for size/color pickers
        const options = (product.options ?? []).map((opt) => ({
            title: opt.title,
            values: (opt.values ?? []).map((v) => v.value),
        }));

        // Map variants
        const variants = (product.variants ?? []).map((v) => {
            const vCalc = (v as StoreProductVariant).calculated_price;
            const vPrice = (vCalc?.calculated_amount ?? 0) / 100;
            const vOriginalPrice = (vCalc?.original_amount ?? vPrice * 100) / 100;
            const vOptions: Record<string, string> = {};
            for (const vOpt of (v.options ?? [])) {
                const title = product.options?.find((o) => o.id === vOpt.option_id)?.title ?? vOpt.option_id;
                vOptions[title] = vOpt.value;
            }
            return { id: v.id, price: vPrice, originalPrice: vOriginalPrice, options: vOptions };
        });

        const mainImageUrl = product.thumbnail ?? product.images?.[0]?.url ?? null;

        const detail: MedusaProductDetail = {
            id: product.id,
            name: product.title,
            slug: product.handle ?? product.id,
            description: product.description ?? null,
            price,
            originalPrice,
            hasDiscount,
            discountPercentage: hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : null,
            category: product.categories?.[0] ? { name: product.categories[0].name } : null,
            mainImage: mainImageUrl ? { url: mainImageUrl, alternativeText: product.title } : null,
            gallery: (product.images ?? []).map((img) => ({ url: img.url, alternativeText: null })),
            averageRating: null,
            hasBranding: false,
            options,
            variants,
        };

        return {
            product: detail,
            categoryId: params.categoryId,
            subCategoryId: params.subCategoryId,
        };
    } catch (err: any) {
        if (err.status === 404) throw err;
        console.error('Error fetching product from Medusa:', err);
        return { product: null, categoryId: params.categoryId, subCategoryId: params.subCategoryId };
    }
};
```

**Step 2: Update the product detail Svelte component**

The component currently uses the Strapi `Product` type and `localCartStore`. Update it to use `MedusaProductDetail` and `cartStore`.

At the top of `+page.svelte`, replace the imports and types:

```svelte
<script lang="ts">
    import { cartStore } from '$lib/stores/cart.svelte';
    import type { PageData } from './$types';
    import type { MedusaProductDetail } from './+page.server';

    let { data }: { data: PageData } = $props();

    const product = $derived(data.product as MedusaProductDetail | null);

    let selectedImageIndex = $state(0);
    let selectedOptions = $state<Record<string, string>>({});
    let activeTab = $state<'overview' | 'details' | 'reviews'>('overview');
    let addingToCart = $state(false);
    let addedToCart = $state(false);

    // Find the variant matching currently selected options
    const selectedVariant = $derived.by(() => {
        if (!product?.variants?.length) return null;
        if (Object.keys(selectedOptions).length === 0) return product.variants[0];
        return product.variants.find((v) =>
            Object.entries(selectedOptions).every(([key, val]) => v.options[key] === val)
        ) ?? null;
    });

    const allImages = $derived.by(() => {
        if (!product) return [];
        const imgs = [];
        if (product.mainImage) imgs.push(product.mainImage);
        for (const img of product.gallery) {
            if (img.url !== product.mainImage?.url) imgs.push(img);
        }
        return imgs;
    });

    const currentImage = $derived(allImages[selectedImageIndex] ?? product?.mainImage ?? null);
    const displayPrice = $derived(selectedVariant?.price ?? product?.price ?? 0);
    const originalPrice = $derived(selectedVariant?.originalPrice ?? product?.originalPrice ?? 0);
    const hasDiscount = $derived(originalPrice > displayPrice);

    async function addToCart() {
        if (!selectedVariant) return;
        addingToCart = true;
        try {
            await cartStore.addItem(selectedVariant.id, 1);
            addedToCart = true;
            setTimeout(() => { addedToCart = false; }, 2000);
        } catch (err) {
            console.error('Failed to add to cart:', err);
        } finally {
            addingToCart = false;
        }
    }
</script>
```

Then update the template to:
- Replace `product.name` with `product.name` (same)
- Replace `getImageUrl(image)` with `image.url` (direct URL)
- Replace size/color pickers using `product.availableSizes` / `product.avaliableColors` with `product.options`-based pickers
- Replace the `addToCart()` call with the new async one
- Show branding section only if `product.hasBranding === true`
- Replace `product.reviews` references with a placeholder (Medusa doesn't have reviews out of the box)
- Replace breadcrumb `product.slug` with `product.slug`

Key replacements in the template section:
- `{#if product.availableSizes?.length}` → `{#if product.options?.find(o => o.title === 'Size')}`
- `{#each product.availableSizes as size}` → `{#each product.options.find(o => o.title === 'Size')?.values ?? [] as size}`
- `{#each product.avaliableColors as color}` → `{#each product.options.find(o => o.title === 'Color')?.values ?? [] as color}`
- `selectedSize === size.productSize` → `selectedOptions['Size'] === size`
- onclick for size: `selectedSize = size.productSize` → `selectedOptions = { ...selectedOptions, Size: size }`
- `getImageUrl(image)` → `image.url`
- Remove `PUBLIC_STRAPI_URL` import

**Step 3: Verify**

Navigate to a product detail page URL (if products exist in Medusa): `/products/[cat]/[subcat]/[product-handle]`. The product should load. "Add to Cart" should add to `cartStore`.

**Step 4: Commit**

```bash
cd /home/niko/hubs/hubs-frontend
git add src/routes/products/\[categoryId\]/\[subCategoryId\]/\[itemId\]/
git commit -m "feat: replace Strapi product detail with Medusa, wire cart"
```

---

## Task 6: Replace Fan-Shop Page with Medusa

The fan-shop page shows products filtered by the `fan-shop` category, plus banners from Strapi CMS.

**Files:**
- Modify: `src/routes/products/fan-shop/+page.server.ts`
- Modify: `src/routes/products/fan-shop/+page.svelte`

**Step 1: Rewrite the server load**

Replace `src/routes/products/fan-shop/+page.server.ts`:

```typescript
import { strapi, mapParaglideLocaleToStrapi } from '$lib/strapi';
import { sdk } from '$lib/sdk';
import { getLocale } from '$lib/paraglide/runtime';
import { medusaProductToCard } from '$lib/types/medusa-adapter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
    const { header } = await parent();
    const locale = getLocale();
    const strapiLocale = mapParaglideLocaleToStrapi(locale);

    // CMS banners/layout from Strapi (non-commerce content)
    let fanShopCms: { Banner?: any; productListTitle?: string; seeMore?: string } | null = null;
    try {
        fanShopCms = await strapi.findSingle('fanShop', {
            locale: strapiLocale,
            fields: ['productListTitle', 'seeMore', 'Banner { id, buttonText, Image { width, height, url } }'],
        });
    } catch (err) {
        console.warn('Could not fetch fan-shop CMS data from Strapi:', err);
    }

    // Product data from Medusa (category handle must be "fan-shop" in Medusa admin)
    let products: ReturnType<typeof medusaProductToCard>[] = [];
    try {
        const { products: medusaProducts } = await sdk.store.product.list({
            'category_handle[]': 'fan-shop',
            limit: 24,
            fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
        } as any);
        products = (medusaProducts ?? []).map(medusaProductToCard);
    } catch (err) {
        console.error('Error fetching fan-shop products from Medusa:', err);
    }

    return {
        products,
        fanShopCms,
        navigationItems: header?.navigationItems ?? [],
    };
};
```

**Step 2: Update fan-shop page component**

In `src/routes/products/fan-shop/+page.svelte`, replace `localCartStore` import with `cartStore`:

```typescript
import { cartStore } from '$lib/stores/cart.svelte';
```

Replace all `localCartStore.addItem({...})` calls with:
```typescript
cartStore.addItem(product.firstVariantId, 1)
```

where `product` is the adapted `ProductCardItem`. Check that `product.firstVariantId` is not null before calling.

Remove any `PUBLIC_STRAPI_URL` usage for product images (adapter provides absolute URLs). Keep `PUBLIC_STRAPI_URL` only for CMS banner images from `fanShopCms`.

**Step 3: Commit**

```bash
cd /home/niko/hubs/hubs-frontend
git add src/routes/products/fan-shop/
git commit -m "feat: fan-shop products from Medusa, keep CMS banners in Strapi"
```

---

## Task 7: Update Homepage to Use Medusa Products

The homepage shows "Featured Products" from Strapi's `fanShop.productList`. Replace with Medusa.

**Files:**
- Modify: `src/routes/+page.server.ts`
- Modify: `src/routes/+page.svelte`

**Step 1: Rewrite homepage server load**

Replace `src/routes/+page.server.ts`:

```typescript
import { sdk } from '$lib/sdk';
import { medusaProductToCard } from '$lib/types/medusa-adapter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const { products } = await sdk.store.product.list({
            limit: 12,
            fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
        } as any);

        return {
            products: (products ?? []).map(medusaProductToCard),
        };
    } catch (error) {
        console.error('Error fetching homepage products from Medusa:', error);
        return { products: [] };
    }
};
```

**Step 2: Update homepage component**

In `src/routes/+page.svelte`, the `handleAddToCart` function uses `localCartStore.addItem`. Replace with:

```typescript
import { cartStore } from '$lib/stores/cart.svelte';
import type { ProductCardItem } from '$lib/types/medusa-adapter';

// ...

async function handleAddToCart(product: ProductCardItem): Promise<void> {
    if (!product.firstVariantId) return;
    try {
        await cartStore.addItem(product.firstVariantId, 1);
    } catch (err) {
        console.error('Failed to add to cart:', err);
    }
}
```

Update `ProductCardSlider` usage — the `products` prop type will now be `ProductCardItem[]`. Check that `ProductCardSlider` props align; if it expects `ComponentFanShopProductItem`, update it to accept `ProductCardItem` or adapt the data before passing.

Remove the `localCartStore` import from `+page.svelte`.

The `<FanShop/>` component at the bottom of the homepage — if it fetches its own data from Strapi internally, leave it for now or remove it. If it receives products as props, pass Medusa products.

**Step 3: Commit**

```bash
cd /home/niko/hubs/hubs-frontend
git add src/routes/+page.server.ts src/routes/+page.svelte
git commit -m "feat: homepage featured products from Medusa"
```

---

## Task 8: Remove localCartStore — Wire All Components to cartStore

**Files:**
- Modify: `src/lib/components/header/Header.svelte`
- Modify: `src/lib/components/products-grid/ProductsGrid.svelte`
- Modify: `src/lib/components/quick-view/QuickView.svelte`
- Modify: `src/routes/+layout.svelte`

**Step 1: Header — switch cart count**

In `src/lib/components/header/Header.svelte`, change:

```typescript
// Remove:
import { localCartStore } from '@/stores/local-cart.svelte';
let cartItemCount = $derived(localCartStore.itemCount);

// Add:
import { cartStore } from '@/stores/cart.svelte';
let cartItemCount = $derived(cartStore.itemCount);
```

**Step 2: ProductsGrid — switch add to cart**

In `src/lib/components/products-grid/ProductsGrid.svelte`, change:

```typescript
// Remove:
import { localCartStore } from '$lib/stores/local-cart.svelte';

// Add:
import { cartStore } from '$lib/stores/cart.svelte';
```

Replace the `localCartStore.addItem({...})` call with:
```typescript
onAddToCartClick={() => {
    if (product.firstVariantId) {
        cartStore.addItem(product.firstVariantId, 1).catch(console.error);
    }
}}
```

**Step 3: QuickView — switch add to cart**

In `src/lib/components/quick-view/QuickView.svelte`, change the localCartStore import and `addItem` call similarly:
```typescript
// Remove:
import { localCartStore } from '$lib/stores/local-cart.svelte';
localCartStore.addItem({...});

// Add:
import { cartStore } from '$lib/stores/cart.svelte';
// In the function that adds to cart, use the variant id from the product:
cartStore.addItem(selectedVariantId, quantity).catch(console.error);
```

The QuickView component will need to receive variant info or a product with `firstVariantId`. Check what props it currently accepts.

**Step 4: Layout — remove localCartStore initialization**

In `src/routes/+layout.svelte`, remove:
```typescript
import { localCartStore } from '$lib/stores/local-cart.svelte';
// ...
localCartStore.initialize();
```

The `cartStore.initialize()` call stays (already there).

**Step 5: Commit**

```bash
cd /home/niko/hubs/hubs-frontend
git add src/lib/components/ src/routes/+layout.svelte
git commit -m "feat: replace localCartStore with cartStore across all components"
```

---

## Task 9: Fix Cart Store — Region Handling

The `cartStore.create()` currently creates a cart without a `region_id`. Medusa v2 requires a region. If there's only one region, Medusa may auto-select it. If not, we need to fetch and pass it.

**Files:**
- Modify: `src/lib/stores/cart.svelte.ts`

**Step 1: Update `initialize()` to fetch region on cart creation**

In `cart.svelte.ts`, update the `create()` method to auto-fetch the first region if none is provided:

```typescript
async create(regionId?: string) {
    try {
        let resolvedRegionId = regionId;

        if (!resolvedRegionId) {
            // Auto-select the first available region
            try {
                const { regions } = await sdk.store.region.list({ limit: 1 });
                resolvedRegionId = regions?.[0]?.id;
            } catch {
                console.warn('Could not fetch regions; creating cart without region_id');
            }
        }

        const payload: any = {};
        if (resolvedRegionId) {
            payload.region_id = resolvedRegionId;
        }

        const { cart } = await sdk.store.cart.create(payload);
        this.cart = cart;
        this.setCartId(cart.id);
        return cart;
    } catch (err: any) {
        this.error = err.message;
        throw err;
    }
}
```

**Step 2: Test cart initialization**

Open browser devtools. Load the site. Check that `cartStore.cart` is not null after initialization (look in Svelte devtools or add a `console.log` temporarily). Verify a cart appears in the Medusa admin → Orders → Carts.

**Step 3: Commit**

```bash
cd /home/niko/hubs/hubs-frontend
git add src/lib/stores/cart.svelte.ts
git commit -m "fix: auto-select region when creating cart"
```

---

## Task 10: Rewrite Cart Page

The cart page currently uses `localCartStore`. Rewrite it to display `cartStore.cart.items`.

**Files:**
- Modify: `src/routes/cart/+page.server.ts` → delete or simplify to empty
- Modify: `src/routes/cart/+page.svelte`

**Step 1: Remove the cookie-reading server load**

The `+page.server.ts` reads `local_cart` cookie — no longer needed. Replace the entire file with:

```typescript
export const load = async () => {
    return {};
};
```

(Or delete the file entirely — SvelteKit handles missing `+page.server.ts` gracefully.)

**Step 2: Rewrite cart page component**

At the top of `src/routes/cart/+page.svelte`, replace all imports and state:

```svelte
<script lang="ts">
    import { cartStore } from '$lib/stores/cart.svelte';
    import { goto } from '$app/navigation';
    import { Minus, Plus, Trash2, Truck, TicketPercent, ChevronDown } from '@lucide/svelte';

    const cartItems = $derived(cartStore.cart?.items ?? []);
    const itemCount = $derived(cartStore.itemCount);
    const subtotal = $derived(cartStore.subtotal);
    const total = $derived(subtotal);

    async function removeItem(lineItemId: string) {
        await cartStore.removeItem(lineItemId);
    }

    async function updateQuantity(lineItemId: string, quantity: number) {
        if (quantity <= 0) {
            await cartStore.removeItem(lineItemId);
        } else {
            await cartStore.updateItem(lineItemId, quantity);
        }
    }

    function goToCheckout() {
        goto('/cart/check-out');
    }
</script>
```

Update the template to loop over `cartItems` (Medusa line items) instead of `localCartStore.items`. Key Medusa line item fields:
- `item.id` — use for update/remove operations (not index)
- `item.title` — product name
- `item.thumbnail` — image URL (direct, no Strapi prefix needed)
- `item.quantity`
- `item.unit_price` — price in cents, divide by 100
- `item.subtotal` — subtotal in cents for this line
- `item.variant.title` — variant name (size/color)

Replace all `localCartStore.updateQuantity(index, ...)` calls with `updateQuantity(item.id, ...)`.
Replace all `localCartStore.removeItem(index)` calls with `removeItem(item.id)`.

Remove the address form that was on the cart page — address collection moves to checkout.

**Step 3: Test**

Add a product to cart from a product page. Navigate to `/cart`. Items should appear. Increment/decrement quantity should work. Remove should work.

**Step 4: Commit**

```bash
cd /home/niko/hubs/hubs-frontend
git add src/routes/cart/
git commit -m "feat: rewrite cart page to use Medusa cartStore"
```

---

## Task 11: Build Checkout Page

The checkout page at `/cart/check-out` is a stub. Build the simplified flow: email → address → shipping method → payment → complete.

**Files:**
- Modify: `src/routes/cart/check-out/+page.svelte`
- Create: `src/routes/orders/[orderId]/+page.svelte` (order confirmation)

**Step 1: Write the checkout component**

Replace `src/routes/cart/check-out/+page.svelte`:

```svelte
<script lang="ts">
    import { cartStore } from '$lib/stores/cart.svelte';
    import { customerStore } from '$lib/stores/customer.svelte';
    import { sdk } from '$lib/sdk';
    import { goto } from '$app/navigation';

    // Step tracking
    let step = $state<'email' | 'address' | 'shipping' | 'review'>('email');
    let loading = $state(false);
    let error = $state<string | null>(null);

    // Email step
    let email = $state(customerStore.customer?.email ?? '');

    // Address step
    let firstName = $state(customerStore.customer?.first_name ?? '');
    let lastName = $state(customerStore.customer?.last_name ?? '');
    let address1 = $state('');
    let city = $state('');
    let countryCode = $state('ge');
    let postalCode = $state('');
    let phone = $state('');

    // Shipping step
    let shippingOptions = $state<Array<{ id: string; name: string; amount: number }>>([]);
    let selectedShippingOptionId = $state<string | null>(null);

    async function submitEmail() {
        if (!email || !cartStore.cart) return;
        loading = true;
        error = null;
        try {
            await cartStore.updateEmail(email);
            step = 'address';
        } catch (err: any) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function submitAddress() {
        if (!cartStore.cart) return;
        loading = true;
        error = null;
        try {
            await cartStore.setShippingAddress({
                first_name: firstName,
                last_name: lastName,
                address_1: address1,
                city,
                country_code: countryCode,
                postal_code: postalCode,
                phone: phone || undefined,
            });

            // Fetch shipping options
            const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
                cart_id: cartStore.cart.id,
            });
            shippingOptions = (shipping_options ?? []).map((opt) => ({
                id: opt.id,
                name: opt.name,
                amount: (opt.amount ?? 0) / 100,
            }));

            step = 'shipping';
        } catch (err: any) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function submitShipping() {
        if (!selectedShippingOptionId || !cartStore.cart) return;
        loading = true;
        error = null;
        try {
            await cartStore.addShippingMethod(selectedShippingOptionId);

            // Initialize manual payment session
            await sdk.store.payment.initiatePaymentSession(cartStore.cart, {
                provider_id: 'pp_system_default',
            });

            step = 'review';
        } catch (err: any) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function placeOrder() {
        loading = true;
        error = null;
        try {
            const order = await cartStore.complete();
            if (order) {
                goto(`/orders/${order.id}`);
            }
        } catch (err: any) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="mx-auto max-w-2xl px-4 py-12">
    <h1 class="mb-8 text-2xl font-semibold uppercase">Checkout</h1>

    {#if error}
        <div class="mb-4 rounded border border-red-400 bg-red-50 px-4 py-3 text-red-700">{error}</div>
    {/if}

    {#if step === 'email'}
        <section>
            <h2 class="mb-4 text-lg font-medium">Contact</h2>
            <input
                type="email"
                bind:value={email}
                placeholder="Email address"
                class="mb-4 w-full rounded border px-3 py-2"
            />
            <button
                onclick={submitEmail}
                disabled={loading || !email}
                class="w-full rounded bg-black py-3 text-white disabled:opacity-50"
            >
                {loading ? 'Saving...' : 'Continue to Address'}
            </button>
        </section>

    {:else if step === 'address'}
        <section>
            <h2 class="mb-4 text-lg font-medium">Shipping Address</h2>
            <div class="grid grid-cols-2 gap-4 mb-4">
                <input bind:value={firstName} placeholder="First name" class="rounded border px-3 py-2" />
                <input bind:value={lastName} placeholder="Last name" class="rounded border px-3 py-2" />
            </div>
            <input bind:value={address1} placeholder="Address" class="mb-4 w-full rounded border px-3 py-2" />
            <div class="grid grid-cols-2 gap-4 mb-4">
                <input bind:value={city} placeholder="City" class="rounded border px-3 py-2" />
                <input bind:value={postalCode} placeholder="Postal code" class="rounded border px-3 py-2" />
            </div>
            <input bind:value={phone} placeholder="Phone (optional)" class="mb-4 w-full rounded border px-3 py-2" />
            <button
                onclick={submitAddress}
                disabled={loading || !firstName || !lastName || !address1 || !city}
                class="w-full rounded bg-black py-3 text-white disabled:opacity-50"
            >
                {loading ? 'Saving...' : 'Continue to Shipping'}
            </button>
        </section>

    {:else if step === 'shipping'}
        <section>
            <h2 class="mb-4 text-lg font-medium">Shipping Method</h2>
            {#if shippingOptions.length === 0}
                <p class="text-gray-500">No shipping options available.</p>
            {:else}
                {#each shippingOptions as option}
                    <label class="mb-3 flex items-center gap-3 rounded border p-4 cursor-pointer">
                        <input
                            type="radio"
                            name="shipping"
                            value={option.id}
                            bind:group={selectedShippingOptionId}
                        />
                        <span class="flex-1">{option.name}</span>
                        <span>{option.amount === 0 ? 'Free' : `${option.amount.toFixed(2)}`}</span>
                    </label>
                {/each}
            {/if}
            <button
                onclick={submitShipping}
                disabled={loading || !selectedShippingOptionId}
                class="mt-4 w-full rounded bg-black py-3 text-white disabled:opacity-50"
            >
                {loading ? 'Saving...' : 'Review Order'}
            </button>
        </section>

    {:else if step === 'review'}
        <section>
            <h2 class="mb-4 text-lg font-medium">Order Summary</h2>
            {#each cartStore.cart?.items ?? [] as item}
                <div class="mb-2 flex justify-between">
                    <span>{item.title} × {item.quantity}</span>
                    <span>{((item.subtotal ?? 0) / 100).toFixed(2)}</span>
                </div>
            {/each}
            <div class="mt-4 border-t pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>{cartStore.total.toFixed(2)}</span>
            </div>
            <button
                onclick={placeOrder}
                disabled={loading}
                class="mt-6 w-full rounded bg-black py-3 text-white disabled:opacity-50"
            >
                {loading ? 'Placing order...' : 'Place Order'}
            </button>
        </section>
    {/if}
</div>
```

**Step 2: Create order confirmation page**

Create the directory and file:
```bash
mkdir -p /home/niko/hubs/hubs-frontend/src/routes/orders/\[orderId\]
```

Create `src/routes/orders/[orderId]/+page.svelte`:

```svelte
<script lang="ts">
    import { page } from '$app/state';
    const orderId = $derived(page.params.orderId);
</script>

<div class="mx-auto max-w-2xl px-4 py-24 text-center">
    <h1 class="mb-4 text-3xl font-semibold">Order Confirmed!</h1>
    <p class="mb-2 text-gray-600">Thank you for your order.</p>
    <p class="text-sm text-gray-400">Order ID: {orderId}</p>
    <a href="/" class="mt-8 inline-block rounded bg-black px-6 py-3 text-white">Continue Shopping</a>
</div>
```

**Step 3: Verify checkout flow**

1. Add product to cart
2. Go to `/cart` → click checkout
3. Enter email → continue
4. Enter address → continue
5. Select shipping option → continue
6. Review → place order
7. Should redirect to `/orders/[id]`

If no shipping options appear in step 4, verify a shipping option exists in Medusa admin → Settings → Shipping.

**Step 4: Commit**

```bash
cd /home/niko/hubs/hubs-frontend
git add src/routes/cart/check-out/ src/routes/orders/
git commit -m "feat: implement checkout flow (email, address, shipping, order complete)"
```

---

## Task 12: Debug Auth Flow

Auth (login/register) connects to Medusa but hasn't been tested. Verify and fix.

**Files to check:**
- `src/lib/stores/customer.svelte.ts`
- `src/routes/auth/login/+page.svelte`
- `src/routes/auth/register/+page.svelte`

**Step 1: Test login**

1. Create a test customer in Medusa admin (Customers → Create)
2. Go to `/auth/login` in the browser
3. Enter credentials → submit
4. If it fails, check browser Network tab for the API response from `localhost:9000/auth/customer/emailpass`
5. Common issues:
   - Auth CORS error → check `.env` `AUTH_CORS` in Medusa backend
   - 401 from Medusa → credentials wrong or customer not in DB
   - Cookie not set → check `cookieOptions.sameSite` in `medusa-config.ts` (set to `'lax'`, is correct)

**Step 2: Test register**

The register flow uses `phone-auth` provider which is commented out in `medusa-config.ts`. There's also a `registerLegacy()` method. Check `src/routes/auth/register/+page.svelte` — if it calls `register()` (phone-auth), it will fail. Temporarily update to call `registerLegacy()` until phone-auth is re-enabled.

In `customer.svelte.ts`, the `registerLegacy` method:
```typescript
async registerLegacy(email: string, password: string, firstName: string, lastName: string) {
    // Uses emailpass provider
}
```

**Step 3: Verify customer appears in checkout**

After login, go to checkout — email field should be pre-filled with `customerStore.customer.email`.

**Step 4: Commit any fixes**

```bash
cd /home/niko/hubs/hubs-frontend
git add src/lib/stores/customer.svelte.ts src/routes/auth/
git commit -m "fix: debug and fix auth flow against Medusa"
```

---

## Task 13: Final Cleanup

**Step 1: Check for remaining Strapi product queries**

```bash
grep -rn "strapi" src/routes/ --include="*.ts" --include="*.svelte" | grep -v "header\|layout\|strapi-generated\|strapi.ts"
```

Any Strapi query for products (not header/CMS) should now be gone.

**Step 2: Check for remaining localCartStore usage in routes**

```bash
grep -rn "localCartStore" src/routes/ --include="*.ts" --include="*.svelte"
```

Should return no results.

**Step 3: Verify environment**

```bash
grep -rn "localhost:9001" src/ .env
```

Should return no results.

**Step 4: Run type checking**

```bash
npm run check
```

Fix any TypeScript errors before completing.

**Step 5: Final commit**

```bash
cd /home/niko/hubs/hubs-frontend
git add .
git commit -m "chore: final cleanup after Medusa integration"
```

---

## Verification Checklist

Before calling the integration complete, verify manually:

- [ ] Products appear on `/products/all`
- [ ] Category filter on `/products/[category]` shows filtered products
- [ ] Product detail page loads at `/products/[cat]/[subcat]/[handle]`
- [ ] Fan-shop page shows Medusa products
- [ ] Homepage featured products show from Medusa
- [ ] "Add to Cart" on product listing works (header count updates)
- [ ] Cart page shows items with correct prices
- [ ] Quantity update and remove work on cart page
- [ ] Checkout flow completes: email → address → shipping → order
- [ ] Order confirmation page shows
- [ ] Login works at `/auth/login`
- [ ] No console errors about `localCartStore` or Strapi product queries
