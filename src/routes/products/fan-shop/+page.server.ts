import { sdk } from '$lib/sdk';
import { strapi } from '$lib/strapi';
import { medusaProductToCard } from '$lib/types/medusa-adapter';
import type { PageServerLoad } from './$types';
import type { ProductCardItem } from '$lib/types/medusa-adapter';

interface FanShopMainContent {
    Title: string;
    SeeMore: string;
    Image: { url: string };
    Collection: string;
}

const PAGE_SIZE = 8;

export const load: PageServerLoad = async ({ parent }) => {
    const { header } = await parent();

    // Fetch CMS content from Strapi
    let fanShopCms: { mainContent: FanShopMainContent | null } = { mainContent: null };
    try {
        const fanShopData = await strapi.findSingle<{ main_content: FanShopMainContent }>('fanshop', {
            fields: ['main_content { Title SeeMore Image { url } Collection }'],
        });
        if (fanShopData) {
            fanShopCms = { mainContent: fanShopData.main_content ?? null };
        }
    } catch (err) {
        console.error('Error fetching fan shop CMS data from Strapi:', err);
    }

    const collectionHandle = fanShopCms.mainContent?.Collection ?? 'fan-shop';

    // Fetch products from Medusa by collection
    let products: ProductCardItem[] = [];
    try {
        const [{ collections }, { regions }] = await Promise.all([
            sdk.store.collection.list({ handle: collectionHandle } as any),
            sdk.store.region.list(),
        ]);
        const collectionId = collections?.[0]?.id ?? null;
        const regionId = regions?.[0]?.id;
        if (collectionId) {
            const { products: medusaProducts } = await sdk.store.product.list({
                limit: PAGE_SIZE,
                region_id: regionId,
                fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
                collection_id: collectionId,
            } as any);
            products = (medusaProducts ?? []).map(medusaProductToCard);
        }
    } catch (err) {
        console.error('Error fetching fan shop products from Medusa:', err);
    }

    return {
        fanShopCms,
        products,
        navigationItems: header?.navigationItems ?? [],
    };
};
