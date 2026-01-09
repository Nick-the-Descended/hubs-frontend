<script lang="ts">
    import emblaCarouselSvelte from 'embla-carousel-svelte';
    import type {EmblaCarouselType} from 'embla-carousel';
    import * as ProductCard from '@/components/ui/product-card';
    import {cn} from "@/utils";
    import type {ComponentFanShopProductItem} from '@/types/strapi-generated';
    import {PUBLIC_STRAPI_URL} from '$env/static/public';

    type ProductCardSliderProps = {
        products: ComponentFanShopProductItem[];
        onFavoriteClick?: (productId: string) => void;
        onQuickViewClick?: (productId: string) => void;
        onAddToCartClick?: (productId: string) => void;
        slidesToShow?: number;
        tallCards?: boolean;
        baseUrl?: string;
    };

    let {
        products,
        onFavoriteClick,
        onQuickViewClick,
        onAddToCartClick,
        slidesToShow = 4,
        tallCards = false,
        baseUrl = ''
    }: ProductCardSliderProps = $props();

    // Helper function to get product URL from slug
    // slug is used to construct the link: baseUrl/slug (e.g., "/products/fan-shop/1")
    function getProductUrl(slug: string): string {
        return `${baseUrl}/${slug}`;
    }

    // Helper function to get full image URL from Strapi UploadFile
    // Strapi returns relative paths like "/uploads/img4_26e7b4db51.png"
    // We need to prepend the Strapi backend URL (e.g., "https://cms.znagti.ge/uploads/img4_26e7b4db51.png")
    function getImageUrl(productImage: ComponentFanShopProductItem['productImage']): string {
        if (!productImage?.url) {
            console.warn('Product image URL is undefined', productImage);
            return '/placeholder-image.png'; // Fallback image
        }
        return `${PUBLIC_STRAPI_URL}${productImage.url}`;
    }

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
                        class={cn(
                            "min-h-[260px] w-[170px] flex-[0_0_170px] lg:w-[400px] lg:flex-[0_0_400px]",
                            tallCards ? 'lg:h-[660px]' : 'lg:h-[460px]'
                        )}
                >
                    <ProductCard.Root class="h-full w-full" href={getProductUrl(product.slug)}>
                        <!-- Image Container -->
                        <ProductCard.Image
                                class="grow"
                                imageUrl={getImageUrl(product.productImage)}
                                imageAlt={product.productImage.alternativeText ?? product.productName}
                        />

                        <!-- Action Buttons Overlay -->
                        <ProductCard.Actions
                                onFavoriteClick={() => onFavoriteClick?.(product.id)}
                                onQuickViewClick={() => onQuickViewClick?.(product.id)}
                                onAddToCartClick={() => onAddToCartClick?.(product.id)}
                                isFavorite={product.isFavourite}
                        />

                        <!-- Product Description -->
                        <ProductCard.Description>
                            <!-- Product Name -->
                            <ProductCard.Title name={product.productName}/>

                            <!-- Rating -->
                            {#if product.averageRating && product.averageRating > 0}
                                <ProductCard.Rating rating={product.averageRating}/>
                            {/if}

                            <!-- Price and Add to Cart -->
                            <ProductCard.Price
                                    price={product.price.toString()}
                                    currency="₾"
                            />
                        </ProductCard.Description>
                    </ProductCard.Root>
                </div>
            {/each}
        </div>
    </div>
</div>
