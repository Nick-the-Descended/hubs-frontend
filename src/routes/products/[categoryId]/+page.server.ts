import { sdk } from '$lib/sdk';
import { medusaProductToCard, medusaPagination } from '$lib/types/medusa-adapter';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 12;

export const load: PageServerLoad = async ({ params, url, parent }) => {
    const { header } = await parent();
    const isAll = params.categoryId === 'all';
    const categoryHandle = isAll ? null : params.categoryId;
    const page = Number(url.searchParams.get('page')) || 1;
    const offset = (page - 1) * PAGE_SIZE;

    try {
        const query: Record<string, unknown> = {
            limit: PAGE_SIZE,
            offset,
            fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
        };
        if (categoryHandle) {
            query['category_handle[]'] = categoryHandle;
        }

        const { products, count } = await sdk.store.product.list(query as any);
        const { product_categories } = await sdk.store.category.list({ limit: 100 } as any);

        const categories = (product_categories ?? []).map((c) => ({
            name: c.name,
            slug: c.handle,
        }));

        const activeCategory_ = categoryHandle
            ? (product_categories ?? []).find((c) => c.handle === categoryHandle)
            : null;

        return {
            products: (products ?? []).map(medusaProductToCard),
            pagination: medusaPagination(count ?? 0, page, PAGE_SIZE),
            categories,
            categorySlug: categoryHandle,
            categoryName: activeCategory_?.name ?? null,
            navigationItems: header?.navigationItems ?? [],
        };
    } catch (error) {
        console.error('Error fetching products from Medusa:', error);
        return {
            products: [],
            pagination: { page: 1, pageSize: PAGE_SIZE, pageCount: 1, total: 0 },
            categories: [],
            categorySlug: categoryHandle,
            categoryName: null,
            navigationItems: header?.navigationItems ?? [],
        };
    }
};
