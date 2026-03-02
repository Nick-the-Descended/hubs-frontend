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
    const firstVariant = product.variants?.[0];  // already typed as StoreProductVariant

    const calculatedPrice = firstVariant?.calculated_price;
    // calculated_amount is in currency units (not cents), null means "not priced for this context"
    const priceAmount = calculatedPrice?.calculated_amount ?? null;
    const originalPriceAmount = calculatedPrice?.original_amount ?? priceAmount;

    const price = priceAmount ?? 0;
    const originalPrice = originalPriceAmount ?? priceAmount ?? 0;
    const hasDiscount = priceAmount !== null && originalPriceAmount !== null && originalPrice > price;

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
        const variantCalcPrice = v.calculated_price;  // v is already StoreProductVariant, no cast needed
        const vPrice = variantCalcPrice?.calculated_amount ?? null;
        const vOrigPrice = variantCalcPrice?.original_amount ?? vPrice;
        const variantPrice = vPrice ?? 0;
        const variantOriginalPrice = vOrigPrice ?? 0;

        const options: Record<string, string> = {};
        for (const opt of (v.options ?? [])) {
            if (!opt.option_id) continue;  // skip orphaned option values with null option_id
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
        discountPrice: hasDiscount ? originalPrice : null,
        discountPercentage,
        isFavourite: null,
        category: category ? { name: category.name, slug: category.handle } : null,
        mainImage,
        gallery,
        firstVariantId: firstVariant?.id ?? null,
        variants,
    };
}

export interface MedusaProductDetail {
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
    variants: Array<{ id: string; price: number; originalPrice: number; options: Record<string, string> }>;
}

export function medusaProductToDetail(product: StoreProduct): MedusaProductDetail {
    const firstVariant = product.variants?.[0];
    const calcPrice = firstVariant?.calculated_price;
    const priceAmount = calcPrice?.calculated_amount ?? null;
    const originalPriceAmount = calcPrice?.original_amount ?? priceAmount;
    const price = (priceAmount ?? 0) / 100;
    const originalPrice = (originalPriceAmount ?? 0) / 100;
    const hasDiscount = priceAmount !== null && originalPriceAmount !== null && originalPrice > price;

    const mainImageUrl = product.thumbnail ?? product.images?.[0]?.url ?? null;

    const options = (product.options ?? []).map((opt) => ({
        title: opt.title,
        values: (opt.values ?? []).map((v) => v.value),
    }));

    const variants = (product.variants ?? []).map((v) => {
        const vCalc = v.calculated_price;
        const vPrice = vCalc?.calculated_amount ?? null;
        const vOrigPrice = vCalc?.original_amount ?? vPrice;
        const variantPrice = vPrice ?? 0;
        const variantOriginalPrice = vOrigPrice ?? 0;
        const vOptions: Record<string, string> = {};
        for (const vOpt of (v.options ?? [])) {
            if (!vOpt.option_id) continue;
            const title = product.options?.find((o) => o.id === vOpt.option_id)?.title ?? vOpt.option_id;
            vOptions[title] = vOpt.value;
        }
        return { id: v.id, price: variantPrice, originalPrice: variantOriginalPrice, options: vOptions };
    });

    return {
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
        pageCount: pageSize > 0 ? Math.ceil(count / pageSize) : 0,
        total: count,
    };
}

export interface StoreProductReview {
    id: string;
    title: string | null;
    rating: number;
    content: string;
    first_name: string;
    last_name: string;
    created_at: string;
}
