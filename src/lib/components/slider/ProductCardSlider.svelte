<script lang="ts">
    import emblaCarouselSvelte from 'embla-carousel-svelte';
    import type {EmblaCarouselType} from 'embla-carousel';
    import * as ProductCard from '@/components/ui/product-card';

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
        tallCards?: boolean;
    };

    let {
        products,
        onFavoriteClick,
        onQuickViewClick,
        onAddToCartClick,
        slidesToShow = 4,
        tallCards = false
    }: ProductCardSliderProps = $props();

    let emblaApi: EmblaCarouselType | undefined = $state();
    let canScrollPrev = $state(false);
    let canScrollNext = $state(false);

    const options = {align: 'start' as const, loop: false, slidesToScroll: 3};

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
                class="h-full w-full aspect-square"
                src="/icons/arrow-left.svg"
                alt="<"
        />
    </button>

    <button
            class="absolute top-1/2 right-0 z-10 -translate-y-1/2 -translate-x-full rounded-full bg-white p-3 shadow-lg transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
            disabled={!canScrollNext}
            onclick={onRight}
            aria-label="Next products"
    >
        <img class="h-full w-full aspect-square" src="/icons/arrow-right.svg" alt=">"/>
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
                        class="h-[260px] w-[170px] flex-[0_0_170px] lg:h-[{tallCards ? 6 : 4}60px] lg:w-[400px] lg:flex-[0_0_400px]"
                >
                    <ProductCard.Root class="h-full w-full">
                        <!-- Image Container -->
                        <ProductCard.Image
                                class="grow"
                                imageUrl={product.imageUrl}
                                imageAlt={product.imageAlt}
                        />

                        <!-- Action Buttons Overlay -->
                        <ProductCard.Actions
                                onFavoriteClick={() => onFavoriteClick?.(product.id)}
                                onQuickViewClick={() => onQuickViewClick?.(product.id)}
                                onAddToCartClick={() => onAddToCartClick?.(product.id)}
                                isFavorite={product.isFavorite}
                        />

                        <!-- Product Description -->
                        <ProductCard.Description>
                            <!-- Product Name -->
                            <ProductCard.Title name={product.name}/>

                            <!-- Rating -->
                            {#if product.rating && product.rating > 0}
                                <ProductCard.Rating rating={product.rating}/>
                            {/if}

                            <!-- Price and Add to Cart -->
                            <ProductCard.Price
                                    price={product.price}
                                    currency={product.currency}
                            />
                        </ProductCard.Description>
                    </ProductCard.Root>
                </div>
            {/each}
        </div>
    </div>
</div>
