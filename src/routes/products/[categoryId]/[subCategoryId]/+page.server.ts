import { sdk } from '$lib/sdk';
import { error } from '@sveltejs/kit';
import { medusaProductToCard, medusaPagination } from '$lib/types/medusa-adapter';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 12;

export const load: PageServerLoad = async ({ params, url, parent }) => {
    const { header } = await parent();
    const page = Number(url.searchParams.get('page')) || 1;
    const offset = (page - 1) * PAGE_SIZE;

    try {
        // Resolve subcategory handle → ID
        const { product_categories: matched } = await sdk.store.category.list({
            handle: params.subCategoryId,
            limit: 1,
        } as any);
        const categoryId = matched?.[0]?.id ?? null;
        if (!categoryId) throw error(404, `Subcategory "${params.subCategoryId}" not found`);
        const activeCategoryName = matched?.[0]?.name ?? null;

        const query: Record<string, unknown> = {
            limit: PAGE_SIZE,
            offset,
            fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
            category_id: categoryId,
        };

        const { products, count } = await sdk.store.product.list(query as any);
        const { product_categories } = await sdk.store.category.list({ limit: 100 } as any);
        const categories = (product_categories ?? []).map((c) => ({ name: c.name, slug: c.handle }));

        return {
            products: (products ?? []).map(medusaProductToCard),
            pagination: medusaPagination(count ?? 0, page, PAGE_SIZE),
            categories,
            categorySlug: params.subCategoryId,
            categoryName: activeCategoryName,
            navigationItems: header?.navigationItems ?? [],
        };
    } catch (error) {
        console.error('Error fetching subcategory products from Medusa:', error);
        return {
            products: [],
            pagination: { page: 1, pageSize: PAGE_SIZE, pageCount: 1, total: 0 },
            categories: [],
            categorySlug: params.subCategoryId,
            categoryName: null,
            navigationItems: [],
        };
    }
};
