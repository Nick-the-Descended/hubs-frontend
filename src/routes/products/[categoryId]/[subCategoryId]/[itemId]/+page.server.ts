import { sdk } from '$lib/sdk';
import { error } from '@sveltejs/kit';
import type { StoreProduct } from '@medusajs/types';
import { medusaProductToDetail, type MedusaProductDetail } from '$lib/types/medusa-adapter';
import type { PageServerLoad } from './$types';

export type { MedusaProductDetail };

export const load: PageServerLoad = async ({ params, parent }) => {
    await parent();

    try {
        const { regions } = await sdk.store.region.list();
        const regionId = regions?.[0]?.id;

        const { products } = await sdk.store.product.list({
            handle: params.itemId,
            region_id: regionId,
            fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
        } as any);

        const product = products?.[0] as StoreProduct | undefined;
        if (!product) throw error(404, 'Product not found');

        return {
            product: medusaProductToDetail(product),
            categoryId: params.categoryId,
            subCategoryId: params.subCategoryId,
        };
    } catch (err: any) {
        if (err.status === 404) throw err;
        console.error('Error fetching product from Medusa:', err);
        return { product: null, categoryId: params.categoryId, subCategoryId: params.subCategoryId };
    }
};
