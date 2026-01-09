<script lang="ts">
    import type {PageData} from './$types';
    import {PUBLIC_STRAPI_URL} from '$env/static/public';
    import * as Breadcrumb from '@/components/ui/breadcrumb';
    import ProductCardSlider from '@/components/slider/ProductCardSlider.svelte';
    import type {ComponentDefaultNavigationItem} from '@/types/strapi-generated';
    import {Button} from "@/components/ui/button";

    let {data}: { data: PageData } = $props();

    const fanShop = $derived(data.fanShop);

    // Find the fan-shop navigation item and use its subcategories
    const fanShopNavItem = $derived(
        data.navigationItems.find(item => item.href?.includes('fan-shop'))
    );
    const navigationItems = $derived(fanShopNavItem?.subcategories || []);

    // Hover state for left navigation overlay
    let hoveredItemIndex = $state<number | null>(null);
    let isOverlayHovered = $state(false);
    let timeoutId: number | null = null;
    let sidebarElement: HTMLElement | null = $state(null);
    let overlayPosition = $state({ left: 0, top: 0, bottom: 0 });

    // Derived state for product types visibility
    let showProductTypes = $derived(
        hoveredItemIndex !== null &&
        hoveredItemIndex >= 0 &&
        hoveredItemIndex < navigationItems.length &&
        (navigationItems[hoveredItemIndex].subcategories?.length ?? 0) > 0
    );

    // Update overlay position when hovering
    $effect(() => {
        if (showProductTypes && sidebarElement) {
            const rect = sidebarElement.getBoundingClientRect();
            overlayPosition = {
                left: rect.right,
                top: rect.top,
                height: rect.height,
                ...rect
            };
        }
    });

    // Get products directly from fanShop (no transformation needed)
    const products = $derived(fanShop?.productList || []);

    function handleNavItemEnter(index: number) {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        hoveredItemIndex = index;
    }

    function handleNavItemLeave() {
        timeoutId = window.setTimeout(() => {
            if (!isOverlayHovered) {
                hoveredItemIndex = null;
            }
        }, 200);
    }

    function handleOverlayEnter() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        isOverlayHovered = true;
    }

    function handleOverlayLeave() {
        isOverlayHovered = false;
        hoveredItemIndex = null;
    }
</script>

<div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6">
        {#if fanShop}
            <!-- Row 1: Left Column (Breadcrumb + Navigation) + Banner (max-width 1200px) -->
            <div class="mx-auto mb-8">
                <div class="flex gap-6">
                    <!-- Left Column: Breadcrumb + Navigation -->
                    <aside class="w-fi flex-shrink-0 basis-1 grow">
                        <div class="space-y-4">
                            <!-- Breadcrumb -->
                            <Breadcrumb.Root>
                                <Breadcrumb.List>
                                    <Breadcrumb.Item>
                                        <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
                                    </Breadcrumb.Item>
                                    <Breadcrumb.Separator/>
                                    <Breadcrumb.Item>
                                        <Breadcrumb.Link href="/products">Products</Breadcrumb.Link>
                                    </Breadcrumb.Item>
                                    <Breadcrumb.Separator/>
                                    <Breadcrumb.Item>
                                        <Breadcrumb.Page>Fan Shop</Breadcrumb.Page>
                                    </Breadcrumb.Item>
                                </Breadcrumb.List>
                            </Breadcrumb.Root>

                            <!-- Navigation -->
                            <nav class="sticky top-4 rounded-lg bg-white shadow-sm" bind:this={sidebarElement}>
                                <ul>
                                    {#each navigationItems as item, index (index)}
                                        <li class="relative">
                                            <a
                                                    href={`/products${item.href}`}
                                                    class="group flex items-center gap-3 px-6 py-6 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                                                    onmouseenter={() => handleNavItemEnter(index)}
                                                    onmouseleave={handleNavItemLeave}
                                            >
                                                {#if item.hasIcon && item.icon}
                                                    <img
                                                            src={`${PUBLIC_STRAPI_URL}${item.icon.url}`}
                                                            alt={item.label}
                                                            class="h-5 w-5 object-contain flex-shrink-0"
                                                    />
                                                {/if}
                                                <span>{item.label}</span>
                                            </a>
                                        </li>
                                    {/each}
                                </ul>
                            </nav>
                        </div>
                    </aside>

                    <!-- Product Types Overlay (positioned to the right of sidebar, overlaying banner) -->
                    {#if showProductTypes && hoveredItemIndex !== null}
                        {@const currentItem = navigationItems[hoveredItemIndex]}
                        <div
                                role="menu"
                                tabindex="-1"
                                class="fixed z-50 rounded-lg bg-white shadow-xl animate-fade-in border border-gray-200 w-max"
                                onmouseenter={handleOverlayEnter}
                                onmouseleave={handleOverlayLeave}
                                style="left: {overlayPosition.left}px; top: {overlayPosition.top}px; min-height: {overlayPosition.height}px; overflow-y: auto;"
                        >
                            <div class="p-6">
                                <img
                                        src={PUBLIC_STRAPI_URL + currentItem.icon.url}
                                        alt={currentItem.label}
                                        class="h-12 w-auto mb-3"
                                />
                                <div class="grid gap-2">
                                    {#each currentItem.subcategories || [] as subcategory, index (index)}
                                        {#if subcategory}
                                            <div class="space-y-1">
                                                <!-- Subcategory Header with Icon -->
                                                <a
                                                        href={`/products${subcategory.href}`}
                                                        class="group flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                                                >
                                                    {#if subcategory.hasIcon}
                                                        <img
                                                                src={`${PUBLIC_STRAPI_URL}${subcategory.icon.url}`}
                                                                alt={subcategory.label}
                                                                class="h-6 w-6 object-contain flex-shrink-0"
                                                        />
                                                    {/if}
                                                    <div class="flex-1 min-w-0">
                                                        <h3 class="text-sm font-semibold text-gray-900 group-hover:text-gray-600 truncate">
                                                            {subcategory.label}
                                                        </h3>
                                                    </div>
                                                </a>

                                                <!-- Product Types List -->
                                                {#if subcategory.subcategories && subcategory.subcategories.length > 0}
                                                    <ul class="space-y-1 pl-3 border-l-2 border-gray-100">
                                                        {#each subcategory.subcategories as productType}
                                                            {#if productType && productType.label}
                                                                <li>
                                                                    <a
                                                                            class="block text-xs text-gray-600 hover:text-gray-900 py-1 px-2 rounded hover:bg-gray-50 transition-colors"
                                                                            href={`/products${subcategory.href}?type=${productType.label}`}
                                                                    >
                                                                        {productType.label}
                                                                    </a>
                                                                </li>
                                                            {/if}
                                                        {/each}
                                                    </ul>
                                                {/if}
                                            </div>
                                        {/if}
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Banner Section -->
                    {#if fanShop.Banner}
                        {#if fanShop.Banner.buttonText}
                            <!-- Banner with button -->
                            <div class="relative flex-1 basis-5 overflow-hidden rounded-lg grow">
                                <img
                                        src={PUBLIC_STRAPI_URL + fanShop.Banner.Image.url}
                                        alt={fanShop.Banner.Image.name}
                                        width={fanShop.Banner.Image.width}
                                        height={fanShop.Banner.Image.height}
                                        class="h-full w-full object-cover"
                                />
                                <div class="absolute inset-0 flex items-end justify-center pb-8">
                                    <Button variant="banner" size="banner" href="/products/fan-shop/all">
                                        {fanShop.Banner.buttonText}
                                    </Button>
                                </div>
                            </div>
                        {:else}
                            <!-- Clickable banner without button -->
                            <a href="/products/fan-shop/all" class="relative flex-1 basis-5 overflow-hidden rounded-lg grow block cursor-pointer transition-opacity hover:opacity-90">
                                <img
                                        src={PUBLIC_STRAPI_URL + fanShop.Banner.Image.url}
                                        alt={fanShop.Banner.Image.name}
                                        width={fanShop.Banner.Image.width}
                                        height={fanShop.Banner.Image.height}
                                        class="h-full w-full object-cover"
                                />
                            </a>
                        {/if}
                    {/if}
                </div>
            </div>

            <!-- Row 2: Products Slider (full width) -->
            {#if products.length > 0}
                <div class="mb-8">
                    <div class="container mx-auto px-4 flex w-full items-center justify-between">
                        <h2 class="mb-6 text-2xl font-bold text-gray-900">{fanShop.productListTitle}</h2>
                        <div class="text-center">
                            <a
                                    href="/products/fan-shop/all"
                                    class="inline-flex items-center gap-2 rounded-lg py-3 text-sm font-semibold"
                            >
                                {fanShop.seeMore || 'See more'}
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <ProductCardSlider
                            products={products}
                            baseUrl="/products/fan-shop"
                            onFavoriteClick={(productId) => console.log('Favorite:', productId)}
                            onQuickViewClick={(productId) => console.log('Quick view:', productId)}
                            onAddToCartClick={(productId) => console.log('Add to cart:', productId)}
                            tallCards={true}
                    />
                </div>
            {/if}
        {:else}
            <div class="flex items-center justify-center py-16">
                <p class="text-gray-500">No fan shop data available</p>
            </div>
        {/if}
    </div>
</div>

<style>
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-fade-in {
        animation: fade-in 0.2s ease-out;
    }
</style>
