import { strapi, mapParaglideLocaleToStrapi } from '$lib/strapi';
import { getLocale } from '$lib/paraglide/runtime';
import type { PageServerLoad } from './$types';

const PRODUCT_QUERY = `
query Product($locale: I18NLocaleCode, $filters: ProductFiltersInput) {
  products(locale: $locale, filters: $filters) {
    name
    slug
    documentId
    price
    discountPrice
    discountPercentage
    shortDescription
    detailedDescription
    averageRating
    hasBranding
    isFavourite
    category {
      name
    }
    gallery {
      url
      name
      width
      height
      alternativeText
      documentId
    }
    mainImage {
      url
      name
      width
      height
      alternativeText
      documentId
    }
    reviews {
      comment
      reviewerName
      rating
    }
    availableSizes {
      productSize
    }
    avaliableColors {
      hexCode
      colorName
    }
  }
}
`;

export interface StrapiImage {
	url: string;
	name: string;
	width: number;
	height: number;
	alternativeText: string | null;
	documentId: string;
}

export interface RichTextChild {
	type: string;
	text?: string;
	bold?: boolean;
	italic?: boolean;
	url?: string;
	children?: RichTextChild[];
}

export interface RichTextBlock {
	type: string;
	children: RichTextChild[];
}

export interface ProductReview {
	comment: string;
	reviewerName: string;
	rating: number;
}

export interface Product {
	name: string;
	slug: string;
	documentId: string;
	price: number;
	discountPrice: number | null;
	discountPercentage: number | null;
	shortDescription: string | null;
	detailedDescription: RichTextBlock[] | null;
	averageRating: number | null;
	hasBranding: boolean | null;
	isFavourite: boolean | null;
	category: { name: string } | null;
	gallery: StrapiImage[];
	mainImage: StrapiImage | null;
	reviews: ProductReview[];
	availableSizes: Array<{ productSize: string }>;
	avaliableColors: Array<{ hexCode: string; colorName: string }>;
}

export const load: PageServerLoad = async ({ params }) => {
	const locale = getLocale();
	const strapiLocale = mapParaglideLocaleToStrapi(locale);

	try {
		const data = await strapi.query<{
			products: Product[];
		}>(PRODUCT_QUERY, {
			locale: strapiLocale,
			filters: { slug: { eq: params.itemId } }
		});

		const product = data.products?.[0] || null;

		return {
			product,
			categoryId: params.categoryId,
			subCategoryId: params.subCategoryId
		};
	} catch (error) {
		console.error('Error fetching product from Strapi:', error);
		return {
			product: null,
			categoryId: params.categoryId,
			subCategoryId: params.subCategoryId
		};
	}
};
