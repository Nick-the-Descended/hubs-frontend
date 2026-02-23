import { sdk } from '$lib/sdk';
import { error } from '@sveltejs/kit';
import type { StoreProduct, StoreProductVariant } from '@medusajs/types';
import type { PageServerLoad } from './$types';

export type MedusaProductDetail = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    originalPrice: number;
    hasDiscount: boolean;
    discountPercentage: number | null;
    category: { name: string } | null;
    mainImage: { url: string; alternativeText: string | null } | null;
    gallery: Array<{ url: string; alternativeText: string | null }>;
    averageRating: number | null;
    hasBranding: boolean;
    options: Array<{ title: string; values: string[] }>;
    variants: Array<{
        id: string;
        price: number;
        originalPrice: number;
        options: Record<string, string>;
    }>;
};

export const load: PageServerLoad = async ({ params, parent }) => {
    await parent();

    try {
        const { products } = await sdk.store.product.list({
            handle: params.itemId,
            fields: '+variants.calculated_price,+variants.options,+options,+categories,+images',
        } as any);

        const product = products?.[0] as StoreProduct | undefined;
        if (!product) throw error(404, 'Product not found');

        const firstVariant = product.variants?.[0] as StoreProductVariant | undefined;
        const calcPrice = firstVariant?.calculated_price;
        const priceInCents = calcPrice?.calculated_amount ?? null;
        const originalPriceInCents = calcPrice?.original_amount ?? priceInCents;
        const price = (priceInCents ?? 0) / 100;
        const originalPrice = (originalPriceInCents ?? 0) / 100;
        const hasDiscount = priceInCents !== null && originalPriceInCents !== null && originalPrice > price;

        const options = (product.options ?? []).map((opt) => ({
            title: opt.title,
            values: (opt.values ?? []).map((v) => v.value),
        }));

        const variants = (product.variants ?? []).map((v) => {
            const vCalc = v.calculated_price;
            const vPriceInCents = vCalc?.calculated_amount ?? null;
            const vOrigPriceInCents = vCalc?.original_amount ?? vPriceInCents;
            const variantPrice = (vPriceInCents ?? 0) / 100;
            const variantOriginalPrice = (vOrigPriceInCents ?? 0) / 100;
            const vOptions: Record<string, string> = {};
            for (const vOpt of (v.options ?? [])) {
                if (!vOpt.option_id) continue;
                const title = product.options?.find((o) => o.id === vOpt.option_id)?.title ?? vOpt.option_id;
                vOptions[title] = vOpt.value;
            }
            return { id: v.id, price: variantPrice, originalPrice: variantOriginalPrice, options: vOptions };
        });

        const mainImageUrl = product.thumbnail ?? product.images?.[0]?.url ?? null;

        const detail: MedusaProductDetail = {
            id: product.id,
            name: product.title,
            slug: product.handle ?? product.id,
            description: product.description ?? null,
            price,
            originalPrice,
            hasDiscount,
            discountPercentage: hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : null,
            category: product.categories?.[0] ? { name: product.categories[0].name } : null,
            mainImage: mainImageUrl ? { url: mainImageUrl, alternativeText: product.title } : null,
            gallery: (product.images ?? []).map((img) => ({ url: img.url, alternativeText: null })),
            averageRating: null,
            hasBranding: false,
            options,
            variants,
        };

        return {
            product: detail,
            categoryId: params.categoryId,
            subCategoryId: params.subCategoryId,
        };
    } catch (err: any) {
        if (err.status === 404) throw err;
        console.error('Error fetching product from Medusa:', err);
        return { product: null, categoryId: params.categoryId, subCategoryId: params.subCategoryId };
    }
};
