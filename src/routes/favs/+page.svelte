<script lang="ts">
    import { sdk } from '$lib/sdk';
    import { favoritesStore } from '$lib/stores/favorites.svelte';
    import { medusaProductToCard, type ProductCardItem } from '$lib/types/medusa-adapter';
    import * as ProductCard from '@/components/ui/product-card';
    import type { StoreProduct } from '@medusajs/types';

    let products = $state<ProductCardItem[]>([]);
    let loadingProducts = $state(false);

    $effect(() => {
        // Re-fetch product details whenever the wishlist items change
        const ids = favoritesStore.productIds;
        if (!favoritesStore.initialized) return;
        if (ids.length === 0) {
            products = [];
            return;
        }
        loadingProducts = true;
        sdk.store.region
            .list()
            .then(({ regions }) => {
                const regionId = regions?.[0]?.id;
                return sdk.store.product.list({
                    id: ids,
                    region_id: regionId,
                    fields: '+variants.calculated_price,+categories,+images',
                    limit: ids.length,
                } as any);
            })
            .then(({ products: medusaProducts }) => {
                const favoriteSet = new Set(ids);
                products = (medusaProducts as StoreProduct[]).map((p) => ({
                    ...medusaProductToCard(p),
                    isFavourite: favoriteSet.has(p.id),
                }));
            })
            .catch((err) => {
                console.error('Failed to load favorite products:', err);
            })
            .finally(() => {
                loadingProducts = false;
            });
    });
</script>

<div class="mx-auto max-w-7xl px-4 py-10">
    <h1 class="text-2xl font-bold text-gray-900 mb-8">My Favorites</h1>

    {#if favoritesStore.loading || loadingProducts}
        <div class="flex justify-center py-24">
            <svg class="h-8 w-8 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
        </div>
    {:else if products.length === 0}
        <div class="flex flex-col items-center justify-center py-24 text-center">
            <svg class="h-16 w-16 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <p class="text-gray-500 text-lg mb-2">No favorites yet</p>
            <p class="text-gray-400 text-sm mb-6">Browse products and tap the heart icon to save items here.</p>
            <a href="/products/all" class="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold">
                Browse Products
            </a>
        </div>
    {:else}
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {#each products as product (product.id)}
                {@const href = product.category
                    ? `/products/${product.category.slug}/${product.category.slug}/${product.slug}`
                    : `/products/all/all/${product.slug}`}
                <ProductCard.Root class="h-full w-full" {href}>
                    <ProductCard.Image
                        imageUrl={product.mainImage?.url ?? ''}
                        imageAlt={product.mainImage?.alternativeText ?? product.name}
                    />
                    {#if product.discountPercentage}
                        <ProductCard.Discount discountPercentage={product.discountPercentage} />
                    {/if}
                    <div class="flex flex-col gap-1 p-3">
                        <ProductCard.Title name={product.name} />
                        <ProductCard.Price
                            price={product.price}
                            discountedPrice={product.discountPrice}
                        />
                    </div>
                    <ProductCard.Actions
                        isFavorite={true}
                        onFavoriteClick={() => favoritesStore.toggle(product.id)}
                    />
                </ProductCard.Root>
            {/each}
        </div>
    {/if}
</div>
