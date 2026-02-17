<script lang="ts">
    import * as Dialog from '@/components/ui/dialog';
    import {Button} from '@/components/ui/button';
    import {Heart, Star} from '@lucide/svelte';
    import {PUBLIC_STRAPI_URL} from '$env/static/public';
    import {localCartStore} from '$lib/stores/local-cart.svelte';

    type StrapiImage = {
        name: string;
        alternativeText: string | null;
        width: number;
        height: number;
        url: string;
        previewUrl: string | null;
    };

    type QuickViewProduct = {
        name: string;
        slug: string;
        shortDescription: string | null;
        averageRating: number | null;
        price: number;
        discountPrice: number | null;
        discountPercentage: number | null;
        isFavourite: boolean | null;
        category: { name: string; slug: string } | null;
        gallery: StrapiImage[];
        mainImage: StrapiImage | null;
    };

    type Props = {
        open: boolean;
        product: QuickViewProduct | null;
        onOpenChange?: (open: boolean) => void;
    };

    let {open = $bindable(false), product, onOpenChange}: Props = $props();

    let selectedImageIndex = $state(0);

    // Build image list from mainImage + gallery
    const images = $derived.by(() => {
        if (!product) return [];
        const imgs: StrapiImage[] = [];
        if (product.mainImage) imgs.push(product.mainImage);
        if (product.gallery) {
            for (const img of product.gallery) {
                if (img.url !== product.mainImage?.url) imgs.push(img);
            }
        }
        return imgs;
    });

    const selectedImage = $derived(images[selectedImageIndex] ?? product?.mainImage);

    // Reset selected image when product changes
    $effect(() => {
        if (product) selectedImageIndex = 0;
    });

    function getImageUrl(image: StrapiImage | null): string {
        if (!image?.url) return '/placeholder-image.png';
        return `${PUBLIC_STRAPI_URL}${image.url}`;
    }

    function getProductUrl(): string {
        if (!product) return '#';
        const categorySlug = product.category?.slug || 'all';
        return `/products/${categorySlug}/all/${product.slug}`;
    }

    // Rating helpers
    const filledStars = $derived(Math.floor(product?.averageRating ?? 0));
    const emptyStars = $derived(5 - filledStars);

    function handleAddToCart() {
        if (!product) return;
        localCartStore.addItem({
            productSlug: product.slug,
            name: product.name,
            price: product.price,
            discountPrice: product.discountPrice ?? null,
            imageUrl: getImageUrl(product.mainImage),
            size: null,
            color: null,
            branding: null
        });
    }
</script>

<Dialog.Root bind:open {onOpenChange}>
    <Dialog.Content
            showCloseButton={true}
            class="max-w-[calc(100%-2rem)] sm:max-w-[860px] p-0 gap-0 overflow-hidden"
    >
        {#if product}
            <!-- Header -->
            <div class="flex items-center justify-between px-6 pt-6 pb-4">
                <h2 class="text-xl font-normal">პროდუქტის სწრაფი დათვალიერება</h2>
                <a
                        href={getProductUrl()}
                        class="text-sm underline text-black hover:text-black/70 transition-colors"
                >
                    სრულად
                </a>
            </div>

            <!-- Body -->
            <div class="flex flex-col sm:flex-row gap-6 px-6 pb-6">
                <!-- Image Gallery -->
                <div class="flex gap-2 sm:w-[400px] shrink-0">
                    <!-- Thumbnails -->
                    {#if images.length > 1}
                        <div class="flex flex-row sm:flex-col gap-1 overflow-auto max-h-[405px]">
                            {#each images as image, i (image.url)}
                                <button
                                        class="w-[59px] h-[64px] shrink-0 overflow-hidden rounded border transition-colors {i === selectedImageIndex ? 'border-black' : 'border-transparent hover:border-gray-300'}"
                                        onclick={() => selectedImageIndex = i}
                                >
                                    <img
                                            src={getImageUrl(image)}
                                            alt={image.alternativeText ?? product.name}
                                            class="w-full h-full object-cover"
                                    />
                                </button>
                            {/each}
                        </div>
                    {/if}

                    <!-- Main Image -->
                    <div class="flex-1 overflow-hidden rounded">
                        <img
                                src={getImageUrl(selectedImage)}
                                alt={selectedImage?.alternativeText ?? product.name}
                                class="w-full h-full max-h-[405px] object-contain"
                        />
                    </div>
                </div>

                <!-- Product Info -->
                <div class="flex flex-col gap-4 flex-1 min-w-0">
                    <!-- Rating -->
                    {#if product.averageRating && product.averageRating > 0}
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-medium">{product.averageRating.toFixed(1)}</span>
                            <div class="flex items-center gap-0.5">
                                {#each Array.from({length: filledStars}) as _, i (i)}
                                    <Star class="h-4 w-4 fill-orange-400 text-orange-400"/>
                                {/each}
                                {#each Array.from({length: emptyStars}) as _, i (i)}
                                    <Star class="h-4 w-4 text-orange-400" fill="none" stroke-width="2"/>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Category -->
                    {#if product.category}
                        <p class="text-xs text-black/80 leading-6">{product.category.name} (კატეგორია)</p>
                    {/if}

                    <!-- Title -->
                    <h3 class="text-sm font-normal uppercase leading-snug">{product.name}</h3>

                    <!-- Color/Description -->
                    {#if product.shortDescription}
                        <p class="text-xs text-black/80 leading-5">{product.shortDescription}</p>
                    {/if}

                    <!-- Price -->
                    <div class="flex items-end justify-between">
                        <div class="flex items-end gap-3">
                            <span class="text-xl font-semibold">
                                {product.discountPrice ?? product.price}<sup class="text-xs">00</sup>GEL
                            </span>
                            {#if product.discountPrice != null && product.discountPrice < product.price}
                                <span class="text-base line-through text-black">
                                    {product.price}<sup class="text-[10px]">00</sup> GEL
                                </span>
                            {/if}
                        </div>
                        {#if product.discountPercentage}
                            <div class="bg-[#930c0c] text-white text-sm font-semibold px-2 py-0.5 rounded-l-lg leading-6">
                                - {product.discountPercentage}%
                            </div>
                        {/if}
                    </div>

                    <!-- Add to Cart Row -->
                    <div class="flex items-center gap-1 mt-auto pt-2">
                        <Button
                                variant="outline"
                                size="icon"
                                class="h-11 w-11 shrink-0 rounded-lg border-black"
                                aria-label="Add to favorites"
                        >
                            <Heart class="h-5 w-5 {product.isFavourite ? 'fill-red-500 text-red-500' : ''}"/>
                        </Button>
                        <Button
                                class="flex-1 h-11 rounded-lg uppercase text-base"
                                onclick={handleAddToCart}
                        >
                            კალათაში დამატება
                        </Button>
                    </div>
                </div>
            </div>
        {/if}
    </Dialog.Content>
</Dialog.Root>
