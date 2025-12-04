<script lang="ts">
    import type {HTMLAttributes} from 'svelte/elements';
    import {cn, type WithElementRef} from '@/utils.js';
    import ProductCardRating from './product-card-rating.svelte';
    import ProductCardImage from './product-card-image.svelte';
    import ProductCardActions from './product-card-actions.svelte';
    import ProductCardPrice from './product-card-price.svelte';
    import ProductCardTitle from './product-card-title.svelte';
    import ProductCardDescription from './product-card-description.svelte';

    type ProductCardProps = WithElementRef<
        HTMLAttributes<HTMLDivElement>
    > & {
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
    };

    let {
        ref = $bindable(null),
        class: className,
        imageUrl,
        imageAlt = 'Product image',
        name,
        rating = 0,
        price,
        currency = 'GEL',
        onFavoriteClick,
        onQuickViewClick,
        onAddToCartClick,
        isFavorite = false,
        children,
        ...restProps
    }: ProductCardProps = $props();

    // Calculate filled and empty stars
    const filledStars = $derived(Math.floor(rating));
    const hasHalfStar = $derived(rating % 1 >= 0.5);
    const emptyStars = $derived(5 - filledStars - (hasHalfStar ? 1 : 0));
    const filledStarsArray = $derived(Array.from({length: filledStars}));
    const emptyStarsArray = $derived(Array.from({length: emptyStars}));
</script>

<div
        bind:this={ref}
        class={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md',
        className
    )}
        {...restProps}
>
    {@render children?.()}

<!--    &lt;!&ndash; Image Container &ndash;&gt;-->
<!--    <ProductCardImage imageUrl={imageUrl} imageAlt={imageAlt}/>-->
<!--    <ProductCardActions/>-->
<!--    <ProductCardDescription>-->
<!--        &lt;!&ndash; Product Name &ndash;&gt;-->
<!--        <ProductCardTitle name={name}/>-->
<!--        &lt;!&ndash; Rating &ndash;&gt;-->
<!--        <ProductCardRating rating={rating}/>-->
<!--        &lt;!&ndash; Price and Add to Cart &ndash;&gt;-->
<!--        <ProductCardPrice price={price} currency={currency}/>-->
<!--    </ProductCardDescription>-->
</div>

