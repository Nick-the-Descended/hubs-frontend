import type { StoreProduct, StoreProductVariant } from '@medusajs/types';

/**
 * The shape expected by ProductsGrid, ProductCard, and ProductCardSlider components.
 * Mirrors the Strapi product shape that components were built against.
 */
export interface ProductCardItem {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    averageRating: number | null;
    price: number;                   // display price in currency units (not cents)
    discountPrice: number | null;    // null if no discount
    discountPercentage: number | null;
    isFavourite: boolean | null;
    category: { name: string; slug: string } | null;
    mainImage: { url: string; alternativeText: string | null; width: number; height: number } | null;
    gallery: Array<{ url: string; alternativeText: string | null; width: number; height: number }>;
    firstVariantId: string | null;   // ID of first variant, for quick "add to cart"
    variants: Array<{
        id: string;
        options: Record<string, string>; // e.g. { "Size": "M", "Color": "Red" }
        price: number;
        originalPrice: number;
    }>;
}

export function medusaProductToCard(product: StoreProduct): ProductCardItem {
    const firstVariant = product.variants?.[0] as StoreProductVariant | undefined;

    const calculatedPrice = firstVariant?.calculated_price;
    const priceInCents = calculatedPrice?.calculated_amount ?? 0;
    const originalPriceInCents = calculatedPrice?.original_amount ?? priceInCents;

    const price = priceInCents / 100;
    const originalPrice = originalPriceInCents / 100;
    const hasDiscount = originalPrice > price;

    const discountPercentage = hasDiscount
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : null;

    const category = product.categories?.[0] ?? null;

    const gallery = (product.images ?? []).map((img) => ({
        url: img.url,
        alternativeText: null,
        width: 800,
        height: 800,
    }));

    const mainImageUrl = product.thumbnail ?? product.images?.[0]?.url ?? null;
    const mainImage = mainImageUrl
        ? { url: mainImageUrl, alternativeText: product.title, width: 800, height: 800 }
        : null;

    const variants = (product.variants ?? []).map((v) => {
        const variantCalcPrice = (v as StoreProductVariant).calculated_price;
        const variantPrice = (variantCalcPrice?.calculated_amount ?? 0) / 100;
        const variantOriginalPrice = (variantCalcPrice?.original_amount ?? 0) / 100;

        const options: Record<string, string> = {};
        for (const opt of (v.options ?? [])) {
            const optionTitle = product.options?.find((o) => o.id === opt.option_id)?.title ?? opt.option_id;
            options[optionTitle] = opt.value;
        }

        return {
            id: v.id,
            options,
            price: variantPrice,
            originalPrice: variantOriginalPrice,
        };
    });

    return {
        id: product.id,
        name: product.title,
        slug: product.handle ?? product.id,
        shortDescription: product.subtitle ?? null,
        averageRating: null,
        price,
        discountPrice: hasDiscount ? price : null,
        discountPercentage,
        isFavourite: null,
        category: category ? { name: category.name, slug: category.handle } : null,
        mainImage,
        gallery,
        firstVariantId: firstVariant?.id ?? null,
        variants,
    };
}

export interface PaginationInfo {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
}

export function medusaPagination(count: number, page: number, pageSize: number): PaginationInfo {
    return {
        page,
        pageSize,
        pageCount: Math.ceil(count / pageSize),
        total: count,
    };
}
