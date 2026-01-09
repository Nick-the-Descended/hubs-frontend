import {strapi, mapParaglideLocaleToStrapi} from '$lib/strapi';
import {getLocale} from '$lib/paraglide/runtime';
import type {PageServerLoad} from './$types';
import type {FanShop, Header} from '$lib/types/strapi-generated';

export const load: PageServerLoad = async ({parent}) => {
    try {
        // Get header data from parent layout
        const {header} = await parent();

        // Get current locale from Paraglide and map to Strapi format
        const locale = getLocale();
        console.log('Fan Shop Page - Locale:', locale);
        const strapiLocale = mapParaglideLocaleToStrapi(locale);

        // Fetch fan shop data from Strapi (single-type content)
        const fanShopData = await strapi.findSingle<FanShop>('fanShop', {
            locale: strapiLocale,
            fields: [
                'slug',
                'productListTitle',
                'seeMore',
                `Banner {
                    id
                    buttonText
                    Image {
                        width
                        height
                        ext
                        url
                        name
                    }
                }`,
                `productList {
                    id
                    productImage {
                        width
                        height
                        ext
                        url
                        name
                    }
                    productName
                    slug
                    price
                    discountedPrice
                    averageRating
                    discountPercent
                    isFavourite
                }`
            ]
        });

        if (!fanShopData) {
            console.warn('No fan shop data found in Strapi');
            return {
                fanShop: null,
                navigationItems: header?.navigationItems || []
            };
        }

        return {
            fanShop: fanShopData,
            navigationItems: header?.navigationItems || []
        };
    } catch (error) {
        console.error('Error fetching fan shop data from Strapi:', error);
        // Return null data if Strapi fetch fails
        return {
            fanShop: null,
            navigationItems: []
        };
    }
};
