<script lang="ts">
    import {cartStore} from '@/stores/cart.svelte';
    import {customerStore} from '@/stores/customer.svelte';
    import {LanguageSwitcher} from '@/components/ui/language-switcher';
    import * as m from '@/paraglide/messages';

    // Props with Svelte 5 runes for reactivity
    interface NavigationItem {
        label: string;
        href: string;
        subcategories?: Array<{
            label: string;
            href: string;
            description?: string;
        }>;
    }

    interface Props {
        promotionalBanner?: string;
        logoUrl?: string;
        logoAlt?: string;
        navigationItems: Array<NavigationItem>;
    }

    let {
        promotionalBanner,
        logoUrl,
        logoAlt,
        navigationItems
    }: Props = $props();

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
        }, 100);
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
                <img src={logoUrl} alt={logoAlt} class="h-12 w-auto"/>
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
                    <svg
                            class="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                    >
                        <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </a>

                <!-- Cart -->
                <a
                        href="/cart"
                        class="relative hover:text-gray-600"
                        aria-label="{m.cart()} - {m.cart_items({ count: cartItemCount })}"
                >
                    <svg
                            class="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                    >
                        <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
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
                        <svg
                                class="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                        >
                            <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        <span class="text-sm">
							<span class="block text-xs text-gray-500">{m.welcome()}</span>
							<span class="font-medium">{customerName}</span>
						</span>
                    </a>
                {:else}
                    <a
                            href="/auth/login"
                            class="flex items-center gap-2 hover:text-gray-600"
                            aria-label={m.log_in()}
                    >
                        <svg
                                class="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                        >
                            <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        <span class="text-sm">
							<span class="block text-xs text-gray-500">{m.log_in()}</span>
							<span class="font-medium">{m.my_account()}</span>
						</span>
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
        <ul class="flex items-center justify-center gap-12 py-3">
            {#each navigationItems as item, index (item.href)}
                <li class="relative">
                    <a
                            href={item.href}
                            class="text-sm font-medium hover:text-gray-600 transition-colors"
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
    {#if hoveredItemIndex !== null && navigationItems[hoveredItemIndex]?.subcategories}
        {@const currentItem = navigationItems[hoveredItemIndex]}
        <div
                role="menu"
                tabindex="-1"
                class="absolute left-0 right-0 top-full z-50 bg-white border-t border-gray-200 shadow-lg animate-fade-in"
                onmouseenter={handleOverlayEnter}
                onmouseleave={handleOverlayLeave}
        >
            <div class="container mx-auto px-4 py-8">
                <div class="grid grid-cols-4 gap-6">
                    {#each currentItem.subcategories || [] as subcategory (subcategory.href)}
                        <a
                                href={subcategory.href}
                                class="group block rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                            <h3 class="text-sm font-semibold text-gray-900 group-hover:text-gray-600">
                                {subcategory.label}
                            </h3>
                            {#if subcategory.description}
                                <p class="mt-1 text-xs text-gray-500">
                                    {subcategory.description}
                                </p>
                            {/if}
                        </a>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</nav>
