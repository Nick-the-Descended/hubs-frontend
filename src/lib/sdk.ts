import Medusa from '@medusajs/js-sdk';
import {
    PUBLIC_MEDUSA_BACKEND_URL,
    PUBLIC_MEDUSA_PUBLISHABLE_KEY
} from '$env/static/public';

export const sdk = new Medusa({
    baseUrl: PUBLIC_MEDUSA_BACKEND_URL,
    debug: import.meta.env.DEV,
    publishableKey: PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    auth: {
        type: 'session'
    }
});
