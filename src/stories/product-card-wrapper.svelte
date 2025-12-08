<script lang="ts">
    import type {HTMLAttributes} from 'svelte/elements';
    import type {WithElementRef} from '@/utils.js';
    import * as ProductCard from '@/components/ui/product-card';

    interface ProductCardWrapperProps
        extends WithElementRef<HTMLAttributes<HTMLDivElement>> {
        imageUrl: string;
        imageAlt?: string;
        name: string;
        rating?: number;
        price: string;
        currency?: string;
        onFavoriteClick?: () => void;
        onQuickViewClick?: () => void;
        onAddToCartClick?: () => void;
        isFavorite?: boolean;
        showActions?: boolean;
    }

    let {
        ref = $bindable(null),
        class: className,
        imageUrl,
        imageAlt = 'Product image',
        name,
        rating,
        price,
        currency = 'GEL',
        onFavoriteClick,
        onQuickViewClick,
        onAddToCartClick,
        isFavorite = false,
        showActions = true,
        ...restProps
    }: ProductCardWrapperProps = $props();
</script>

<ProductCard.Root bind:ref class={className} {...restProps}>
    <!-- Image Container -->
    <ProductCard.Image {imageUrl} {imageAlt}/>

    <!-- Action Buttons Overlay -->
    {#if showActions}
        <ProductCard.Actions
                {onFavoriteClick}
                {onQuickViewClick}
                {onAddToCartClick}
                {isFavorite}
        />
    {/if}

    <!-- Product Description -->
    <ProductCard.Description>
        <!-- Product Name -->
        <ProductCard.Title {name}/>

        <!-- Rating -->
        {#if rating && rating > 0}
            <ProductCard.Rating {rating}/>
        {/if}

        <!-- Price and Add to Cart -->
        <ProductCard.Price {price} {currency}/>
    </ProductCard.Description>
</ProductCard.Root>
