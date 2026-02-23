<script lang="ts">
    import { cartStore } from '$lib/stores/cart.svelte';
    import type { PageData } from './$types';
    import type { MedusaProductDetail } from './+page.server';

    let { data }: { data: PageData } = $props();

    const product = $derived(data.product as MedusaProductDetail | null);

    let selectedImageIndex = $state(0);
    let selectedOptions = $state<Record<string, string>>({});
    let activeTab = $state<'overview' | 'details' | 'reviews'>('overview');
    let brandingName = $state('');
    let brandingNumber = $state('');
    let brandingOption = $state('');
    let addingToCart = $state(false);
    let addedToCart = $state(false);

    const selectedVariant = $derived.by(() => {
        if (!product?.variants?.length) return null;
        if (Object.keys(selectedOptions).length === 0) return product.variants[0];
        return product.variants.find((v) =>
            Object.entries(selectedOptions).every(([key, val]) => v.options[key] === val)
        ) ?? product.variants[0];
    });

    const allImages = $derived.by(() => {
        if (!product) return [];
        const imgs: Array<{ url: string; alternativeText: string | null }> = [];
        if (product.mainImage) imgs.push(product.mainImage);
        for (const img of product.gallery) {
            if (img.url !== product.mainImage?.url) imgs.push(img);
        }
        return imgs;
    });

    const currentImage = $derived(allImages[selectedImageIndex] ?? product?.mainImage ?? null);
    const displayPrice = $derived(selectedVariant?.price ?? product?.price ?? 0);
    const originalPrice = $derived(selectedVariant?.originalPrice ?? product?.originalPrice ?? 0);
    const hasDiscount = $derived(originalPrice > displayPrice);

    const sizeOption = $derived(product?.options?.find((o) => o.title === 'Size') ?? null);
    const colorOption = $derived(product?.options?.find((o) => o.title === 'Color') ?? null);

    const filledStars = $derived(Math.floor(product?.averageRating ?? 0));
    const hasHalfStar = $derived((product?.averageRating ?? 0) % 1 >= 0.5);
    const emptyStars = $derived(5 - filledStars - (hasHalfStar ? 1 : 0));

    async function addToCart() {
        if (!selectedVariant) return;
        addingToCart = true;
        try {
            await cartStore.addItem(selectedVariant.id, 1);
            addedToCart = true;
            setTimeout(() => { addedToCart = false; }, 2000);
        } catch (err) {
            console.error('Failed to add to cart:', err);
        } finally {
            addingToCart = false;
        }
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
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left column: Image Gallery -->
            <div class="flex gap-4">
                <!-- Thumbnail strip -->
                <div class="flex flex-col gap-2 shrink-0">
                    {#each allImages as image, i (image.url)}
                        <button
                            class="w-[80px] h-[80px] lg:w-[106px] lg:h-[106px] rounded-lg overflow-hidden border-2 transition-colors {selectedImageIndex === i ? 'border-black' : 'border-gray-200 hover:border-gray-400'}"
                            onclick={() => selectedImageIndex = i}
                        >
                            <img
                                src={image.url}
                                alt={image.alternativeText || product.name}
                                class="w-full h-full object-cover"
                            />
                        </button>
                    {/each}
                </div>

                <!-- Main image -->
                <div class="flex-1 rounded-2xl overflow-hidden bg-gray-100 aspect-[3/4]">
                    <img
                        src={currentImage?.url ?? '/placeholder-image.png'}
                        alt={currentImage?.alternativeText || product.name}
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
                {#if colorOption?.values?.length}
                    <div>
                        <p class="text-sm font-medium text-gray-700 mb-2">Color</p>
                        <div class="flex items-center gap-2">
                            {#each colorOption.values as colorValue (colorValue)}
                                <button
                                    title={colorValue}
                                    class="px-4 py-2 border rounded-lg text-sm font-medium transition-colors {selectedOptions['Color'] === colorValue ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700 hover:border-gray-500'}"
                                    onclick={() => selectedOptions = { ...selectedOptions, Color: colorValue }}
                                >{colorValue}</button>
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Size selector -->
                {#if sizeOption?.values?.length}
                    <div>
                        <p class="text-sm font-medium text-gray-700 mb-2">Size</p>
                        <div class="flex flex-wrap gap-2">
                            {#each sizeOption.values as sizeValue (sizeValue)}
                                <button
                                    class="px-4 py-2 border rounded-lg text-sm font-medium transition-colors {selectedOptions['Size'] === sizeValue ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700 hover:border-gray-500'}"
                                    onclick={() => selectedOptions = { ...selectedOptions, Size: sizeValue }}
                                >
                                    {sizeValue}
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
                        class="flex-1 bg-black text-white font-semibold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors text-base disabled:opacity-50"
                        onclick={addToCart}
                        disabled={addingToCart || !selectedVariant}
                    >
                        {addedToCart ? 'Added!' : addingToCart ? 'Adding...' : 'Add to cart'}
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
                        class="px-4 py-3 text-sm font-semibold transition-colors {activeTab === 'reviews' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-700'}"
                        onclick={() => activeTab = 'reviews'}
                    >
                        REVIEWS
                    </button>
                </div>

                <div class="py-6">
                    {#if activeTab === 'overview'}
                        <p class="text-gray-700 leading-relaxed">{product.description || 'No description available.'}</p>
                    {:else if activeTab === 'reviews'}
                        <p class="text-gray-500">No reviews yet.</p>
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
