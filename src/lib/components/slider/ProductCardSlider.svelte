<script lang="ts">
    import emblaCarouselSvelte from 'embla-carousel-svelte';
    import type { EmblaCarouselType } from 'embla-carousel';
    import ProductCard from '@/components/ui/product-card/product-card.svelte';

    type Product = {
        id: string;
        imageUrl: string;
        imageAlt?: string;
        name: string;
        rating?: number;
        price: string;
        currency?: string;
        isFavorite?: boolean;
    };

    type ProductCardSliderProps = {
        products: Product[];
        onFavoriteClick?: (productId: string) => void;
        onQuickViewClick?: (productId: string) => void;
        onAddToCartClick?: (productId: string) => void;
        slidesToShow?: number;
    };

    let {
        products,
        onFavoriteClick,
        onQuickViewClick,
        onAddToCartClick,
        slidesToShow = 4
    }: ProductCardSliderProps = $props();

    let emblaApi: EmblaCarouselType | undefined = $state();
    let canScrollPrev = $state(false);
    let canScrollNext = $state(false);

    const options = { align: 'start' as const, loop: false, slidesToScroll: 3 };

    function onInit(event: CustomEvent<EmblaCarouselType>) {
        emblaApi = event.detail;

        // Update button states initially
        canScrollPrev = emblaApi.canScrollPrev();
        canScrollNext = emblaApi.canScrollNext();

        // Listen for scroll events to update button states
        emblaApi.on('select', () => {
            canScrollPrev = emblaApi?.canScrollPrev() ?? false;
            canScrollNext = emblaApi?.canScrollNext() ?? false;
        });

        // Also listen for init event in case scroll state changes after init
        emblaApi.on('init', () => {
            canScrollPrev = emblaApi?.canScrollPrev() ?? false;
            canScrollNext = emblaApi?.canScrollNext() ?? false;
        });
    }

    const onLeft = () => emblaApi?.scrollPrev();
    const onRight = () => emblaApi?.scrollNext();
</script>

<div class="relative">
    <!-- Navigation Buttons -->
    <button
        class="absolute top-1/2 left-0 z-10 -translate-y-1/2 translate-x-full rounded-full bg-white p-3 shadow-lg transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
        disabled={!canScrollPrev}
        onclick={onLeft}
        aria-label="Previous products"
    >
        <img
            class="h-[26px] w-[26px] rotate-180"
            src="/carousel-arrow.svg"
            alt="<"
        />
    </button>

    <button
        class="absolute top-1/2 right-0 z-10 -translate-y-1/2 -translate-x-full rounded-full bg-white p-3 shadow-lg transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
        disabled={!canScrollNext}
        onclick={onRight}
        aria-label="Next products"
    >
        <img class="h-[26px] w-[26px]" src="/carousel-arrow.svg" alt=">" />
    </button>

    <!-- Carousel Container -->
    <div
        class="overflow-hidden px-4"
        use:emblaCarouselSvelte={{ options, plugins: [] }}
        onemblaInit={onInit}
    >
        <div class="flex gap-4 mx-auto max-w-[85svw]">
            {#each products as product (product.id)}
                <div
                    class="h-[260px] w-[170px] flex-[0_0_170px] lg:h-[460px] lg:w-[400px] lg:flex-[0_0_400px]"
                >
                    <ProductCard
                        class="h-full w-full"
                        imageUrl={product.imageUrl}
                        imageAlt={product.imageAlt}
                        name={product.name}
                        rating={product.rating}
                        price={product.price}
                        currency={product.currency}
                        isFavorite={product.isFavorite}
                        onFavoriteClick={() => onFavoriteClick?.(product.id)}
                        onQuickViewClick={() =>
                            onQuickViewClick?.(product.id)}
                        onAddToCartClick={() => onAddToCartClick?.(product.id)}
                    />
                </div>
            {/each}
        </div>
    </div>
</div>
