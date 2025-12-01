<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { cn, type WithElementRef } from '@/utils.js';
    import { Heart, Eye, ShoppingCart } from '@lucide/svelte';
    import Button from '@/components/ui/button/button.svelte';

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
        ...restProps
    }: ProductCardProps = $props();

    // Calculate filled and empty stars
    const filledStars = $derived(Math.floor(rating));
    const hasHalfStar = $derived(rating % 1 >= 0.5);
    const emptyStars = $derived(5 - filledStars - (hasHalfStar ? 1 : 0));
    const filledStarsArray = $derived(Array.from({ length: filledStars }));
    const emptyStarsArray = $derived(Array.from({ length: emptyStars }));
</script>

<div
    bind:this={ref}
    class={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md',
        className
    )}
    {...restProps}
>
    <!-- Image Container -->
    <div class="relative h-[190px] w-full overflow-hidden bg-muted lg:h-[360px]">
        <img
            src={imageUrl}
            alt={imageAlt}
            class="h-full w-full object-cover"
        />

        <!-- Action Buttons Overlay -->
        <div class="absolute top-3 right-3 flex flex-col gap-2">
            <Button
                variant="outline"
                size="icon"
                class="h-10 w-10 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
                onclick={onFavoriteClick}
                aria-label="Add to favorites"
            >
                <Heart
                    class={cn(
                        'h-5 w-5 transition-colors',
                        isFavorite
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-700'
                    )}
                />
            </Button>
            <Button
                variant="outline"
                size="icon"
                class="h-10 w-10 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
                onclick={onQuickViewClick}
                aria-label="Quick view"
            >
                <Eye class="h-5 w-5 text-gray-700" />
            </Button>
        </div>
    </div>

    <!-- Product Info -->
    <div class="flex flex-col gap-3 p-4">
        <!-- Product Name -->
        <h3 class="text-lg font-semibold text-foreground">{name}</h3>

        <!-- Rating -->
        {#if rating > 0}
            <div class="flex items-center gap-2">
                <span class="text-base font-medium text-foreground"
                    >{rating.toFixed(1)}</span
                >
                <div class="flex items-center gap-0.5">
                    {#each filledStarsArray as _, i (i)}
                        <svg
                            class="h-5 w-5 fill-orange-400 text-orange-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            />
                        </svg>
                    {/each}
                    {#if hasHalfStar}
                        <svg
                            class="h-5 w-5 text-orange-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            />
                        </svg>
                    {/if}
                    {#each emptyStarsArray as _, i (i)}
                        <svg
                            class="h-5 w-5 text-orange-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            />
                        </svg>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Price and Add to Cart -->
        <div class="flex items-center justify-between">
            <div class="flex items-baseline gap-0.5">
                <span class="text-3xl font-bold text-foreground"
                    >{price}</span
                >
                <span class="text-base font-normal text-foreground"
                    >{currency}</span
                >
            </div>
            <Button
                variant="outline"
                size="icon-lg"
                class="rounded-full transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground"
                onclick={onAddToCartClick}
                aria-label="Add to cart"
            >
                <ShoppingCart class="h-6 w-6" />
            </Button>
        </div>
    </div>
</div>
