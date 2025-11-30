<script lang="ts">
    import {onMount} from 'svelte';
    import {cartStore} from '$lib/stores/cart.svelte';
    import {customerStore} from '$lib/stores/customer.svelte';
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import Header from "@/components/header/Header.svelte";

    let {children} = $props();

    onMount(async () => {
        await Promise.all([
            cartStore.initialize(),
            customerStore.initialize()
        ]);
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon}/>
</svelte:head>

<div class="min-h-screen bg-gray-50">
    <Header/>

    <main class="">
        {@render children()}
    </main>
</div>