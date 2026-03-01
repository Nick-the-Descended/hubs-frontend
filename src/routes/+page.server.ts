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
                homePage: {
                    slider: Array<{
                        Image: Array<{ url: string }>;
                        Collection?: string;
                    }>;
                    featuredProducts: SectionDef;
                    Discount: SectionDef;
                };
            }>(
                `
                query GetHomePage {
                    homePage {
                        slider {
                            Image {
                                url
                            }
                            Collection
                        }
                        featuredProducts {
                            Title
                            SeeMore
                            Collection
                        }
                        Discount {
                            Title
                            SeeMore
                            Collection
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

    const slides = (homePageData?.homePage?.slider ?? [])
        .filter((slide) => slide.Image?.[0])
        .map((slide) => ({
            imageUrl: `${PUBLIC_STRAPI_URL}${slide.Image[0].url}`,
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

    const raw = homePageData?.homePage;
    const featuredDef: SectionDef | null = raw?.featuredProducts ?? null;
    const discountDef: SectionDef | null = raw?.Discount ?? null;

    const [featuredSection, discountSection] = await Promise.all([
        featuredDef ? fetchSection(featuredDef) : Promise.resolve(null),
        discountDef ? fetchSection(discountDef) : Promise.resolve(null),
    ]);

    return { slides, featuredSection, discountSection };
};
