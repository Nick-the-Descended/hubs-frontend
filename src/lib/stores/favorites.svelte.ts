import { sdk } from '$lib/sdk';

interface WishlistItem {
    id: string;
    product_id: string;
}

interface WishlistResponse {
    wishlist: { id: string; items: WishlistItem[] } | null;
}

class FavoritesStore {
    items = $state<WishlistItem[]>([]);
    loading = $state(false);
    initialized = $state(false);

    get productIds() {
        return this.items.map((i) => i.product_id);
    }

    isFavorite(productId: string) {
        return this.productIds.includes(productId);
    }

    async initialize() {
        if (this.initialized) return;
        this.loading = true;
        try {
            const data = await sdk.client.fetch<WishlistResponse>('/store/wishlist');
            this.items = data.wishlist?.items ?? [];
            this.initialized = true;
        } catch {
            this.items = [];
        } finally {
            this.loading = false;
        }
    }

    async toggle(productId: string) {
        const existing = this.items.find((i) => i.product_id === productId);
        this.loading = true;
        try {
            if (existing) {
                const data = await sdk.client.fetch<WishlistResponse>(
                    `/store/wishlist/items/${existing.id}`,
                    { method: 'DELETE' }
                );
                this.items = data.wishlist?.items ?? [];
            } else {
                const data = await sdk.client.fetch<WishlistResponse>('/store/wishlist/items', {
                    method: 'POST',
                    body: { product_id: productId },
                });
                this.items = data.wishlist?.items ?? [];
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
        } finally {
            this.loading = false;
        }
    }

    reset() {
        this.items = [];
        this.initialized = false;
    }
}

export const favoritesStore = new FavoritesStore();
