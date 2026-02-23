# Frontend ↔ Medusa Integration Design

**Date**: 2026-02-23
**Status**: Approved

## Goal

Wire the SvelteKit frontend fully to the Medusa v2 backend for products, cart, and checkout. Strapi stays as a CMS-only backend (header navigation, banners, promotions) but the frontend never queries Strapi for product or commerce data. All commerce communication goes through Medusa.

## Architecture

### Data ownership

| Data | Source |
|------|--------|
| Products, variants, categories | Medusa |
| Cart, orders | Medusa |
| Authentication (email/pass) | Medusa |
| Header navigation, banners, CMS content | Strapi (server-side only, never browser) |

### URL structure (preserved)

- `/products/all` — all products, no category filter
- `/products/[categoryId]` — filter by Medusa product category handle
- `/products/[categoryId]/[subCategoryId]` — filter by subcategory handle
- `/products/[categoryId]/[subCategoryId]/[itemId]` — product detail by handle
- `/products/fan-shop` — maps to a "fan-shop" Medusa product category

### Medusa prerequisites (admin setup)

Before frontend integration works, these must exist in Medusa admin:

1. A **Region** (e.g., Georgia / GEL)
2. A **Sales Channel** (default exists after seed)
3. **Publishable API Key** assigned to the sales channel — must match `PUBLIC_MEDUSA_PUBLISHABLE_KEY`
4. **Product categories** with handles matching URL slugs (e.g., `fan-shop`, etc.)

---

## Phase 1: Environment & SDK Fix

**Files changed:**
- `hubs-frontend/.env` — fix `PUBLIC_MEDUSA_BACKEND_URL` from `localhost:9001` to `localhost:9000`

**Verification:**
- `sdk.store.region.list()` returns the region created in admin
- `sdk.store.product.list()` returns products

---

## Phase 2: Product Catalog

### Product listing (`+page.server.ts`)

Replace Strapi GraphQL with Medusa SDK calls:

```ts
const { products, count } = await sdk.store.product.list({
  category_handle: [categoryId === 'all' ? undefined : categoryId],
  limit: 12,
  offset: (page - 1) * 12,
  fields: '+variants.calculated_price',
}, { next: { tags: ['products'] } });
```

### Data adapter

Create `src/lib/types/medusa-adapter.ts` with a `medusaProductToCard()` function that maps `StoreProduct` → the shape expected by `ProductsGrid` and `ProductCard` components. This isolates the mismatch in one place so components don't need to change.

### Product detail (`[itemId]/+page.server.ts`)

```ts
const { products } = await sdk.store.product.list({ handle: itemId });
const product = products[0];
```

Variants are displayed as selectable options (size, color). Selecting a variant resolves to a `variant_id` for cart operations.

---

## Phase 3: Cart Integration

### Changes

- Remove `localCartStore` from product-facing pages; use `cartStore` everywhere
- Homepage add-to-cart: needs `variant_id` (default to first variant if unambiguous; otherwise open variant picker)
- Cart page (`/cart`): rewrite to render from `cartStore.cart.items` instead of `localCartStore.items`
- Header cart count: switch to `cartStore.itemCount`

### Cart store

`src/lib/stores/cart.svelte.ts` is already wired to Medusa. The `initialize()` must pass the region's sales channel or a valid `region_id`. Investigate and fix any bugs found during testing.

---

## Phase 4: Checkout (Simplified)

Checkout page (`/cart/check-out`) is a stub. Build it with:

1. **Email** — pre-filled if customer is logged in
2. **Shipping address form** — country, city, address fields
3. **Shipping method selector** — `sdk.store.fulfillment.listCartOptions({ cart_id })`
4. **Manual payment** — `sdk.store.payment.initiatePaymentSession(cart_id, { provider_id: 'manual' })`
5. **Complete** — `sdk.store.cart.complete(cartId)` → redirects to order confirmation page

Medusa checkout flow:
```
cart.update({ email })
  → cart.update({ shipping_address })
  → fulfillment.listCartOptions → cart.addShippingMethod
  → payment.initiatePaymentSession
  → cart.complete
  → redirect /orders/[orderId]
```

Payment providers beyond `manual` (Stripe, etc.) are out of scope for now.

---

## Auth

Auth (`customerStore`) is already implemented with email/password. Needs testing and debugging — auth flow hasn't been verified against the live backend. No new features required.

---

## Files Changed (Summary)

| File | Change |
|------|--------|
| `.env` | Fix port 9001 → 9000 |
| `src/routes/products/[categoryId]/+page.server.ts` | Replace Strapi with Medusa SDK |
| `src/routes/products/[categoryId]/[subCategoryId]/+page.server.ts` | Replace Strapi with Medusa SDK |
| `src/routes/products/[categoryId]/[subCategoryId]/[itemId]/+page.server.ts` | Replace Strapi with Medusa SDK |
| `src/lib/types/medusa-adapter.ts` | New: product shape adapter |
| `src/routes/+page.svelte` (homepage) | Switch add-to-cart to cartStore |
| `src/routes/cart/+page.svelte` | Switch from localCartStore to cartStore |
| `src/routes/cart/check-out/+page.svelte` | Build out checkout flow |
| `src/lib/stores/cart.svelte.ts` | Fix any bugs found during testing |
| `src/lib/stores/customer.svelte.ts` | Fix any bugs found during testing |
