import type { PageServerLoad } from './$types';
import type { LocalCartItem } from '$lib/stores/local-cart.svelte';

export const load: PageServerLoad = async ({ cookies }) => {
	const raw = cookies.get('local_cart');
	let cartItems: LocalCartItem[] = [];

	if (raw) {
		try {
			const decoded = decodeURIComponent(raw);
			const parsed = JSON.parse(decoded);
			if (Array.isArray(parsed)) {
				cartItems = parsed;
			}
		} catch {
			// Invalid cookie data, return empty cart
		}
	}

	return {
		cartItems
	};
};
