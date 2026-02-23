import type { PageServerLoad } from './$types';

// Cart is managed client-side via cartStore (Medusa backend)
export const load: PageServerLoad = async () => {
    return {};
};
