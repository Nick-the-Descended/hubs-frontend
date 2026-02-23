import { sdk } from '$lib/sdk';
import { strapi, mapParaglideLocaleToStrapi } from '$lib/strapi';
import { getLocale } from '$lib/paraglide/runtime';
import { medusaProductToCard } from '$lib/types/medusa-adapter';
import type { PageServerLoad } from './$types';
import type { FanShop } from '$lib/types/strapi-generated';
import type { ProductCardItem } from '$lib/types/medusa-adapter';

const PAGE_SIZE = 8;

export const load: PageServerLoad = async ({ parent }) => {
    const { header } = await parent();

    // Fetch CMS content (banner) from Strapi
    let fanShopCms: { banner: FanShop['Banner'] | null; productListTitle: string | null; seeMore: string | null } = {
        banner: null, productListTitle: null, seeMore: null,
    };
    try {
        const locale = getLocale();
        const strapiLocale = mapParaglideLocaleToStrapi(locale);
        const fanShopData = await strapi.findSingle<FanShop>('fanShop', {
            locale: strapiLocale,
            fields: [
                'productListTitle',
                'seeMore',
                `Banner { id buttonText Image { width height ext url name } }`,
            ],
        });
        if (fanShopData) {
            fanShopCms = {
                banner: fanShopData.Banner ?? null,
                productListTitle: fanShopData.productListTitle ?? null,
                seeMore: fanShopData.seeMore ?? null,
            };
        }
    } catch (err) {
        console.error('Error fetching fan shop CMS data from Strapi:', err);
    }

    // Fetch products from Medusa (fan-shop category)
    let products: ProductCardItem[] = [];
    try {
        const { product_categories } = await sdk.store.category.list({ handle: 'fan-shop', limit: 1 } as any);
        const categoryId = product_categories?.[0]?.id ?? null;
        if (categoryId) {
            const { products: medusaProducts } = await sdk.store.product.list({
                limit: PAGE_SIZE,
                fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
                category_id: categoryId,
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
