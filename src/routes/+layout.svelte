<script lang="ts">
    import {onMount} from 'svelte';
    import {cartStore} from '$lib/stores/cart.svelte';
    import {customerStore} from '$lib/stores/customer.svelte';
    import {setLocale} from '@/paraglide/runtime';
    import {browser} from '$app/environment';
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import Header from '@/components/header/Header.svelte';
    import Footer from '@/components/footer/Footer.svelte';
    import type {LayoutData} from './$types';

    let {children, data}: { children: any, data: LayoutData } = $props();

    onMount(async () => {
        // Initialize locale from localStorage if available
        if (browser) {
            const savedLocale = localStorage.getItem('preferred_locale');
            if (savedLocale && (savedLocale === 'en' || savedLocale === 'ka-ge')) {
                setLocale(savedLocale);
            }
        }

        await Promise.all([
            cartStore.initialize(),
            customerStore.initialize()
        ]);
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon}/>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col">
    <Header {...data.header}/>

    <main class="flex-1">
        {@render children()}
    </main>

    <Footer/>
</div>
