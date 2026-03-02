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

type SeasonalOffersSection = {
    Title: string;
    SeasonalOffersItem: { Image: { url: string }; Collection: string }[];
};

type FanShopData = {
    Title: string;
    Heading: string;
    Description: string;
    Collection: string;
    SeeMore: string;
    Image: { url: string };
    FanShopPromotionItem: { Collection: string; Image: { url: string } }[];
};

type ServiceItem = { Title: string; Description: string; Image: { url: string } };

type SectionDef = {
    Title: string;
    SeeMore: string;
    Collection: string;
};

type ProductSection = {
    title: string;
    seeMore: string;
    collection: string;
    products: ReturnType<typeof medusaProductToCard>[];
};

export const load: PageServerLoad = async () => {
    const [homePageData, regionsResult] = await Promise.all([
        strapi
            .query<{
                homepage: {
                    main_slider: Array<{
                        Image: { url: string };
                        Collection?: string;
                    }>;
                    popular_products: SectionDef;
                    discounted_products: SectionDef;
                    seasonal_offers: SeasonalOffersSection;
                    fanshop: FanShopData;
                    services: ServiceItem[];
                };
            }>(
                `
                query GetHomePage {
                    homepage {
                        main_slider {
                            Image {
                                url
                            }
                            Collection
                        }
                        popular_products {
                            Title
                            SeeMore
                            Collection
                        }
                        discounted_products {
                            Title
                            SeeMore
                            Collection
                        }
                        seasonal_offers {
                            Title
                            SeasonalOffersItem {
                                Image {
                                    url
                                }
                                Collection
                            }
                        }
                        fanshop {
                            Title
                            Heading
                            Description
                            Collection
                            SeeMore
                            Image {
                                url
                            }
                            FanShopPromotionItem {
                                Collection
                                Image {
                                    url
                                }
                            }
                        }
                        services {
                            Title
                            Description
                            Image {
                                url
                            }
                        }
                    }
                }
            `
            )
            .catch((error) => {
                console.error('Error fetching home page data from Strapi:', error);
                return null;
            }),
        sdk.store.region.list().catch(() => ({ regions: [] as { id: string }[] })),
    ]);

    const regionId = regionsResult.regions?.[0]?.id;

    const slides = (homePageData?.homepage?.main_slider ?? [])
        .filter((slide) => slide.Image?.url)
        .map((slide) => ({
            imageUrl: `${PUBLIC_STRAPI_URL}${slide.Image.url}`,
            href: buildSlideUrl({ collection: slide.Collection }),
        }));

    const fetchSection = async (def: SectionDef): Promise<ProductSection> => {
        try {
            const { collections } = await sdk.store.collection.list({ handle: def.Collection } as any);
            const collectionId = collections?.[0]?.id;

            const query: Record<string, unknown> = {
                limit: 12,
                region_id: regionId,
                fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
            };
            if (collectionId) query.collection_id = [collectionId];

            const { products } = await sdk.store.product.list(query as any);
            return {
                title: def.Title,
                seeMore: def.SeeMore,
                collection: def.Collection,
                products: (products ?? []).map(medusaProductToCard),
            };
        } catch (error) {
            console.error(`Error fetching products for section "${def.Title}":`, error);
            return { title: def.Title, seeMore: def.SeeMore, collection: def.Collection, products: [] };
        }
    };

    const raw = homePageData?.homepage;
    const featuredDef: SectionDef | null = raw?.popular_products ?? null;
    const discountRaw = raw?.discounted_products;
    const discountDef: SectionDef | null = discountRaw
        ? { Title: discountRaw.Title, SeeMore: discountRaw.SeeMore, Collection: discountRaw.Collection }
        : null;

    const fanshopRaw = raw?.fanshop ?? null;

    const fetchFanShopProducts = async (): Promise<ReturnType<typeof medusaProductToCard>[]> => {
        if (!fanshopRaw?.Collection) return [];
        try {
            const { collections } = await sdk.store.collection.list({ handle: fanshopRaw.Collection } as any);
            const collectionId = collections?.[0]?.id;
            const query: Record<string, unknown> = {
                limit: 4,
                region_id: regionId,
                fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
            };
            if (collectionId) query.collection_id = [collectionId];
            const { products } = await sdk.store.product.list(query as any);
            return (products ?? []).map(medusaProductToCard);
        } catch (error) {
            console.error('Error fetching fanshop products:', error);
            return [];
        }
    };

    const [featuredSection, discountSection, fanshopProducts] = await Promise.all([
        featuredDef ? fetchSection(featuredDef) : Promise.resolve(null),
        discountDef ? fetchSection(discountDef) : Promise.resolve(null),
        fetchFanShopProducts(),
    ]);

    const seasonalOffers = (raw?.seasonal_offers?.SeasonalOffersItem ?? []).map((item) => ({
        imageUrl: `${PUBLIC_STRAPI_URL}${item.Image.url}`,
        href: `/products/all?collection=${item.Collection}`,
    }));

    const fanshop = fanshopRaw ? { ...fanshopRaw, products: fanshopProducts } : null;
    const services = raw?.services ?? [];

    return { slides, featuredSection, discountSection, seasonalOffers, fanshop, services };
};
