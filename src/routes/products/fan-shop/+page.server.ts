import {strapi, mapParaglideLocaleToStrapi} from '$lib/strapi';
import {getLocale} from '$lib/paraglide/runtime';
import type {PageServerLoad} from './$types';
import {readFileSync} from 'fs';
import {join} from 'path';

// Read the GraphQL query from the file
const FAN_SHOP_QUERY = `
query FanShop($locale: I18NLocaleCode) {
    fanShop(locale: $locale) {
        slug
        Banner {
            id
            Image {
                width
                height
                ext
                url
                name
            }
            buttonText
        }
        productListTitle
        seeMore
        productList {
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
        }
    }
}
`;

interface FanShopImage {
    width: number;
    height: number;
    ext: string;
    url: string;
    name: string;
}

interface FanShopBanner {
    id: string;
    Image: FanShopImage;
    buttonText: string;
}

interface FanShopProduct {
    id: string;
    productImage: FanShopImage;
    productName: string;
    slug: string;
    price: number;
    discountedPrice: number | null;
    averageRating: number;
    discountPercent: number | null;
    isFavourite: boolean;
}

interface FanShopData {
    slug: string;
    Banner: FanShopBanner;
    productListTitle: string;
    seeMore: string;
    productList: FanShopProduct[];
}

interface FanShopResponse {
    fanShop: FanShopData;
}

export const load: PageServerLoad = async () => {
    try {
        // Get current locale from Paraglide and map to Strapi format
        const locale = getLocale();
        console.log('Fan Shop Page - Locale:', locale);
        const strapiLocale = mapParaglideLocaleToStrapi(locale);

        // Execute the custom GraphQL query
        const data = await strapi.query<FanShopResponse>(FAN_SHOP_QUERY, {
            locale: strapiLocale
        });

        if (!data?.fanShop) {
            console.warn('No fan shop data found in Strapi');
            return {
                fanShop: null
            };
        }

        return {
            fanShop: data.fanShop
        };
    } catch (error) {
        console.error('Error fetching fan shop data from Strapi:', error);
        // Return null data if Strapi fetch fails
        return {
            fanShop: null
        };
    }
};
