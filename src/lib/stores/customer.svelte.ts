import {sdk} from '$lib/sdk';
import type {StoreCustomer} from '@medusajs/types';
import { PUBLIC_MEDUSA_BACKEND_URL, PUBLIC_MEDUSA_PUBLISHABLE_KEY } from '$env/static/public';

class CustomerStore {
    customer = $state<StoreCustomer | null>(null);
    loading = $state(false);
    error = $state<string | null>(null);
    isAuthenticated = $derived(this.customer !== null);
    registrationPhone = $state<string | null>(null);

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

    /**
     * New phone-based registration using phone-auth provider
     * Uses SDK: register with phone-auth provider -> create customer -> verify OTP
     */
    async register(
        phone: string,
        password: string,
        firstName: string,
        lastName: string,
        email?: string
    ) {
        this.loading = true;
        this.error = null;
        try {
            // Step 1: Register auth identity using phone-auth provider (this gets us a JWT token)
            const token = await sdk.auth.register('customer', 'phone-auth', {
                phone: phone,
                password: password
            });

            // Step 2: Create customer using SDK with token
            const { customer } = await sdk.store.customer.create(
                {
                    email: email || `${phone}@placeholder.com`,
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                },
                {},
                {
                    Authorization: `Bearer ${token}`
                }
            );

            // Store phone for OTP verification
            this.registrationPhone = phone;

            return {
                customer: customer,
                message: "Customer registered successfully. OTP sent to phone."
            };
        } catch (err: any) {
            this.error = err.message;
            throw err;
        } finally {
            this.loading = false;
        }
    }

    /**
     * Verify OTP after registration using phone-auth provider
     */
    async verifyOTP(phone: string, otp: string) {
        this.loading = true;
        this.error = null;
        try {
            // Use SDK's login method with phone-auth provider (authenticate is called internally)
            await sdk.auth.login('customer', 'phone-auth', {
                phone: phone,
                otp: otp
            });

            // Clear registration phone after successful verification
            this.registrationPhone = null;

            // Fetch customer data after verification
            await this.fetchCustomer();

            return {
                message: "Phone number verified successfully"
            };
        } catch (err: any) {
            this.error = err.message;
            throw err;
        } finally {
            this.loading = false;
        }
    }

    /**
     * Legacy email-based registration (kept for backward compatibility if needed)
     */
    async registerLegacy(email: string, password: string, firstName: string, lastName: string) {
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