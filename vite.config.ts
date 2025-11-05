import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
    optimizeDeps: {
        include: ['@medusajs/js-sdk'],
        esbuildOptions: {
            target: 'esnext'
        }
    },
    ssr: {
        noExternal: ['@medusajs/js-sdk', '@medusajs/types']
    }
});