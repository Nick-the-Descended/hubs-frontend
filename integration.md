# MedusaJS + SvelteKit Storefront Setup Guide

## Part 1: Initial Project Setup

### Prerequisites

- SvelteKit project with Svelte 5 installed ✓
- Tailwind CSS configured ✓
- Node.js 18+ installed ✓
- Running Medusa backend (v2.x) ✓

### Step 1: Install Medusa JS SDK

**Yes, you need the Medusa SDK.** It's the official way to interact with your Medusa backend API.

```bash
npm install @medusajs/js-sdk@latest @medusajs/types@latest
```

**What these packages do:**

- `@medusajs/js-sdk`: Provides typed methods for all Medusa API endpoints
- `@medusajs/types`: TypeScript types for Medusa entities (Product, Cart, Order, etc.)

### Step 2: Configure Environment Variables

Create `.env` file:

```bash
# .env
PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key_here
```

**How to get the Publishable Key:** ✓

1. Navigate to your Medusa Admin dashboard
2. Go to Settings → Publishable API Keys
3. Create a new key or copy an existing one

📚 **Reference:** [Publishable API Keys Documentation](https://docs.medusajs.com/resources/js-sdk#publishablekey)

### Step 3: Create SDK Configuration

Create `src/lib/config/medusa.ts`:

```typescript
import Medusa from '@medusajs/js-sdk';
import {
    PUBLIC_MEDUSA_BACKEND_URL,
    PUBLIC_MEDUSA_PUBLISHABLE_KEY
} from '$env/static/public';

export const sdk = new Medusa({
    baseUrl: PUBLIC_MEDUSA_BACKEND_URL,
    debug: import.meta.env.DEV,
    publishableKey: PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    auth: {
        type: 'session'
    }
});
```

**Configuration Options Explained:**

- `baseUrl`: Your Medusa backend URL
- `debug`: Enable detailed logging in development
- `publishableKey`: Required for storefront API access
- `auth.type`: Use `'session'` for cookie-based auth or `'jwt'` for token-based

📚 **Reference:** [JS SDK Configuration](https://docs.medusajs.com/resources/js-sdk#setup-js-sdk)

### Step 4: Create Type Definitions (Optional but Recommended)

Create `src/lib/types/medusa.ts`:

```typescript
import type {
    StoreProduct,
    StoreCart,
    StoreRegion,
    StoreCollection,
    StoreProductCategory
} from '@medusajs/types';

export type {
    StoreProduct,
    StoreCart,
    StoreRegion,
    StoreCollection,
    StoreProductCategory
};

// Extend types if needed
export interface ExtendedProduct extends StoreProduct {
    // Add custom fields here
}
```

### Step 5: Project Structure

Organize your project like this:

```
src/
├── lib/
│   ├── config/
│   │   └── medusa.ts          # SDK configuration
│   ├── stores/                # Svelte stores (cart, customer, etc.)
│   ├── types/                 # TypeScript types
│   └── utils/                 # Helper functions
├── routes/
│   ├── +layout.svelte         # Root layout with cart initialization
│   ├── +page.svelte           # Homepage
│   ├── products/
│   │   └── [handle]/          # Product detail pages
│   ├── cart/                  # Cart page
│   ├── checkout/              # Checkout flow
│   └── account/               # Customer account
└── components/
    ├── product/               # Product-related components
    ├── cart/                  # Cart components
    └── ui/                    # Reusable UI components
```

### Step 6: Global Cart Store Setup

Create `src/lib/stores/cart.svelte.ts` (using Svelte 5 runes):

```typescript
import { sdk } from '$lib/config/medusa';
import type { StoreCart } from '@medusajs/types';

class CartStore {
    cart = $state<StoreCart | null>(null);
    loading = $state(false);
    error = $state<string | null>(null);

    get itemCount() {
        return (
            this.cart?.items?.reduce(
                (sum, item) => sum + item.quantity,
                0
            ) ?? 0
        );
    }

    get total() {
        return this.cart?.total ? this.cart.total / 100 : 0;
    }

    async initialize() {
        this.loading = true;
        try {
            const cartId = this.getCartId();

            if (cartId) {
                const { cart } = await sdk.store.cart.retrieve(cartId);
                this.cart = cart;
            } else {
                await this.create();
            }
        } catch (err) {
            console.error('Failed to initialize cart:', err);
            await this.create();
        } finally {
            this.loading = false;
        }
    }

    async create() {
        const { cart } = await sdk.store.cart.create({
            region_id: 'your_region_id' // You'll need to fetch this dynamically
        });
        this.cart = cart;
        this.setCartId(cart.id);
    }

    async addItem(variantId: string, quantity: number) {
        if (!this.cart) return;

        this.loading = true;
        try {
            const { cart } = await sdk.store.cart.createLineItem(
                this.cart.id,
                {
                    variant_id: variantId,
                    quantity
                }
            );
            this.cart = cart;
        } catch (err: any) {
            this.error = err.message;
            throw err;
        } finally {
            this.loading = false;
        }
    }

    async updateItem(lineItemId: string, quantity: number) {
        if (!this.cart) return;

        this.loading = true;
        try {
            const { cart } = await sdk.store.cart.updateLineItem(
                this.cart.id,
                lineItemId,
                { quantity }
            );
            this.cart = cart;
        } finally {
            this.loading = false;
        }
    }

    async removeItem(lineItemId: string) {
        if (!this.cart) return;

        this.loading = true;
        try {
            const { cart } = await sdk.store.cart.deleteLineItem(
                this.cart.id,
                lineItemId
            );
            this.cart = cart;
        } finally {
            this.loading = false;
        }
    }

    private getCartId(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('medusa_cart_id');
    }

    private setCartId(id: string) {
        if (typeof window === 'undefined') return;
        localStorage.setItem('medusa_cart_id', id);
    }
}

export const cartStore = new CartStore();
```

### Step 7: Initialize Cart in Root Layout

Update `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import { cartStore } from '$lib/stores/cart.svelte';
    import '../app.css'; // Your Tailwind CSS

    let { children } = $props();

    onMount(() => {
        cartStore.initialize();
    });
</script>

<div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
        <nav
            class="container mx-auto flex items-center justify-between px-4 py-4"
        >
            <a href="/" class="text-2xl font-bold">My Store</a>
            <a href="/cart" class="relative">
                Cart ({cartStore.itemCount})
            </a>
        </nav>
    </header>

    <main class="container mx-auto px-4 py-8">
        {@render children()}
    </main>
</div>
```

---

## Part 2: Module Integration Guides

### Understanding Medusa Modules

Medusa v2 has two types of modules:

1. **Out-of-the-box Modules**: Pre-installed core modules (Product, Cart, Order, Customer, etc.)
2. **Custom Modules**: Your own business logic or third-party integrations

**Key Difference for Frontend:**

- Out-of-the-box modules have existing SDK methods
- Custom modules require you to create custom API routes and fetch them manually

---

### Module 1: Product Module (Out-of-the-Box)

The Product module handles all product-related operations.

#### List Products

Create `src/routes/products/+page.server.ts`:

```typescript
import { sdk } from '$lib/config/medusa';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const { products } = await sdk.store.product.list({
            limit: 20,
            fields: '+variants.calculated_price'
        });

        return {
            products
        };
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return {
            products: []
        };
    }
};
```

Create `src/routes/products/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {#each data.products as product}

      href="/products/{product.handle}"
      class="bg-white rounded-lg shadow hover:shadow-lg transition"
    >
      {#if product.thumbnail}
        <img
          src={product.thumbnail}
          alt={product.title}
          class="w-full h-48 object-cover rounded-t-lg"
        />
      {/if}
      <div class="p-4">
        <h3 class="font-semibold text-lg">{product.title}</h3>
        <p class="text-gray-600 mt-2">
          ${(product.variants[0].calculated_price?.calculated_amount / 100).toFixed(2)}
        </p>
      </div>
    </a>
  {/each}
</div>
```

#### Product Detail Page

Create `src/routes/products/[handle]/+page.server.ts`:

```typescript
import { sdk } from '$lib/config/medusa';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const { products } = await sdk.store.product.list({
            handle: params.handle,
            fields: '+variants.calculated_price,+variants.inventory_quantity'
        });

        if (!products.length) {
            throw error(404, 'Product not found');
        }

        return {
            product: products[0]
        };
    } catch (err: any) {
        throw error(404, err.message);
    }
};
```

Create `src/routes/products/[handle]/+page.svelte`:

```svelte
<script lang="ts">
    import { cartStore } from '$lib/stores/cart.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let selectedVariant = $state(data.product.variants[0]);
    let quantity = $state(1);
    let adding = $state(false);

    async function addToCart() {
        adding = true;
        try {
            await cartStore.addItem(selectedVariant.id, quantity);
            alert('Added to cart!');
        } catch (err) {
            alert('Failed to add to cart');
        } finally {
            adding = false;
        }
    }
</script>

<div class="grid gap-8 md:grid-cols-2">
    <!-- Product Images -->
    <div>
        {#if data.product.thumbnail}
            <img
                src={data.product.thumbnail}
                alt={data.product.title}
                class="w-full rounded-lg"
            />
        {/if}
    </div>

    <!-- Product Info -->
    <div>
        <h1 class="text-3xl font-bold">{data.product.title}</h1>
        <p class="mt-4 text-2xl font-semibold">
            ${(
                selectedVariant.calculated_price?.calculated_amount / 100
            ).toFixed(2)}
        </p>
        <p class="mt-4 text-gray-600">{data.product.description}</p>

        {#if data.product.variants.length > 1}
            <div class="mt-6">
                <label class="mb-2 block text-sm font-medium"
                    >Select Variant</label
                >
                <select
                    bind:value={selectedVariant}
                    class="w-full rounded-lg border px-4 py-2"
                >
                    {#each data.product.variants as variant}
                        <option value={variant}>
                            {variant.title} - ${(
                                variant.calculated_price
                                    ?.calculated_amount / 100
                            ).toFixed(2)}
                        </option>
                    {/each}
                </select>
            </div>
        {/if}

        <div class="mt-6">
            <label class="mb-2 block text-sm font-medium">Quantity</label>
            <input
                type="number"
                bind:value={quantity}
                min="1"
                class="rounded-lg border px-4 py-2"
            />
        </div>

        <button
            onclick={addToCart}
            disabled={adding}
            class="mt-6 w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
            {adding ? 'Adding...' : 'Add to Cart'}
        </button>
    </div>
</div>
```

📚 **Reference:** [Product API Documentation](https://docs.medusajs.com/resources/js-sdk)

---

### Module 2: Cart Module (Out-of-the-Box)

The Cart module is already set up in your cart store. Here's the cart page implementation:

Create `src/routes/cart/+page.svelte`:

```svelte
<script lang="ts">
  import { cartStore } from '$lib/stores/cart.svelte';

  async function updateQuantity(lineItemId: string, quantity: number) {
    if (quantity < 1) return;
    await cartStore.updateItem(lineItemId, quantity);
  }

  async function removeItem(lineItemId: string) {
    if (confirm('Remove this item?')) {
      await cartStore.removeItem(lineItemId);
    }
  }
</script>

<div class="max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

  {#if cartStore.loading}
    <p>Loading cart...</p>
  {:else if !cartStore.cart || cartStore.cart.items.length === 0}
    <p>Your cart is empty</p>
    <a href="/products" class="text-blue-600 hover:underline">Continue Shopping</a>
  {:else}
    <div class="space-y-4">
      {#each cartStore.cart.items as item}
        <div class="flex gap-4 bg-white p-4 rounded-lg shadow">
          {#if item.thumbnail}
            <img
              src={item.thumbnail}
              alt={item.title}
              class="w-24 h-24 object-cover rounded"
            />
          {/if}

          <div class="flex-1">
            <h3 class="font-semibold">{item.title}</h3>
            <p class="text-gray-600">{item.variant?.title}</p>
            <p class="text-lg font-semibold mt-2">
              ${(item.unit_price / 100).toFixed(2)}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="number"
              value={item.quantity}
              onchange={(e) => updateQuantity(item.id, parseInt(e.currentTarget.value))}
              min="1"
              class="w-20 border rounded px-2 py-1"
            />
            <button
              onclick={() => removeItem(item.id)}
              class="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-8 bg-white p-6 rounded-lg shadow">
      <div class="flex justify-between text-xl font-bold">
        <span>Total:</span>
        <span>${cartStore.total.toFixed(2)}</span>
      </div>

        href="/checkout"
        class="block mt-4 w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700"
      >
        Proceed to Checkout
      </a>
    </div>
  {/if}
</div>
```

---

### Module 3: Region Module (Out-of-the-Box)

Regions define pricing, currencies, and shipping options. Fetch regions to initialize your cart properly.

Create `src/lib/stores/region.svelte.ts`:

```typescript
import { sdk } from '$lib/config/medusa';
import type { StoreRegion } from '@medusajs/types';

class RegionStore {
    regions = $state<StoreRegion[]>([]);
    selectedRegion = $state<StoreRegion | null>(null);
    loading = $state(false);

    async initialize() {
        this.loading = true;
        try {
            const { regions } = await sdk.store.region.list();
            this.regions = regions;

            // Auto-select first region or use user's country
            this.selectedRegion = regions[0] || null;
        } finally {
            this.loading = false;
        }
    }

    setRegion(region: StoreRegion) {
        this.selectedRegion = region;
        // You might want to recreate the cart with the new region
    }
}

export const regionStore = new RegionStore();
```

Update your cart store to use the region:

```typescript
// In cart.svelte.ts
async create() {
  const { cart } = await sdk.store.cart.create({
    region_id: regionStore.selectedRegion?.id || 'default_region_id'
  });
  this.cart = cart;
  this.setCartId(cart.id);
}
```

---

### Module 4: Customer Module (Out-of-the-Box)

Handle customer authentication and account management.

Create `src/lib/stores/customer.svelte.ts`:

```typescript
import { sdk } from '$lib/config/medusa';
import type { StoreCustomer } from '@medusajs/types';

class CustomerStore {
    customer = $state<StoreCustomer | null>(null);
    loading = $state(false);
    isAuthenticated = $derived(this.customer !== null);

    async login(email: string, password: string) {
        this.loading = true;
        try {
            await sdk.auth.login('customer', 'emailpass', {
                email,
                password
            });
            await this.fetchCustomer();
        } finally {
            this.loading = false;
        }
    }

    async register(
        email: string,
        password: string,
        firstName: string,
        lastName: string
    ) {
        this.loading = true;
        try {
            await sdk.store.customer.create({
                email,
                password,
                first_name: firstName,
                last_name: lastName
            });
            await this.login(email, password);
        } finally {
            this.loading = false;
        }
    }

    async logout() {
        await sdk.auth.logout();
        this.customer = null;
    }

    async fetchCustomer() {
        try {
            const { customer } = await sdk.store.customer.retrieve();
            this.customer = customer;
        } catch (err) {
            this.customer = null;
        }
    }
}

export const customerStore = new CustomerStore();
```

Create login page `src/routes/login/+page.svelte`:

```svelte
<script lang="ts">
    import { customerStore } from '$lib/stores/customer.svelte';
    import { goto } from '$app/navigation';

    let email = $state('');
    let password = $state('');
    let error = $state('');

    async function handleLogin() {
        try {
            await customerStore.login(email, password);
            goto('/account');
        } catch (err: any) {
            error = err.message;
        }
    }
</script>

<div class="mx-auto max-w-md rounded-lg bg-white p-8 shadow">
    <h1 class="mb-6 text-2xl font-bold">Login</h1>

    {#if error}
        <div class="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>
    {/if}

    <form onsubmit={handleLogin}>
        <div class="mb-4">
            <label class="mb-2 block text-sm font-medium">Email</label>
            <input
                type="email"
                bind:value={email}
                required
                class="w-full rounded-lg border px-4 py-2"
            />
        </div>

        <div class="mb-6">
            <label class="mb-2 block text-sm font-medium">Password</label>
            <input
                type="password"
                bind:value={password}
                required
                class="w-full rounded-lg border px-4 py-2"
            />
        </div>

        <button
            type="submit"
            disabled={customerStore.loading}
            class="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
        >
            {customerStore.loading ? 'Logging in...' : 'Login'}
        </button>
    </form>

    <p class="mt-4 text-center">
        Don't have an account?
        <a href="/register" class="text-blue-600 hover:underline"
            >Register</a
        >
    </p>
</div>
```

📚 **Reference:** [Authentication Documentation](https://docs.medusajs.com/resources/js-sdk#authtype)

---

### Module 5: Order Module (Out-of-the-Box)

Complete the checkout and create orders.

Create `src/routes/checkout/+page.svelte`:

```svelte
<script lang="ts">
    import { cartStore } from '$lib/stores/cart.svelte';
    import { customerStore } from '$lib/stores/customer.svelte';
    import { sdk } from '$lib/config/medusa';
    import { goto } from '$app/navigation';

    let email = $state('');
    let shippingAddress = $state({
        first_name: '',
        last_name: '',
        address_1: '',
        city: '',
        country_code: 'us',
        postal_code: '',
        phone: ''
    });

    let submitting = $state(false);

    async function handleCheckout(e: Event) {
        e.preventDefault();
        if (!cartStore.cart) return;

        submitting = true;
        try {
            const cartId = cartStore.cart.id;

            // 1. Update cart with email
            await sdk.store.cart.update(cartId, {
                email: customerStore.customer?.email || email
            });

            // 2. Add shipping address
            await sdk.store.cart.update(cartId, {
                shipping_address: shippingAddress
            });

            // 3. List and add shipping method
            const { shipping_options } =
                await sdk.store.fulfillment.listShippingOptionsForCart(
                    cartId
                );

            if (shipping_options.length > 0) {
                await sdk.store.cart.addShippingMethod(cartId, {
                    option_id: shipping_options[0].id
                });
            }

            // 4. Complete cart (creates order)
            const { order } = await sdk.store.cart.complete(cartId);

            // 5. Clear cart and redirect
            localStorage.removeItem('medusa_cart_id');
            goto(`/order/${order.id}`);
        } catch (err: any) {
            alert(`Checkout failed: ${err.message}`);
        } finally {
            submitting = false;
        }
    }
</script>

<div class="mx-auto max-w-2xl">
    <h1 class="mb-8 text-3xl font-bold">Checkout</h1>

    <form onsubmit={handleCheckout} class="space-y-6">
        {#if !customerStore.isAuthenticated}
            <div>
                <label class="mb-2 block text-sm font-medium">Email</label>
                <input
                    type="email"
                    bind:value={email}
                    required
                    class="w-full rounded-lg border px-4 py-2"
                />
            </div>
        {/if}

        <div>
            <h2 class="mb-4 text-xl font-semibold">Shipping Address</h2>
            <div class="grid grid-cols-2 gap-4">
                <input
                    bind:value={shippingAddress.first_name}
                    placeholder="First Name"
                    required
                    class="rounded-lg border px-4 py-2"
                />
                <input
                    bind:value={shippingAddress.last_name}
                    placeholder="Last Name"
                    required
                    class="rounded-lg border px-4 py-2"
                />
                <input
                    bind:value={shippingAddress.address_1}
                    placeholder="Address"
                    required
                    class="col-span-2 rounded-lg border px-4 py-2"
                />
                <input
                    bind:value={shippingAddress.city}
                    placeholder="City"
                    required
                    class="rounded-lg border px-4 py-2"
                />
                <input
                    bind:value={shippingAddress.postal_code}
                    placeholder="Postal Code"
                    required
                    class="rounded-lg border px-4 py-2"
                />
                <input
                    bind:value={shippingAddress.phone}
                    placeholder="Phone"
                    type="tel"
                    class="col-span-2 rounded-lg border px-4 py-2"
                />
            </div>
        </div>

        <button
            type="submit"
            disabled={submitting}
            class="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
            {submitting
                ? 'Processing...'
                : `Complete Order - $${cartStore.total.toFixed(2)}`}
        </button>
    </form>
</div>
```

---

### Module 6: Custom Modules

Custom modules don't have SDK methods built-in. You need to create custom API routes in your Medusa backend and fetch them from your storefront.

#### Backend: Create Custom API Route

In your Medusa backend, create `src/api/store/custom-data/route.ts`:

```typescript
import type {
    MedusaRequest,
    MedusaResponse
} from '@medusajs/framework/http';

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    // Your custom logic here
    const customData = {
        message: 'Hello from custom module',
        data: []
    };

    res.json(customData);
}
```

📚 **Reference:** [Custom API Routes](https://docs.medusajs.com/learn/fundamentals/api-routes)

#### Storefront: Fetch Custom Data

Create `src/lib/api/custom.ts`:

```typescript
import { PUBLIC_MEDUSA_BACKEND_URL } from '$env/static/public';

export async function fetchCustomData() {
    const response = await fetch(
        `${PUBLIC_MEDUSA_BACKEND_URL}/store/custom-data`,
        {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch custom data');
    }

    return response.json();
}
```

Use in your page:

```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import { fetchCustomData } from '$lib/api/custom';

    let customData = $state(null);

    onMount(async () => {
        customData = await fetchCustomData();
    });
</script>
```

**Key Difference:** Custom modules require manual fetch calls since there are no SDK methods. Always include `credentials: 'include'` for authenticated requests.

---

## Additional Resources

📚 **Official Documentation:**

- [MedusaJS Documentation](https://docs.medusajs.com)
- [JS SDK Reference](https://docs.medusajs.com/resources/js-sdk)
- [Medusa v2 Storefront Guide](https://docs.medusajs.com/docs/learn)

🎯 **Next Steps:**

1. Implement payment provider integration (Stripe, PayPal)
2. Add product search and filtering
3. Implement customer order history
4. Add product reviews (custom module)
5. Optimize with SvelteKit's SSR capabilities

Need help with any specific module or feature? Let me know!
