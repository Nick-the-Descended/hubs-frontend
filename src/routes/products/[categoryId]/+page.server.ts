import {strapi, mapParaglideLocaleToStrapi} from '$lib/strapi';
import {getLocale} from '$lib/paraglide/runtime';
import type {PageServerLoad} from './$types';

const PRODUCTS_QUERY = `
query Products($locale: I18NLocaleCode, $sort: [String], $pagination: PaginationArg, $filters: ProductFiltersInput) {
  products_connection(locale: $locale, sort: $sort, pagination: $pagination, filters: $filters) {
    nodes {
      name
      slug
      shortDescription
      averageRating
      price
      discountPrice
      discountPercentage
      isFavourite
      category {
        name
        slug
      }
      gallery {
        name
        alternativeText
        width
        height
        url
        previewUrl
      }
      mainImage {
        name
        alternativeText
        width
        height
        url
        previewUrl
      }
    }
    pageInfo {
      page
      pageSize
      pageCount
      total
    }
  }
  categories(locale: $locale) {
    name
    slug
  }
}
`;

export const load: PageServerLoad = async ({url, params, parent}) => {
	const isAll = params.categoryId === 'all';
	const categorySlug = isAll ? null : params.categoryId;

	try {
		const {header} = await parent();

		const locale = getLocale();
		const strapiLocale = mapParaglideLocaleToStrapi(locale);
		const page = Number(url.searchParams.get('page')) || 1;

		const data = await strapi.query<{
			products_connection: {
				nodes: Array<{
					name: string;
					slug: string;
					shortDescription: string | null;
					averageRating: number | null;
					price: number;
					discountPrice: number | null;
					discountPercentage: number | null;
					isFavourite: boolean | null;
					category: { name: string; slug: string } | null;
					gallery: Array<{
						name: string;
						alternativeText: string | null;
						width: number;
						height: number;
						url: string;
						previewUrl: string | null;
					}>;
					mainImage: {
						name: string;
						alternativeText: string | null;
						width: number;
						height: number;
						url: string;
						previewUrl: string | null;
					} | null;
				}>;
				pageInfo: {
					page: number;
					pageSize: number;
					pageCount: number;
					total: number;
				};
			};
			categories: Array<{
				name: string;
				slug: string;
			}>;
		}>(PRODUCTS_QUERY, {
			locale: strapiLocale,
			sort: ['name:asc'],
			pagination: {page, pageSize: 12},
			...(categorySlug ? {filters: {category: {slug: {eq: categorySlug}}}} : {})
		});

		// Find category name from the categories list
		const categories = data.categories || [];
		const activeCategory = categorySlug ? categories.find(c => c.slug === categorySlug) : null;

		return {
			products: data.products_connection?.nodes || [],
			pagination: data.products_connection?.pageInfo || {page: 1, pageSize: 12, pageCount: 1, total: 0},
			categories,
			categorySlug,
			categoryName: activeCategory?.name || null,
			navigationItems: header?.navigationItems || []
		};
	} catch (error) {
		console.error('Error fetching products from Strapi:', error);
		return {
			products: [],
			pagination: {page: 1, pageSize: 12, pageCount: 1, total: 0},
			categories: [],
			categorySlug,
			categoryName: null,
			navigationItems: []
		};
	}
};
