import { sdk } from '$lib/sdk';
import { cartStore } from './cart.svelte';
import { customerStore } from './customer.svelte';

/**
 * Transfer the current anonymous cart to the authenticated customer.
 * No-op if no cart exists or user isn't authenticated. Idempotent.
 */
export async function transferCartToCustomer() {
    if (!cartStore.cart?.id || !customerStore.isAuthenticated) return;

    try {
        const { cart } = await sdk.store.cart.transferCart(cartStore.cart.id);
        cartStore.cart = cart;
    } catch (err) {
        console.warn('Cart transfer failed (non-blocking):', err);
    }
}

/**
 * Login and transfer the current anonymous cart to the customer.
 */
export async function loginWithCart(email: string, password: string) {
    await customerStore.login(email, password);
    await transferCartToCustomer();
}

/**
 * Register, auto-login, and transfer the current anonymous cart.
 */
export async function registerWithCart(
    email: string,
    password: string,
    firstName: string,
    lastName: string
) {
    await customerStore.registerLegacy(email, password, firstName, lastName);
    // registerLegacy sets customer but doesn't establish a session — login to get session
    await customerStore.login(email, password);
    await transferCartToCustomer();
}

/**
 * Logout and create a fresh anonymous cart for the next user.
 */
export async function logoutWithCart() {
    await customerStore.logout();
    cartStore.clearCart();
    await cartStore.create().catch(() => {});
}
