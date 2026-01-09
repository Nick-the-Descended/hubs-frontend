<script lang="ts">
    import {cartStore} from '@/stores/cart.svelte';
    import {customerStore} from '@/stores/customer.svelte';
    import {LanguageSwitcher} from '@/components/ui/language-switcher';
    import * as m from '@/paraglide/messages';
    import type {ComponentDefaultNavigationItem} from '@/types/strapi-generated';
    import {PUBLIC_STRAPI_URL} from '$env/static/public';

    interface Props {
        promotionalBanner?: string;
        logoUrl?: string;
        logoAlt?: string;
        navigationItems: Array<ComponentDefaultNavigationItem>;
    }

    let {
        promotionalBanner,
        logoUrl,
        logoAlt,
        navigationItems
    }: Props = $props();

    $inspect('navigationItems', navigationItems[1].subcategories[0])

    // Local state for search
    let searchQuery = $state('');

    // Hover state for navigation overlay
    let hoveredItemIndex = $state<number | null>(null);
    let isOverlayHovered = $state(false);
    let timeoutId: number | null = null;

    // Derived state for cart item count
    let cartItemCount = $derived(cartStore?.itemCount || 0);
    let isAuthenticated = $derived(customerStore.isAuthenticated);
    let customerName = $derived(customerStore.customer?.first_name || m.my_account());

    // Derived state for subcategories visibility
    let showSubcategories = $derived(
        hoveredItemIndex !== null &&
        hoveredItemIndex >= 0 &&
        hoveredItemIndex < navigationItems.length &&
        (navigationItems[hoveredItemIndex].subcategories?.length ?? 0) > 0
    );

    // Functions
    function handleSearch(event: Event) {
        event.preventDefault();
        // Implement search functionality
        console.log('Searching for:', searchQuery);
    }

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

<!-- Promotional Banner -->
{#if promotionalBanner}
    <aside class="bg-gray-100 py-2 text-center text-sm text-gray-700">
        {promotionalBanner}
    </aside>
{/if}

<!-- Main Header -->
<header class="border-b border-gray-200 bg-white">
    <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between gap-4">
            <!-- Logo -->
            <a href="/" class="flex-shrink-0" aria-label="Home">
                <img src={logoUrl||"/logo.svg"} alt={logoAlt||"Hubs.ge"} class="h-12 w-auto"/>
            </a>

            <!-- Search Bar -->
            <form
                    onsubmit={handleSearch}
                    class="flex-1 max-w-2xl"
                    role="search"
            >
                <label for="search-input" class="sr-only">Search</label>
                <div class="relative">
                    <input
                            id="search-input"
                            type="search"
                            bind:value={searchQuery}
                            placeholder={m.search_placeholder()}
                            class="w-full rounded-full border border-gray-300 px-6 py-3 pr-12 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                            aria-label="Search products"
                    />
                    <button
                            type="submit"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            aria-label="Submit search"
                    >
                        <svg
                                class="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                        >
                            <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </button>
                </div>
            </form>

            <!-- Actions -->
            <div class="flex items-center gap-4">
                <!-- Language Selector -->
                <LanguageSwitcher/>

                <!-- Wishlist -->
                <a
                        href="/wishlist"
                        class="hover:text-gray-600"
                        aria-label={m.wishlist()}
                >
                    <img src="/icons/heart.svg" alt="Wishlist" class="h-6 w-6" aria-hidden="true">
                </a>

                <!-- Cart -->
                <a
                        href="/cart"
                        class="relative hover:text-gray-600"
                        aria-label="{m.cart()} - {m.cart_items({ count: cartItemCount })}"
                >
                    <img src="/icons/shopping-cart.svg" alt="Shopping Cart" class="h-6 w-6" aria-hidden="true">
                    {#if cartItemCount > 0}
						<span
                                class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                                aria-label={m.cart_items({ count: cartItemCount })}
                        >
							{cartItemCount}
						</span>
                    {/if}
                </a>

                <!-- Account -->
                {#if isAuthenticated}
                    <a
                            href="/profile"
                            class="flex items-center gap-2 hover:text-gray-600"
                            aria-label={m.my_account()}
                    >
                        <span class="text-sm">
							<span class="block text-xs text-gray-500">{m.welcome()}</span>
							<span class="font-medium">{customerName}</span>
						</span>
                        <img src="/icons/user.svg" alt="User" class="h-6 w-6">
                    </a>
                {:else}
                    <a
                            href="/auth/login"
                            class="flex items-center gap-2 hover:text-gray-600"
                            aria-label={m.log_in()}
                    >
                        <span class="text-sm">
							<span class="block text-xs text-gray-500">{m.log_in()}</span>
							<span class="font-medium">{m.my_account()}</span>
						</span>
                        <img src="/icons/user.svg" alt="User" class="h-6 w-6">
                    </a>
                {/if}
            </div>
        </div>
    </div>
</header>

<!-- Navigation Menu -->
<nav
        class="relative border-b border-gray-200 bg-white"
        aria-label="Main navigation"
>
    <div class="container mx-auto px-4">
        <ul class="flex items-center justify-start ml-16">
            {#each navigationItems as item, index (index)}
                <li class="relative">
                    <a
                            href={`/products${item.href}`}
                            class="block text-sm font-medium transition-colors px-4 py-4 hover:bg-gray-300/30 active:bg-gray-300/30"
                            onmouseenter={() => handleNavItemEnter(index)}
                            onmouseleave={handleNavItemLeave}
                    >
                        {item.label}
                    </a>
                </li>
            {/each}
        </ul>
    </div>

    <!-- Subcategory Overlay -->
    {#if showSubcategories && hoveredItemIndex !== null}
        {@const currentItem = navigationItems[hoveredItemIndex]}
        <div
                role="menu"
                tabindex="-1"
                class="absolute left-0 right-0 top-full z-50 bg-white shadow-lg animate-fade-in"
                onmouseenter={handleOverlayEnter}
                onmouseleave={handleOverlayLeave}
        >
            <div class="container mx-auto px-4 py-8">
                <div class="grid grid-cols-4 gap-8">
                    {#each currentItem.subcategories || [] as subcategory, index (index)}
                        {#if subcategory}
                            <div class="space-y-3">
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
</nav>
