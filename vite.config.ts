import {paraglideVitePlugin} from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        sveltekit(),
        paraglideVitePlugin({
            project: './project.inlang',
            outdir: './src/lib/paraglide'
        })
    ],
    server: {
        allowedHosts: ['dev.znagti.ge']
    },
    optimizeDeps: {
        include: ['@medusajs/js-sdk'],
        esbuildOptions: {target: 'esnext'}
    },
    ssr: {
        noExternal: ['@medusajs/js-sdk', '@medusajs/types']
    }
});
