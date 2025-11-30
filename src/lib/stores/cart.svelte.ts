import { sdk } from '$lib/sdk';
import type { StoreCart, StoreOrder } from '@medusajs/types';

class CartStore {
    cart = $state<StoreCart | null>(null);
    loading = $state(false);
    error = $state<string | null>(null);

    get itemCount() {
        return (
            this.cart?.items?.reduce(
                (sum, item) => sum + item.quantity,
                0
            ) ?? 0
        );
    }

    get total() {
        return this.cart?.total ? this.cart.total / 100 : 0;
    }

    get subtotal() {
        return this.cart?.subtotal ? this.cart.subtotal / 100 : 0;
    }

    async initialize() {
        this.loading = true;
        try {
            const cartId = this.getCartId();

            if (cartId) {
                try {
                    const { cart } = await sdk.store.cart.retrieve(cartId);
                    this.cart = cart;
                } catch (err) {
                    // Cart doesn't exist or is invalid, create new one
                    console.log('Cart not found, creating new cart');
                    await this.create();
                }
            } else {
                await this.create();
            }
        } catch (err) {
            console.error('Failed to initialize cart:', err);
            this.error = 'Failed to initialize cart';
        } finally {
            this.loading = false;
        }
    }

    async create(regionId?: string) {
        try {
            const payload: any = {};
            if (regionId) {
                payload.region_id = regionId;
            }

            const { cart } = await sdk.store.cart.create(payload);
            this.cart = cart;
            this.setCartId(cart.id);
            return cart;
        } catch (err: any) {
            this.error = err.message;
            throw err;
        }
    }

    async addItem(variantId: string, quantity: number) {
        if (!this.cart) {
            await this.initialize();
            if (!this.cart) throw new Error('No cart available');
        }

        this.loading = true;
        this.error = null;
        try {
            const { cart } = await sdk.store.cart.createLineItem(
                this.cart.id,
                {
                    variant_id: variantId,
                    quantity
                }
            );
            this.cart = cart;
        } catch (err: any) {
            this.error = err.message;
            throw err;
        } finally {
            this.loading = false;
        }
    }

    async updateItem(lineItemId: string, quantity: number) {
        if (!this.cart) return;

        this.loading = true;
        this.error = null;
        try {
            const { cart } = await sdk.store.cart.updateLineItem(
                this.cart.id,
                lineItemId,
                { quantity }
            );
            this.cart = cart;
        } catch (err: any) {
            this.error = err.message;
            throw err;
        } finally {
            this.loading = false;
        }
    }

    async removeItem(lineItemId: string) {
        if (!this.cart) return;

        this.loading = true;
        this.error = null;
        try {
            // IMPORTANT: deleteLineItem returns { parent: cart }
            const response = await sdk.store.cart.deleteLineItem(
                this.cart.id,
                lineItemId
            );
            this.cart = response.parent || null;
        } catch (err: any) {
            this.error = err.message;
            throw err;
        } finally {
            this.loading = false;
        }
    }

    async updateEmail(email: string) {
        if (!this.cart) return;

        this.loading = true;
        try {
            const { cart } = await sdk.store.cart.update(this.cart.id, {
                email
            });
            this.cart = cart;
        } finally {
            this.loading = false;
        }
    }

    async setShippingAddress(address: {
        first_name: string;
        last_name: string;
        address_1: string;
        city: string;
        country_code: string;
        postal_code: string;
        phone?: string;
    }) {
        if (!this.cart) return;

        this.loading = true;
        try {
            const { cart } = await sdk.store.cart.update(this.cart.id, {
                shipping_address: address
            });
            this.cart = cart;
        } catch (err: any) {
            this.error = err.message;
            throw err;
        } finally {
            this.loading = false;
        }
    }

    async addShippingMethod(optionId: string) {
        if (!this.cart) return;

        this.loading = true;
        try {
            const { cart } = await sdk.store.cart.addShippingMethod(
                this.cart.id,
                {
                    option_id: optionId
                }
            );
            this.cart = cart;
        } catch (err: any) {
            this.error = err.message;
            throw err;
        } finally {
            this.loading = false;
        }
    }

    async createPaymentSession() {
        if (!this.cart) return;

        this.loading = true;
        try {
            // TODO: Create payment session
            // const { cart } = await sdk.store.cart.createPaymentSession(this.cart.id);
            // this.cart = cart;
            throw new Error('Payments are not supported yet');
        } catch (err: any) {
            this.error = err.message;
            throw err;
        } finally {
            this.loading = false;
        }
    }

    async complete(): Promise<StoreOrder | null> {
        if (!this.cart) return null;

        this.loading = true;
        this.error = null;
        try {
            // IMPORTANT: complete() returns different structure
            const result = await sdk.store.cart.complete(this.cart.id);

            if (result.type === 'order' && result.order) {
                // Success - order was placed
                this.clearCart();
                return result.order;
            } else if (result.type === 'cart' && result.cart) {
                // Error - cart completion failed
                this.cart = result.cart;
                this.error =
                    result.error?.message || 'Failed to complete cart';
                throw new Error(JSON.stringify(result.error));
            }

            return null;
        } catch (err: any) {
            this.error = err.message || 'Failed to complete order';
            throw err;
        } finally {
            this.loading = false;
        }
    }

    clearCart() {
        this.cart = null;
        this.error = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('medusa_cart_id');
        }
    }

    private getCartId(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('medusa_cart_id');
    }

    private setCartId(id: string) {
        if (typeof window === 'undefined') return;
        localStorage.setItem('medusa_cart_id', id);
    }
}

export const cartStore = new CartStore();
