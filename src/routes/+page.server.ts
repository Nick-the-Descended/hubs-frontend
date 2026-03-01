import { sdk } from '$lib/sdk';
import { strapi } from '$lib/strapi';
import { medusaProductToCard } from '$lib/types/medusa-adapter';
import type { PageServerLoad } from './$types';
import { PUBLIC_STRAPI_URL } from '$env/static/public';

type SlideFilters = {
    collection?: string;
};

function buildSlideUrl(filters: SlideFilters): string {
    const params = new URLSearchParams();
    if (filters.collection) params.set('collection', filters.collection);
    const query = params.toString();
    return `/products/all${query ? `?${query}` : ''}`;
}

export const load: PageServerLoad = async () => {
    const [productsResult, slides] = await Promise.all([
        (async () => {
            try {
                const { regions } = await sdk.store.region.list();
                const regionId = regions?.[0]?.id;

                const { products } = await sdk.store.product.list({
                    limit: 12,
                    region_id: regionId,
                    fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
                } as any);

                return (products ?? []).map(medusaProductToCard);
            } catch (error) {
                console.error('Error fetching home page products from Medusa:', error);
                return [];
            }
        })(),
        (async () => {
            try {
                const homePageData = await strapi.query<{
                    homePage: { slider: Array<{
                        Image: Array<{ url: string }>;
                        Collection?: string
                    }> };
                }>(`
                    query GetHomePage {
                        homePage {
                            slider {
                                Image {
                                    url
                                }
                                Collection
                            }
                        }
                    }
                `);

                return (homePageData?.homePage?.slider ?? [])
                    .filter((slide) => slide.Image?.[0])
                    .map((slide) => ({
                        imageUrl: `${PUBLIC_STRAPI_URL}${slide.Image[0].url}`,
                        href: buildSlideUrl({ collection: slide.Collection }),
                    }));
            } catch (error) {
                console.error('Error fetching slider images from Strapi:', error);
                return [];
            }
        })(),
    ]);

    return { products: productsResult, slides };
};
