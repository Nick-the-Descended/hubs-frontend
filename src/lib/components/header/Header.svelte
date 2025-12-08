<script lang="ts">
	import { cartStore } from '@/stores/cart.svelte';
	import { customerStore } from '@/stores/customer.svelte';

	// Props with Svelte 5 runes for reactivity
	interface Props {
		promotionalBanner?: string;
		logoUrl?: string;
		logoAlt?: string;
		searchPlaceholder?: string;
		languages?: Array<{ code: string; label: string }>;
		navigationItems?: Array<{ label: string; href: string }>;
	}

	let {
		promotionalBanner = 'Discount promotion/seasonal offer/....',
		logoUrl = '/logo.svg',
		logoAlt = 'HubsGe',
		searchPlaceholder = 'ძიება...',
		languages = [
			{ code: 'GEO', label: 'GEO' },
			{ code: 'ENG', label: 'ENG' }
		],
		navigationItems = [
			{ label: 'ფან-მოპი', href: '/products/cleaning' },
			{ label: 'ფიხტანი', href: '/products/fixtures' },
			{ label: 'კალენი', href: '/products/stairs' },
			{ label: 'ბრენდები', href: '/products/brands' },
			{ label: 'მაგაზიები', href: '/stores' },
			{ label: 'ქალი', href: '/products/women' },
			{ label: 'ფიტდაკოსმეტი', href: '/products/fitness-cosmetics' },
			{ label: 'აკულლები', href: '/products/accessories' }
		]
	}: Props = $props();

	// Local state for search and language selector
	let searchQuery = $state('');
	let selectedLanguage = $state(languages[0]?.code || 'GEO');
	let isLanguageDropdownOpen = $state(false);

	// Derived state for cart item count
	let cartItemCount = $derived(cartStore?.itemCount || 0);
	let isAuthenticated = $derived(customerStore.isAuthenticated);
	let customerName = $derived(customerStore.customer?.first_name || 'My Account');

	// Functions
	function handleSearch(event: Event) {
		event.preventDefault();
		// Implement search functionality
		console.log('Searching for:', searchQuery);
	}

	function toggleLanguageDropdown() {
		isLanguageDropdownOpen = !isLanguageDropdownOpen;
	}

	function selectLanguage(code: string) {
		selectedLanguage = code;
		isLanguageDropdownOpen = false;
	}
</script>

<!-- Promotional Banner -->
{#if promotionalBanner}
	<aside class="bg-gray-100 py-2 text-center text-sm text-gray-700" role="banner">
		{promotionalBanner}
	</aside>
{/if}

<!-- Main Header -->
<header class="border-b border-gray-200 bg-white">
	<div class="container mx-auto px-4 py-4">
		<div class="flex items-center justify-between gap-4">
			<!-- Logo -->
			<a href="/" class="flex-shrink-0" aria-label="Home">
				<img src={logoUrl} alt={logoAlt} class="h-12 w-auto" />
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
						placeholder={searchPlaceholder}
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
				<div class="relative">
					<button
						onclick={toggleLanguageDropdown}
						class="flex items-center gap-1 text-sm font-medium hover:text-gray-600"
						aria-label="Select language"
						aria-expanded={isLanguageDropdownOpen}
						aria-haspopup="true"
					>
						{selectedLanguage}
						<svg
							class="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>

					{#if isLanguageDropdownOpen}
						<div
							class="absolute right-0 top-full mt-2 w-24 rounded-md border border-gray-200 bg-white shadow-lg"
							role="menu"
						>
							{#each languages as lang}
								<button
									onclick={() => selectLanguage(lang.code)}
									class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
									class:bg-gray-100={selectedLanguage === lang.code}
									role="menuitem"
								>
									{lang.label}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Wishlist -->
				<a
					href="/wishlist"
					class="hover:text-gray-600"
					aria-label="Wishlist"
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
					aria-label="Shopping cart with {cartItemCount} items"
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
							aria-label="{cartItemCount} items"
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
						aria-label="My account"
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
							<span class="block text-xs text-gray-500">Welcome</span>
							<span class="font-medium">{customerName}</span>
						</span>
					</a>
				{:else}
					<a
						href="/auth/login"
						class="flex items-center gap-2 hover:text-gray-600"
						aria-label="Log in to your account"
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
							<span class="block text-xs text-gray-500">Log In</span>
							<span class="font-medium">My Account</span>
						</span>
					</a>
				{/if}
			</div>
		</div>
	</div>
</header>

<!-- Navigation Menu -->
<nav
	class="border-b border-gray-200 bg-white"
	aria-label="Main navigation"
>
	<div class="container mx-auto px-4">
		<ul class="flex items-center justify-between gap-6 py-3">
			{#each navigationItems as item}
				<li>
					<a
						href={item.href}
						class="text-sm font-medium hover:text-gray-600"
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</nav>
