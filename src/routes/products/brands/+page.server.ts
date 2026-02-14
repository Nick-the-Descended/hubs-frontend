import {strapi, mapParaglideLocaleToStrapi} from '$lib/strapi';
import {getLocale} from '$lib/paraglide/runtime';
import type {PageServerLoad} from './$types';

const BRAND_PAGE_QUERY = `
query BrandPage($locale: I18NLocaleCode, $sort: [String]) {
  brandPage(locale: $locale) {
    title
    viewMore
    allBrands
    brand_items(sort: $sort) {
      UID
      name
      image {
        name
        alternativeText
        width
        height
        url
      }
    }
  }
  brands {
    UID
    name
  }
}
`;

export const load: PageServerLoad = async ({parent}) => {
	try {
		// Get header data from parent layout
		const {header} = await parent();

		// Get current locale from Paraglide and map to Strapi format
		const locale = getLocale();
		console.log('Brand Page - Locale:', locale);
		const strapiLocale = mapParaglideLocaleToStrapi(locale);

		// Execute the custom GraphQL query
		const data = await strapi.query<{
			brandPage: {
				title: string;
                viewMore: string;
                allBrands: string;
				brand_items: Array<{
					UID: string;
					name: string;
					image: {
						name: string;
						alternativeText: string;
						width: number;
						height: number;
						url: string;
					};
				}>;
			};
			brands: Array<{
				UID: string;
				name: string;
			}>;
		}>(BRAND_PAGE_QUERY, {
			locale: strapiLocale,
			sort: ['UID:asc'] // Default sort by name ascending
		});

		if (!data.brandPage) {
			console.warn('No brand page data found in Strapi');
			return {
				brandPage: null,
				brands: [],
				navigationItems: header?.navigationItems || []
			};
		}

		return {
			brandPage: data.brandPage,
			brands: data.brands || [],
			navigationItems: header?.navigationItems || []
		};
	} catch (error) {
		console.error('Error fetching brand data from Strapi:', error);
		// Return null data if Strapi fetch fails
		return {
			brandPage: null,
			brands: [],
			navigationItems: []
		};
	}
};
