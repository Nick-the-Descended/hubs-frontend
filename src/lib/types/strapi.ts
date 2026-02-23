/**
 * Strapi API response types
 */

/**
 * Base attributes interface for Strapi entities
 */
export interface StrapiBaseAttributes {
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
	locale?: string;
}

/**
 * Generic Strapi entity structure
 */
export interface StrapiEntity<T = Record<string, any>> {
	id: number;
	attributes: T & StrapiBaseAttributes;
}

/**
 * Strapi response for a single entity
 */
export interface StrapiSingleResponse<T = Record<string, any>> {
	data: StrapiEntity<T>;
	meta?: Record<string, any>;
}

/**
 * Strapi response for a collection of entities
 */
export interface StrapiCollectionResponse<T = Record<string, any>> {
	data: StrapiEntity<T>[];
	meta: {
		pagination?: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

/**
 * Strapi media/file structure
 */
export interface StrapiMedia {
	id: number;
	attributes: {
		name: string;
		alternativeText?: string;
		caption?: string;
		width?: number;
		height?: number;
		formats?: {
			thumbnail?: StrapiMediaFormat;
			small?: StrapiMediaFormat;
			medium?: StrapiMediaFormat;
			large?: StrapiMediaFormat;
		};
		hash: string;
		ext: string;
		mime: string;
		size: number;
		url: string;
		previewUrl?: string;
		provider: string;
		createdAt: string;
		updatedAt: string;
	};
}

export interface StrapiMediaFormat {
	name: string;
	hash: string;
	ext: string;
	mime: string;
	width: number;
	height: number;
	size: number;
	path: string | null;
	url: string;
}

/**
 * Helper type to extract attributes from a Strapi entity
 */
export type StrapiAttributes<T> = T extends StrapiEntity<infer A> ? A : never;

/**
 * Helper type for populated relations
 */
export interface StrapiRelation<T = Record<string, any>> {
	data: StrapiEntity<T> | StrapiEntity<T>[] | null;
}

/**
 * Example content type interfaces
 * Define your specific content types based on your Strapi schema
 */

// Example: Article content type
export interface ArticleAttributes {
	title: string;
	description?: string;
	content: string;
	slug: string;
	cover?: StrapiRelation<StrapiMedia>;
	author?: StrapiRelation<AuthorAttributes>;
	category?: StrapiRelation<CategoryAttributes>;
	tags?: StrapiRelation<TagAttributes>;
}

export interface AuthorAttributes {
	name: string;
	email?: string;
	avatar?: StrapiRelation<StrapiMedia>;
	bio?: string;
}

export interface CategoryAttributes {
	name: string;
	slug: string;
	description?: string;
}

export interface TagAttributes {
	name: string;
	slug: string;
}

// Example: Page content type (for static pages)
export interface PageAttributes {
	title: string;
	slug: string;
	content: string;
	seo?: {
		metaTitle?: string;
		metaDescription?: string;
		keywords?: string;
		metaImage?: StrapiRelation<StrapiMedia>;
	};
}

// Header/Navigation content types (based on Strapi v5 GraphQL schema)

/**
 * UploadFile type for media fields (Strapi v5)
 */
export interface UploadFile {
	documentId: string;
	name: string;
	alternativeText?: string;
	caption?: string;
	width?: number;
	height?: number;
	formats?: any; // JSON field with thumbnail, small, medium, large formats
	hash: string;
	ext: string;
	mime: string;
	size: number;
	url: string;
	previewUrl?: string;
	provider: string;
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
}

/**
 * ComponentCommonNavigationSubcategoryLevel3 - Deepest nesting level (no more subcategories)
 */
export interface NavigationSubcategoryLevel3 {
	id: string;
	label?: string;
	href: string;
	iconSrc?: string;
	description?: string;
	productType?: string;
}

/**
 * ComponentCommonNavigationSubcategoryLevel2 - Third nesting level
 */
export interface NavigationSubcategoryLevel2 {
	id: string;
	label?: string;
	href: string;
	iconSrc?: string;
	description?: string;
	productType?: string;
	subcategories?: NavigationSubcategoryLevel3[];
}

/**
 * ComponentCommonNavigationSubcategory - Second nesting level
 */
export interface NavigationSubcategory {
	id: string;
	label?: string;
	href: string;
	iconSrc?: string;
	description?: string;
	productType?: string;
	subcategories?: NavigationSubcategoryLevel2[];
}

/**
 * ComponentCommonNavigationItem - Top level navigation item
 */
export interface NavigationItem {
	id: string;
	label: string; // Required in schema
	href: string; // Required in schema
	subcategories?: NavigationSubcategory[];
}

/**
 * Header single-type (Strapi v5)
 */
export interface HeaderAttributes {
	documentId?: string;
	promotionalBanner?: string;
	logoUrl?: UploadFile; // Media field relation
	logoAlt?: string;
	navigationItems?: NavigationItem[];
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
}
