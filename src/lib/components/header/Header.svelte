<script>
    import { cartStore } from '@/stores/cart.svelte';
    import { customerStore } from '@/stores/customer.svelte';
</script>

<header class="bg-white shadow">
    <nav
        class="container mx-auto flex items-center justify-between px-4 py-4"
    >
        <a href="/static" class="text-2xl font-bold">My Store</a>
        <div class="flex items-center gap-4">
            {#if customerStore.isAuthenticated}
                <a href="/account">
                    {customerStore.customer?.first_name || 'Account'}
                </a>
                <button
                    onclick={() => customerStore.logout()}
                    class="text-red-600"
                >
                    Logout
                </button>
            {:else}
                <a href="/auth/login">Login</a>
                <a href="/auth/register">Register</a>
            {/if}
            <a href="/cart" class="relative">
                Cart ({cartStore?.itemCount || 0})
            </a>
        </div>
    </nav>
</header>
