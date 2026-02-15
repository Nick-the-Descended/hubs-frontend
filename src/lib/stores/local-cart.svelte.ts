import { browser } from '$app/environment';

const STORAGE_KEY = 'local_cart_items';

export interface LocalCartItem {
	productSlug: string;
	name: string;
	price: number;
	discountPrice: number | null;
	imageUrl: string;
	size: string | null;
	color: { hexCode: string; colorName: string } | null;
	branding: { name: string; number: string } | null;
	quantity: number;
}

class LocalCartStore {
	items = $state<LocalCartItem[]>([]);

	get itemCount() {
		return this.items.reduce((sum, item) => sum + item.quantity, 0);
	}

	get total() {
		return this.items.reduce((sum, item) => {
			const price = item.discountPrice ?? item.price;
			return sum + price * item.quantity;
		}, 0);
	}

	initialize() {
		if (!browser) return;
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				this.items = JSON.parse(stored);
			}
		} catch {
			this.items = [];
		}
	}

	private persist() {
		if (!browser) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
	}

	addItem(item: Omit<LocalCartItem, 'quantity'>, quantity = 1) {
		const existing = this.items.find(
			(i) =>
				i.productSlug === item.productSlug &&
				i.size === item.size &&
				i.color?.hexCode === item.color?.hexCode &&
				i.branding?.name === item.branding?.name &&
				i.branding?.number === item.branding?.number
		);

		if (existing) {
			existing.quantity += quantity;
		} else {
			this.items.push({ ...item, quantity });
		}
		this.persist();
	}

	removeItem(index: number) {
		this.items.splice(index, 1);
		this.persist();
	}

	updateQuantity(index: number, quantity: number) {
		if (quantity <= 0) {
			this.removeItem(index);
			return;
		}
		if (this.items[index]) {
			this.items[index].quantity = quantity;
			this.persist();
		}
	}

	clear() {
		this.items = [];
		this.persist();
	}
}

export const localCartStore = new LocalCartStore();
