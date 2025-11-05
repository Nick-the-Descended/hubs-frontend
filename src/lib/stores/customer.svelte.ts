import {sdk} from '$lib/sdk';
import type {StoreCustomer} from '@medusajs/types';

class CustomerStore {
    customer = $state<StoreCustomer | null>(null);
    loading = $state(false);
    error = $state<string | null>(null);
    isAuthenticated = $derived(this.customer !== null);

    async login(email: string, password: string) {
        this.loading = true;
        this.error = null;
        try {
            await sdk.auth.login('customer', 'emailpass', {
                email,
                password
            });
            await this.fetchCustomer();
        } catch (err: any) {
            this.error = err.message;
            throw err;
        } finally {
            this.loading = false;
        }
    }

    async register(email: string, password: string, firstName: string, lastName: string) {
        this.loading = true;
        this.error = null;
        try {
            const token = await sdk.auth.register('customer', 'emailpass', {
                email,
                password
            });

            const {customer} = await sdk.store.customer.create(
                {
                    "email": email,
                    "first_name": firstName,
                    "last_name": lastName
                },
                {},
                {
                    Authorization: `Bearer ${token}`
                }
            )

            this.customer = customer;
        } catch (err: any) {
            this.error = err.message;
            throw err;
        } finally {
            this.loading = false;
        }
    }

    async logout() {
        await sdk.auth.logout();
        this.customer = null;
    }

    async fetchCustomer() {
        try {
            const {customer} = await sdk.store.customer.retrieve();
            this.customer = customer;
        } catch (err) {
            this.customer = null;
        }
    }

    async initialize() {
        // Try to fetch customer on app load (in case they're already logged in)
        await this.fetchCustomer();
    }
}

export const customerStore = new CustomerStore();