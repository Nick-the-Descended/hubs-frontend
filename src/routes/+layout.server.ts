import {strapi, mapParaglideLocaleToStrapi} from '$lib/strapi';
import type {Header} from '$lib/types/strapi-generated';
import type {LayoutServerLoad} from './$types';
import {getLocale} from '$lib/paraglide/runtime';

export const load: LayoutServerLoad = async () => {
    try {
        // Get current locale from Paraglide and map to Strapi format
        const locale = getLocale();
        const strapiLocale = mapParaglideLocaleToStrapi(locale);

        // Fetch header data from Strapi (single-type content)
        const headerData = await strapi.findSingle<Header>('header', {
            locale: strapiLocale,
            fields: [
                'promotionalBanner',
                'logoAlt',
                `navigationItems {
					id
					label
					href
					subcategories {
						id
                        label
                        href
                        hasIcon
                        icon {
                            width
                            height
                            url
                        }
                        subcategories {
                            id
                            label
                            productType
                        }
					}
				}`
            ]
        });

        if (!headerData) {
            console.warn('No header data found in Strapi');
        }

        return {
            header: headerData
        };
    } catch (error) {
        console.error('Error fetching header from Strapi:', error);
    }
};

