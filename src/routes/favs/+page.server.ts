import { sdk } from '$lib/sdk';
import { medusaProductToCard, type ProductCardItem } from '$lib/types/medusa-adapter';
import type { PageServerLoad } from './$types';
import type { StoreProduct } from '@medusajs/types';

// Fetches product details for a list of product IDs.
// Called from the client via SvelteKit's invalidate/load cycle is not possible here
// because we need the customer's JWT for wishlist — handled client-side instead.
// This load only runs if product IDs are passed as a query param (used for SSR pre-fill).
export const load: PageServerLoad = async ({ url }) => {
    const idsParam = url.searchParams.get('ids');
    if (!idsParam) return { products: [] as ProductCardItem[] };

    const productIds = idsParam.split(',').filter(Boolean);
    if (productIds.length === 0) return { products: [] as ProductCardItem[] };

    try {
        const { regions } = await sdk.store.region.list();
        const regionId = regions?.[0]?.id;

        const { products: medusaProducts } = await sdk.store.product.list({
            id: productIds,
            region_id: regionId,
            fields: '+variants.calculated_price,+categories,+images',
            limit: productIds.length,
        } as any);

        const favoriteSet = new Set(productIds);
        const products: ProductCardItem[] = (medusaProducts as StoreProduct[]).map((p) => ({
            ...medusaProductToCard(p),
            isFavourite: favoriteSet.has(p.id),
        }));

        return { products };
    } catch (err) {
        console.error('Failed to load favorite products:', err);
        return { products: [] as ProductCardItem[] };
    }
};
