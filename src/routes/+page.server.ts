import { sdk } from '$lib/sdk';
import { medusaProductToCard } from '$lib/types/medusa-adapter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const { regions } = await sdk.store.region.list();
        const regionId = regions?.[0]?.id;

        const { products } = await sdk.store.product.list({
            limit: 12,
            region_id: regionId,
            fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
        } as any);

        const mapped = (products ?? []).map(medusaProductToCard);
        return {
            products: mapped,
        };
    } catch (error) {
        console.error('Error fetching home page products from Medusa:', error);
        return { products: [] };
    }
};
