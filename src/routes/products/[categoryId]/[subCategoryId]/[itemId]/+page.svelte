<script lang="ts">
    import {PUBLIC_STRAPI_URL} from '$env/static/public';
    import {localCartStore} from '$lib/stores/local-cart.svelte';
    import type {PageData} from './$types';
    import type {Product, StrapiImage} from './+page.server';

    let {data}: { data: PageData } = $props();

    const product: Product | null = $derived(data.product as Product | null);

    let selectedImageIndex = $state(0);
    let selectedColor = $state<string | null>(null);
    let selectedSize = $state<string | null>(null);
    let activeTab = $state<'overview' | 'details' | 'reviews'>('overview');
    let brandingName = $state('');
    let brandingNumber = $state('');
    let brandingOption = $state('');

    const allImages = $derived.by<StrapiImage[]>(() => {
        if (!product) return [];
        const images: StrapiImage[] = [];
        if (product.mainImage) images.push(product.mainImage);
        if (product.gallery?.length) {
            for (const img of product.gallery) {
                if (img.documentId !== product.mainImage?.documentId) {
                    images.push(img);
                }
            }
        }
        return images;
    });

    function getImageUrl(image: StrapiImage | null): string {
        if (!image?.url) return '/placeholder-image.png';
        return `${PUBLIC_STRAPI_URL}${image.url}`;
    }

    const currentImage = $derived(allImages[selectedImageIndex] || product?.mainImage || null);

    const displayPrice = $derived(product?.discountPrice ?? product?.price ?? 0);
    const originalPrice = $derived(product?.price ?? 0);
    const hasDiscount = $derived(product?.discountPrice != null && product?.discountPrice < (product?.price ?? 0));

    const filledStars = $derived(Math.floor(product?.averageRating ?? 0));
    const hasHalfStar = $derived((product?.averageRating ?? 0) % 1 >= 0.5);
    const emptyStars = $derived(5 - filledStars - (hasHalfStar ? 1 : 0));
    const reviewCount = $derived(product?.reviews?.length ?? 0);

    function addToCart() {
        if (!product) return;
        localCartStore.addItem({
            productSlug: product.slug,
            name: product.name,
            price: product.price,
            discountPrice: product.discountPrice,
            imageUrl: getImageUrl(product.mainImage),
            size: selectedSize,
            color: selectedColor
                ? product.avaliableColors.find(c => c.hexCode === selectedColor) ?? null
                : null,
            branding: product.hasBranding && brandingName
                ? {name: brandingName, number: brandingNumber}
                : null
        });
    }
</script>

{#if product}
    <!-- Breadcrumbs -->
    <nav class="mx-auto max-w-7xl px-4 py-4 text-sm text-gray-500">
        <ol class="flex items-center gap-2">
            <li><a href="/" class="hover:text-gray-700">Home</a></li>
            <li>/</li>
            <li><a href="/products/{data.categoryId}" class="hover:text-gray-700 capitalize">{data.categoryId}</a></li>
            <li>/</li>
            <li><a href="/products/{data.categoryId}/{data.subCategoryId}" class="hover:text-gray-700 capitalize">{data.subCategoryId}</a></li>
            <li>/</li>
            <li class="text-gray-900 font-medium">{product.name}</li>
        </ol>
    </nav>

    <div class="mx-auto max-w-7xl px-4 pb-16">
        <!-- Two-column grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left column: Image Gallery -->
            <div class="flex gap-4">
                <!-- Thumbnail strip -->
                <div class="flex flex-col gap-2 shrink-0">
                    {#each allImages as image, i (image.documentId || i)}
                        <button
                            class="w-[80px] h-[80px] lg:w-[106px] lg:h-[106px] rounded-lg overflow-hidden border-2 transition-colors {selectedImageIndex === i ? 'border-black' : 'border-gray-200 hover:border-gray-400'}"
                            onclick={() => selectedImageIndex = i}
                        >
                            <img
                                src={getImageUrl(image)}
                                alt={image.alternativeText || image.name}
                                class="w-full h-full object-cover"
                            />
                        </button>
                    {/each}
                </div>

                <!-- Main image -->
                <div class="flex-1 rounded-2xl overflow-hidden bg-gray-100 aspect-[3/4]">
                    <img
                        src={getImageUrl(currentImage)}
                        alt={currentImage?.alternativeText || currentImage?.name || product.name}
                        class="w-full h-full object-cover"
                    />
                </div>
            </div>

            <!-- Right column: Product Info -->
            <div class="flex flex-col gap-5">
                <!-- Rating -->
                {#if (product.averageRating ?? 0) > 0}
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-1">
                            {#each Array.from({length: filledStars}) as _, i (i)}
                                <svg class="h-5 w-5 fill-orange-400 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            {/each}
                            {#if hasHalfStar}
                                <svg class="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            {/if}
                            {#each Array.from({length: emptyStars}) as _, i (i)}
                                <svg class="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            {/each}
                        </div>
                        <span class="text-sm text-gray-500">({reviewCount} reviews)</span>
                    </div>
                {/if}

                <!-- Category -->
                {#if product.category?.name}
                    <span class="text-sm text-gray-400 uppercase tracking-wide">{product.category.name}</span>
                {/if}

                <!-- Title -->
                <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>

                <!-- Price -->
                <div class="flex items-center gap-3">
                    <span class="text-3xl font-bold text-gray-900">{displayPrice} ₾</span>
                    {#if hasDiscount}
                        <span class="text-lg text-gray-400 line-through">{originalPrice} ₾</span>
                        {#if product.discountPercentage}
                            <span class="bg-red-700 text-white text-sm font-bold px-2 py-1 rounded">-{product.discountPercentage}%</span>
                        {/if}
                    {/if}
                </div>

                <!-- Color selector -->
                {#if product.avaliableColors?.length}
                    <div>
                        <p class="text-sm font-medium text-gray-700 mb-2">Color</p>
                        <div class="flex items-center gap-2">
                            {#each product.avaliableColors as color (color.hexCode)}
                                <button
                                    title={color.colorName}
                                    class="w-10 h-10 rounded-full border-2 transition-colors {selectedColor === color.hexCode ? 'border-black ring-2 ring-offset-1 ring-black' : 'border-gray-300 hover:border-gray-500'}"
                                    style="background-color: {color.hexCode}"
                                    onclick={() => selectedColor = color.hexCode}
                                ></button>
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Size selector -->
                {#if product.availableSizes?.length}
                    <div>
                        <p class="text-sm font-medium text-gray-700 mb-2">Size</p>
                        <div class="flex flex-wrap gap-2">
                            {#each product.availableSizes as size (size.productSize)}
                                <button
                                    class="px-4 py-2 border rounded-lg text-sm font-medium transition-colors {selectedSize === size.productSize ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700 hover:border-gray-500'}"
                                    onclick={() => selectedSize = size.productSize}
                                >
                                    {size.productSize}
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Branding section -->
                {#if product.hasBranding}
                    <div class="border-t pt-4">
                        <p class="text-sm font-medium text-gray-700 mb-3">Branding</p>
                        <div class="flex flex-col gap-3">
                            <select
                                bind:value={brandingOption}
                                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Select option</option>
                                <option value="name">Name only</option>
                                <option value="number">Number only</option>
                                <option value="both">Name + Number</option>
                            </select>
                            {#if brandingOption === 'name' || brandingOption === 'both'}
                                <input
                                    type="text"
                                    bind:value={brandingName}
                                    placeholder="Name (e.g., KVARATSKHELIA)"
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase"
                                />
                            {/if}
                            {#if brandingOption === 'number' || brandingOption === 'both'}
                                <input
                                    type="text"
                                    bind:value={brandingNumber}
                                    placeholder="Number (e.g., 77)"
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    maxlength="3"
                                />
                            {/if}
                        </div>
                    </div>
                {/if}

                <!-- Actions -->
                <div class="flex items-center gap-3 mt-2">
                    <button
                        class="w-14 h-14 flex items-center justify-center border border-gray-300 rounded-lg hover:border-gray-500 transition-colors shrink-0"
                        aria-label="Add to favorites"
                    >
                        <svg class="w-6 h-6 {product.isFavourite ? 'fill-red-500 text-red-500' : 'text-gray-600'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </button>
                    <button
                        class="flex-1 bg-black text-white font-semibold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors text-base"
                        onclick={addToCart}
                    >
                        Add to cart
                    </button>
                </div>
            </div>
        </div>

        <!-- Bottom section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            <!-- Tabs -->
            <div>
                <div class="flex border-b border-gray-200">
                    <button
                        class="px-4 py-3 text-sm font-semibold transition-colors {activeTab === 'overview' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-700'}"
                        onclick={() => activeTab = 'overview'}
                    >
                        OVERVIEW
                    </button>
                    <button
                        class="px-4 py-3 text-sm font-semibold transition-colors {activeTab === 'details' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-700'}"
                        onclick={() => activeTab = 'details'}
                    >
                        PRODUCT DETAILS
                    </button>
                    <button
                        class="px-4 py-3 text-sm font-semibold transition-colors {activeTab === 'reviews' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-700'}"
                        onclick={() => activeTab = 'reviews'}
                    >
                        REVIEWS ({reviewCount})
                    </button>
                </div>

                <div class="py-6">
                    {#if activeTab === 'overview'}
                        <p class="text-gray-700 leading-relaxed">{product.shortDescription || 'No overview available.'}</p>
                    {:else if activeTab === 'details'}
                        {#if product.detailedDescription?.length}
                            <div class="text-gray-700 leading-relaxed space-y-4">
                                {#each product.detailedDescription as block}
                                    {#if block.type === 'paragraph'}
                                        <p>
                                            {#each block.children as child}
                                                {#if child.type === 'text'}
                                                    {#if child.bold}<strong>{child.text}</strong>
                                                    {:else if child.italic}<em>{child.text}</em>
                                                    {:else}{child.text}
                                                    {/if}
                                                {:else if child.type === 'link'}
                                                    <a href={child.url} class="text-blue-600 underline">{child.children?.[0]?.text ?? ''}</a>
                                                {/if}
                                            {/each}
                                        </p>
                                    {:else if block.type === 'heading'}
                                        <h3 class="font-semibold text-lg text-gray-900">
                                            {#each block.children as child}{child.text ?? ''}{/each}
                                        </h3>
                                    {:else if block.type === 'list'}
                                        <ul class="list-disc pl-5 space-y-1">
                                            {#each block.children as item}
                                                <li>
                                                    {#each item.children ?? [] as child}{child.text ?? ''}{/each}
                                                </li>
                                            {/each}
                                        </ul>
                                    {/if}
                                {/each}
                            </div>
                        {:else}
                            <p class="text-gray-500">No details available.</p>
                        {/if}
                    {:else if activeTab === 'reviews'}
                        {#if product.reviews?.length}
                            <div class="flex flex-col gap-6">
                                {#each product.reviews as review}
                                    <div class="border-b border-gray-100 pb-4 last:border-0">
                                        <div class="flex items-center gap-2 mb-2">
                                            <span class="font-semibold text-gray-900">{review.reviewerName}</span>
                                            <div class="flex items-center gap-0.5">
                                                {#each Array.from({length: 5}) as _, i (i)}
                                                    <svg class="h-4 w-4 {i < review.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i < review.rating ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                    </svg>
                                                {/each}
                                            </div>
                                        </div>
                                        <p class="text-gray-600 text-sm">{review.comment}</p>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <p class="text-gray-500">No reviews yet.</p>
                        {/if}
                    {/if}
                </div>
            </div>

            <!-- Benefits Card -->
            <div>
                <div class="border border-gray-200 rounded-xl p-6">
                    <h3 class="font-semibold text-gray-900 mb-4">Our Advantages</h3>
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center gap-3">
                            <svg class="w-6 h-6 text-gray-600 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                <circle cx="5.5" cy="18.5" r="2.5"/>
                                <circle cx="18.5" cy="18.5" r="2.5"/>
                            </svg>
                            <span class="text-sm text-gray-700">Free delivery across Georgia</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <svg class="w-6 h-6 text-gray-600 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="17 1 21 5 17 9"/>
                                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                                <polyline points="7 23 3 19 7 15"/>
                                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                            </svg>
                            <span class="text-sm text-gray-700">Return/exchange policy</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{:else}
    <div class="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <p class="text-gray-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <a href="/products/all" class="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            Browse products
        </a>
    </div>
{/if}
