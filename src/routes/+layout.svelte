<script lang="ts">
    import {onMount} from 'svelte';
    import {cartStore} from '$lib/stores/cart.svelte';
    import {customerStore} from '$lib/stores/customer.svelte';
    import {setLocale} from '@/paraglide/runtime';
    import {browser} from '$app/environment';
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import Header from '@/components/header/Header.svelte';

    let {children} = $props();

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

    let header = {
        promotionalBanner: 'Discount promotion/seasonal offer/....',
        logoUrl: '/logo.svg',
        logoAlt: 'HubsGe',
        navigationItems: [
            {label: 'ფან-მოპი', href: '/products/cleaning'},
            {label: 'ფიხტანი', href: '/products/fixtures'},
            {label: 'კალენი', href: '/products/stairs'},
            {label: 'ბრენდები', href: '/products/brands'},
            {label: 'მაგაზიები', href: '/stores'},
            {label: 'ქალი', href: '/products/women'},
            {label: 'ფიტდაკოსმეტი', href: '/products/fitness-cosmetics'},
            {label: 'აკულლები', href: '/products/accessories'}
        ]
    }
</script>

<svelte:head>
    <link rel="icon" href={favicon}/>
</svelte:head>

<div class="min-h-screen bg-gray-50">
    <Header {...header}/>

    <main class="">
        {@render children()}
    </main>
</div>
