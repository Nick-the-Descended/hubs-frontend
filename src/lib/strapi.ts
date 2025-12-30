import {PUBLIC_STRAPI_URL, PUBLIC_STRAPI_API_TOKEN} from '$env/static/public';
import {Client, cacheExchange, fetchExchange} from '@urql/svelte';

/**
 * Map Paraglide locale codes to Strapi locale codes
 * Paraglide uses hyphenated format (e.g., 'ka-ge'), Strapi uses underscore (e.g., 'ka_GE')
 */
export function mapParaglideLocaleToStrapi(paraglideLocale: string): string {
    if (paraglideLocale.includes('-')) {
        const parts = paraglideLocale.split('-');
        return `${parts[0]}-${parts[1].toUpperCase()}`;
    }
    return paraglideLocale;
}

/**
 * Strapi GraphQL client for fetching CMS content
 */
class StrapiClient {
    private client: Client;

    constructor(baseUrl: string, apiToken: string) {
        this.client = new Client({
            url: `${baseUrl}/graphql`,
            exchanges: [cacheExchange, fetchExchange],
            fetchOptions: () => ({
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiToken}`
                }
            })
        });
    }

    /**
     * Build populate selection for GraphQL query (Strapi v5)
     * Note: In Strapi v5, fields are directly on data, not nested under attributes
     */
    private buildPopulateSelection(populate?: string | string[] | Record<string, any>): string {
        if (!populate) return '';

        // If populate is '*', include all relations (Strapi v5 structure)
        if (populate === '*') {
            return `
				data {
					id
					documentId
				}
			`;
        }

        // If populate is a string or array of strings
        if (typeof populate === 'string' || Array.isArray(populate)) {
            const fields = Array.isArray(populate) ? populate : [populate];
            return fields
                .map(
                    (field) => `
				${field} {
					data {
						id
						documentId
					}
				}
			`
                )
                .join('\n');
        }

        // If populate is an object with nested structure
        if (typeof populate === 'object') {
            return Object.entries(populate)
                .map(([key, value]) => {
                    if (value === true || value === '*') {
                        return `
					${key} {
						data {
							id
							documentId
						}
					}
				`;
                    }
                    // Handle nested population
                    if (typeof value === 'object' && value.populate) {
                        return `
					${key} {
						data {
							id
							documentId
							${this.buildPopulateSelection(value.populate)}
						}
					}
				`;
                    }
                    return '';
                })
                .join('\n');
        }

        return '';
    }

    /**
     * Build filters for GraphQL query
     */
    private buildFilters(
        filters?: Record<string, any>
    ): Record<string, any> | undefined {
        if (!filters) return undefined;

        const graphqlFilters: Record<string, any> = {};

        Object.entries(filters).forEach(([key, value]) => {
            // Handle nested filters (e.g., 'category.slug')
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                if (!graphqlFilters[parent]) {
                    graphqlFilters[parent] = {};
                }
                graphqlFilters[parent][child] = value;
            } else {
                graphqlFilters[key] = value;
            }
        });

        return graphqlFilters;
    }

    /**
     * Convert content type to plural form for GraphQL queries
     */
    private pluralize(contentType: string): string {
        // Simple pluralization - Strapi content types are usually already pluralized
        // If they end with common patterns, adjust accordingly
        if (contentType.endsWith('y')) {
            return contentType.slice(0, -1) + 'ies';
        }
        if (contentType.endsWith('s')) {
            return contentType; // Already plural or singular 's'
        }
        return contentType + 's';
    }

    /**
     * Convert plural to singular form for GraphQL queries
     */
    private singularize(contentType: string): string {
        if (contentType.endsWith('ies')) {
            return contentType.slice(0, -3) + 'y';
        }
        if (contentType.endsWith('s')) {
            return contentType.slice(0, -1);
        }
        return contentType;
    }

    /**
     * Fetch a collection of entries
     * @param contentType - The content type to fetch (e.g., 'articles', 'pages')
     * @param params - Query parameters for filtering, sorting, pagination, etc.
     */
    async find<T = any>(
        contentType: string,
        params?: {
            filters?: Record<string, any>;
            sort?: string | string[];
            populate?: string | string[] | Record<string, any>;
            fields?: string[];
            pagination?: {
                page?: number;
                pageSize?: number;
                start?: number;
                limit?: number;
            };
            publicationState?: 'live' | 'preview';
            locale?: string;
        }
    ): Promise<{ data: T[]; meta: any }> {
        const pluralType = this.pluralize(contentType);
        const populateSelection = this.buildPopulateSelection(params?.populate);
        const filters = this.buildFilters(params?.filters);

        // Build variable definitions array
        const variableDefinitions: string[] = [];
        if (filters) {
            variableDefinitions.push(
                `$filters: ${pluralType.charAt(0).toUpperCase() + pluralType.slice(1)}FiltersInput`
            );
        }
        if (params?.sort) variableDefinitions.push('$sort: [String]');
        if (params?.pagination) variableDefinitions.push('$pagination: PaginationArg');
        if (params?.publicationState) variableDefinitions.push('$publicationState: PublicationState');
        if (params?.locale) variableDefinitions.push('$locale: I18NLocaleCode');

        // Build query parameters array
        const queryParams: string[] = [];
        if (filters) queryParams.push('filters: $filters');
        if (params?.sort) queryParams.push('sort: $sort');
        if (params?.pagination) queryParams.push('pagination: $pagination');
        if (params?.publicationState) queryParams.push('publicationState: $publicationState');
        if (params?.locale) queryParams.push('locale: $locale');

        // Build the GraphQL query (Strapi v5 structure)
        const query = `
			query Get${pluralType.charAt(0).toUpperCase() + pluralType.slice(1)}${
            variableDefinitions.length > 0 ? `(${variableDefinitions.join(', ')})` : ''
        } {
				${pluralType}${queryParams.length > 0 ? `(${queryParams.join(', ')})` : ''} {
					data {
						id
						documentId
						${params?.fields?.join('\n') || ''}
						${populateSelection}
					}
					meta {
						pagination {
							page
							pageSize
							pageCount
							total
						}
					}
				}
			}
		`;

        const variables: Record<string, any> = {};
        if (filters) variables.filters = filters;
        if (params?.sort) {
            variables.sort = Array.isArray(params.sort) ? params.sort : [params.sort];
        }
        if (params?.pagination) variables.pagination = params.pagination;
        if (params?.publicationState) variables.publicationState = params.publicationState;
        if (params?.locale) variables.locale = params.locale;

        const result = await this.client.query(query, variables).toPromise();

        if (result.error) {
            throw new Error(`Strapi GraphQL error: ${result.error.message}`);
        }

        const responseData = result.data?.[pluralType];
        return {
            data: responseData?.data || [],
            meta: responseData?.meta || {}
        };
    }

    /**
     * Fetch a single entry by ID
     * @param contentType - The content type (e.g., 'articles', 'pages')
     * @param id - The entry ID or documentId
     * @param params - Query parameters (populate, fields, etc.)
     */
    async findOne<T = any>(
        contentType: string,
        id: string | number,
        params?: {
            populate?: string | string[] | Record<string, any>;
            fields?: string[];
        }
    ): Promise<{ data: T; meta?: any }> {
        const singularType = this.singularize(contentType);
        const populateSelection = this.buildPopulateSelection(params?.populate);

        // Strapi v5 structure - no attributes wrapper
        const query = `
			query Get${singularType.charAt(0).toUpperCase() + singularType.slice(1)}($id: ID!) {
				${singularType}(id: $id) {
                    id
                    documentId
                    ${params?.fields?.join('\n') || ''}
                    ${populateSelection}
				}
			}
		`;

        const result = await this.client.query(query, {id: String(id)}).toPromise();

        if (result.error) {
            throw new Error(`Strapi GraphQL error: ${result.error.message}`);
        }

        const responseData = result.data?.[singularType]?.data;
        if (!responseData) {
            throw new Error(`Entry not found: ${contentType} with id ${id}`);
        }

        return {
            data: responseData,
            meta: result.data?.[singularType]?.meta
        };
    }

    /**
     * Fetch a single entry by slug or other unique field
     * @param contentType - The content type
     * @param field - The field to filter by (e.g., 'slug')
     * @param value - The value to match
     * @param params - Additional query parameters
     */
    async findByField<T = any>(
        contentType: string,
        field: string,
        value: string,
        params?: {
            populate?: string | string[] | Record<string, any>;
            fields?: string[];
        }
    ): Promise<T | null> {
        const result = await this.find<T>(contentType, {
            filters: {[field]: {eq: value}},
            pagination: {limit: 1},
            ...params
        });

        return result.data[0] || null;
    }

    /**
     * Fetch a single-type content type (e.g., 'header', 'footer', 'settings')
     * Single-types in Strapi are not pluralized and return a single object
     * Note: In Strapi v5, single-types don't have a 'data' wrapper in GraphQL
     * @param contentType - The single-type content type name (singular form)
     * @param params - Query parameters (populate, fields, etc.)
     */
    async findSingle<T = any>(
        contentType: string,
        params?: {
            populate?: string | string[] | Record<string, any>;
            fields?: string[];
            locale?: string;
        }
    ): Promise<T | null> {
        const populateSelection = this.buildPopulateSelection(params?.populate);

        // Build variable definitions array
        const variableDefinitions: string[] = [];
        if (params?.locale) variableDefinitions.push('$locale: I18NLocaleCode');

        // Build query parameters array
        const queryParams: string[] = [];
        if (params?.locale) queryParams.push('locale: $locale');

        // Build the GraphQL query for single-type (Strapi v5 structure - no data wrapper)
        const query = `
			query Get${contentType.charAt(0).toUpperCase() + contentType.slice(1)}${
            variableDefinitions.length > 0 ? `(${variableDefinitions.join(', ')})` : ''
        } {
				${contentType}${queryParams.length > 0 ? `(${queryParams.join(', ')})` : ''} {
					documentId
					${params?.fields?.join('\n') || ''}
					${populateSelection}
				}
			}
		`;

        const variables: Record<string, any> = {};
        if (params?.locale) variables.locale = params.locale;

        const result = await this.client.query(query, variables).toPromise();

        if (result.error) {
            throw new Error(`Strapi GraphQL error: ${result.error.message}`);
        }

        const responseData = result.data?.[contentType];
        return responseData || null;
    }
}

// Export a singleton instance
export const strapi = new StrapiClient(PUBLIC_STRAPI_URL, PUBLIC_STRAPI_API_TOKEN);
